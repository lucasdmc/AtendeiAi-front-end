import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiService, Message } from '../services/api';

// Chaves de query para React Query
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (conversationId: string, params?: Record<string, any>) =>
    [...messageKeys.lists(), conversationId, params] as const,
  details: () => [...messageKeys.all, 'detail'] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
};

// Hook para buscar mensagens com paginação infinita
export const useMessages = (
  conversationId: string,
  params: {
    limit?: number;
  } = {}
) => {
  return useInfiniteQuery({
    queryKey: messageKeys.list(conversationId, params),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🔍 Buscando mensagens via API para conversa:', conversationId, 'offset:', pageParam);
      const response = await apiService.getMessages(conversationId, {
        ...params,
        offset: pageParam as number,
      });
      console.log('✅ Mensagens recebidas:', (response.data as any)?.messages?.length || 0, 'itens');
      return response.data;
    },
    // Forçar atualização quando o cache for invalidado
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
    enabled: !!conversationId,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (lastPage?.hasMore) {
        // Calcular offset para próxima página
        const currentOffset = allPages.reduce((total, page: any) => total + (page?.messages?.length || 0), 0);
        return currentOffset;
      }
      return undefined;
    },
    staleTime: 0, // Sempre considerar stale para permitir invalidação
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    // Removido polling agressivo - será atualizado apenas quando necessário
  });
};

// Hook para buscar mensagens de uma conversa (versão simples sem paginação infinita)
export const useMessagesSimple = (
  conversationId: string,
  params: {
    limit?: number;
    offset?: number;
    before?: string;
    after?: string;
  } = {}
) => {
  return useQuery({
    queryKey: messageKeys.list(conversationId, params),
    queryFn: async () => {
      const response = await apiService.getMessages(conversationId, params);
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
    // Removido polling agressivo - será atualizado apenas quando necessário
  });
};

// Hook para enviar áudio
export const useSendAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      audioBlob,
      reply_to,
      scheduled_at
    }: {
      conversationId: string;
      audioBlob: Blob;
      reply_to?: string;
      scheduled_at?: string;
    }) => {
      const response = await apiService.sendAudioMessage(conversationId, audioBlob, {
        reply_to,
        scheduled_at,
      });
      return { ...response.data, conversationId };
    },
    onSuccess: (newMessage, variables) => {
      const conversationId = newMessage.conversationId || variables.conversationId;

      console.log('🎵 Áudio enviado com sucesso. Atualizando cache:', {
        newMessage,
        conversationId,
        hasMediaUrl: !!newMessage.media_url,
        media_url: newMessage.media_url,
        message_type: newMessage.message_type
      });

      // Em vez de invalidar, vamos adicionar a mensagem diretamente ao cache
      queryClient.setQueryData(
        messageKeys.list(conversationId, { limit: 50 }),
        (oldData: any) => {
          if (!oldData) return oldData;

          // Adicionar a nova mensagem ao início da lista
          const newMessages = [newMessage, ...oldData.messages];

          return {
            ...oldData,
            messages: newMessages
          };
        }
      );

      // Para mensagens de áudio, usar o conteúdo correto baseado na resposta do backend
      const lastMessageContent = newMessage.media_url ? '[Áudio]' : (newMessage.content || '[Áudio]');

      // Atualizar cache da conversa
      queryClient.setQueryData(
        ['conversations', 'detail', conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            last_message: {
              content: lastMessageContent,
              timestamp: newMessage.timestamp,
              sender_type: newMessage.sender_type,
            },
            updated_at: newMessage.timestamp,
          };
        }
      );

      // Atualizar lista de conversas
      queryClient.setQueriesData(
        { queryKey: ['conversations', 'list'] },
        (oldData: any) => {
          if (!oldData?.conversations) return oldData;

          return {
            ...oldData,
            conversations: oldData.conversations.map((conv: any) =>
              conv._id === conversationId
                ? {
                    ...conv,
                    last_message: {
                      content: lastMessageContent,
                      timestamp: newMessage.timestamp,
                      sender_type: newMessage.sender_type,
                    },
                    updated_at: newMessage.timestamp,
                  }
                : conv
            )
          };
        }
      );
    },
    onError: (error) => {
      console.error('Erro ao enviar áudio:', error);
    },
  });
};

// Hook para enviar mensagem
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      message_type = 'text',
      reply_to,
      template_id,
      scheduled_at
    }: {
      conversationId: string;
      content: string;
      message_type?: 'text' | 'image' | 'document' | 'audio';
      reply_to?: string;
      template_id?: string;
      scheduled_at?: string;
    }) => {
      const response = await apiService.sendMessage(conversationId, {
        content,
        message_type,
        reply_to,
        template_id,
        scheduled_at,
      });
      return { ...response.data, conversationId };
    },
    onMutate: async (variables) => {
      // Usar exatamente a mesma queryKey que o useMessages usa
      const queryKey = messageKeys.list(variables.conversationId, { limit: 50 });
      
      console.log('🔄 onMutate: Query key sendo usada:', queryKey);
      
      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey });

      // Snapshot do estado anterior
      const previousMessages = queryClient.getQueryData(queryKey);

      // Criar mensagem otimista com ID único baseado no conteúdo e timestamp
      const optimisticId = `temp-${Date.now()}-${variables.content.substring(0, 10)}`;
      const optimisticMessage = {
        _id: optimisticId,
        conversation_id: variables.conversationId,
        sender_type: 'human' as const,
        sender_id: 'current-user',
        content: variables.content,
        message_type: variables.message_type || 'text',
        status: 'sending' as const,
        timestamp: new Date().toISOString(),
      };
      // Atualizar cache otimisticamente
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          // Para useInfiniteQuery
          const newPages = [...old.pages];
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              messages: [...newPages[0].messages, optimisticMessage]
            };
          }
          return { ...old, pages: newPages };
        } else if (old.messages) {
          // Para query simples
          return {
            ...old,
            messages: [...old.messages, optimisticMessage]
          };
        }
        return old;
      });

      return { previousMessages, optimisticMessage, queryKey };
    },
    onSuccess: (newMessage, variables, context) => {
      const conversationId = newMessage.conversationId || variables.conversationId;
      const queryKey = messageKeys.list(conversationId, { limit: 50 });

      console.log('🔄 onSuccess: Substituindo mensagem otimista pela real:', {
        optimisticId: context?.optimisticMessage?._id,
        realId: newMessage._id,
        content: newMessage.content,
        queryKey: queryKey
      });

      // Verificar se a query existe no cache
      const currentData = queryClient.getQueryData(queryKey);
      console.log('🔍 Dados atuais no cache:', currentData ? 'EXISTEM' : 'NÃO EXISTEM');

      // Atualizar cache diretamente com a mensagem real do servidor
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        if (old.pages) {
          // Para useInfiniteQuery - substituir mensagem otimista pela real
          const newPages = [...old.pages];
          if (newPages.length > 0) {
            console.log('🔍 Mensagens antes da substituição:', newPages[0].messages.map((m: any) => ({ id: m._id, content: m.content })));
            
            // Substituir mensagem otimista pela real
            let messageReplaced = false;
            newPages[0] = {
              ...newPages[0],
              messages: newPages[0].messages.map((msg: any) => {
                if (msg._id === context?.optimisticMessage?._id) {
                  console.log('✅ Substituindo mensagem otimista:', msg._id, '→', newMessage._id);
                  messageReplaced = true;
                  return newMessage;
                }
                return msg;
              })
            };

            if (!messageReplaced) {
              console.log('⚠️ Mensagem otimista não encontrada para substituição, removendo duplicatas por conteúdo');
              // Se não encontrou a otimista, remover duplicatas por conteúdo
              const uniqueMessages = [];
              const seen = new Set();
              
              for (const msg of [...newPages[0].messages, newMessage]) {
                const key = `${msg.content}-${msg.sender_type}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  uniqueMessages.push(msg);
                }
              }
              
              newPages[0] = {
                ...newPages[0],
                messages: uniqueMessages
              };
            }

            console.log('🔍 Mensagens após substituição:', newPages[0].messages.map((m: any) => ({ id: m._id, content: m.content })));
          }
          return { ...old, pages: newPages };
        } else if (old.messages) {
          // Para query simples - substituir mensagem otimista pela real
          console.log('🔍 Mensagens antes da substituição (simple):', old.messages.map((m: any) => ({ id: m._id, content: m.content })));
          
          let messageReplaced = false;
          const updatedMessages = old.messages.map((msg: any) => {
            if (msg._id === context?.optimisticMessage?._id) {
              console.log('✅ Substituindo mensagem otimista (simple):', msg._id, '→', newMessage._id);
              messageReplaced = true;
              return newMessage;
            }
            return msg;
          });

          if (!messageReplaced) {
            console.log('⚠️ Mensagem otimista não encontrada para substituição (simple), removendo duplicatas por conteúdo');
            // Se não encontrou a otimista, remover duplicatas por conteúdo
            const uniqueMessages = [];
            const seen = new Set();
            
            for (const msg of [...updatedMessages, newMessage]) {
              const key = `${msg.content}-${msg.sender_type}`;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueMessages.push(msg);
              }
            }
            
            return {
              ...old,
              messages: uniqueMessages
            };
          }

          console.log('🔍 Mensagens após substituição (simple):', updatedMessages.map((m: any) => ({ id: m._id, content: m.content })));
          return {
            ...old,
            messages: updatedMessages
          };
        }
        return old;
      });

      // Atualizar cache da conversa diretamente
      queryClient.setQueryData(
        ['conversations', 'detail', conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            last_message: {
              content: newMessage.content,
              timestamp: newMessage.timestamp,
              sender_type: newMessage.sender_type,
            },
            updated_at: newMessage.timestamp,
          };
        }
      );

      // Atualizar cache da lista de conversas diretamente
      queryClient.setQueriesData(
        { queryKey: ['conversations', 'list'] },
        (oldData: any) => {
          if (!oldData?.conversations) return oldData;
          
          return {
            ...oldData,
            conversations: oldData.conversations.map((conv: any) => 
              conv._id === conversationId 
                ? {
                    ...conv,
                    last_message: {
                      content: newMessage.content,
                      timestamp: newMessage.timestamp,
                      sender_type: newMessage.sender_type,
                    },
                    updated_at: newMessage.timestamp,
                  }
                : conv
            )
          };
        }
      );
    },
    onError: (error, _variables, context) => {
      console.error('Erro ao enviar mensagem:', error);

      // Reverter cache para estado anterior
      if (context?.previousMessages && context?.queryKey) {
        queryClient.setQueryData(
          context.queryKey,
          context.previousMessages
        );
      }
    },
  });
};

// Hook para atualizar status da mensagem
export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status
    }: {
      id: string;
      status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    }) => {
      const response = await apiService.updateMessageStatus(id, status);
      return response.data;
    },
    onSuccess: (updatedMessage) => {
      // Atualizar cache das mensagens
      queryClient.setQueryData(
        messageKeys.list(updatedMessage.conversation_id),
        (oldData: any) => {
          if (!oldData) return oldData;

          // Se for paginação infinita
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: Message) =>
                  msg._id === updatedMessage._id ? updatedMessage : msg
                ),
              })),
            };
          }

          // Se for query simples
          if (oldData.messages) {
            return {
              ...oldData,
              messages: oldData.messages.map((msg: Message) =>
                msg._id === updatedMessage._id ? updatedMessage : msg
              ),
            };
          }

          return oldData;
        }
      );
    },
  });
};

// Hook para deletar mensagem
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Como não temos endpoint de delete ainda, vamos simular
      // await apiService.deleteMessage(id);
      return { id };
    },
    onSuccess: (result) => {
      // Remover mensagem do cache
      queryClient.setQueryData(
        messageKeys.lists(),
        (oldData: any) => {
          if (!oldData) return oldData;

          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.filter((msg: Message) => msg._id !== result.id),
              })),
            };
          }

          if (oldData.messages) {
            return {
              ...oldData,
              messages: oldData.messages.filter((msg: Message) => msg._id !== result.id),
            };
          }

          return oldData;
        }
      );
    },
  });
};

// Hook para marcar mensagens como lidas
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Buscar mensagens não lidas
      const messagesQuery = queryClient.getQueryData(
        messageKeys.list(conversationId)
      ) as any;

      if (!messagesQuery) return { conversationId };

      const unreadMessages: Message[] = [];

      if (messagesQuery.pages) {
        // Paginação infinita
        messagesQuery.pages.forEach((page: any) => {
          page.messages.forEach((msg: Message) => {
            if (msg.sender_type === 'customer' && msg.status !== 'read') {
              unreadMessages.push(msg);
            }
          });
        });
      } else if (messagesQuery.messages) {
        // Query simples
        messagesQuery.messages.forEach((msg: Message) => {
          if (msg.sender_type === 'customer' && msg.status !== 'read') {
            unreadMessages.push(msg);
          }
        });
      }

      // Marcar como lidas via API (simulação)
      await Promise.all(
        unreadMessages.map(msg =>
          apiService.updateMessageStatus(msg._id, 'read')
        )
      );

      return { conversationId, messagesUpdated: unreadMessages.length };
    },
    onSuccess: (result) => {
      // Atualizar status das mensagens no cache
      queryClient.setQueryData(
        messageKeys.list(result.conversationId),
        (oldData: any) => {
          if (!oldData) return oldData;

          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: Message) => ({
                  ...msg,
                  status: msg.sender_type === 'customer' && msg.status !== 'read' ? 'read' : msg.status,
                  read_at: msg.sender_type === 'customer' && msg.status !== 'read' ? new Date().toISOString() : msg.read_at,
                })),
              })),
            };
          }

          if (oldData.messages) {
            return {
              ...oldData,
              messages: oldData.messages.map((msg: Message) => ({
                ...msg,
                status: msg.sender_type === 'customer' && msg.status !== 'read' ? 'read' : msg.status,
                read_at: msg.sender_type === 'customer' && msg.status !== 'read' ? new Date().toISOString() : msg.read_at,
              })),
            };
          }

          return oldData;
        }
      );

      // Atualizar conversa (zerar unread_count)
      queryClient.setQueryData(
        ['conversations', 'detail', result.conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, unread_count: 0 };
        }
      );

      // Atualizar cache da lista de conversas diretamente
      queryClient.setQueriesData(
        { queryKey: ['conversations', 'list'] },
        (oldData: any) => {
          if (!oldData?.conversations) return oldData;
          
          return {
            ...oldData,
            conversations: oldData.conversations.map((conv: any) => 
              conv._id === result.conversationId 
                ? { ...conv, unread_count: 0 }
                : conv
            )
          };
        }
      );
    },
  });
};
