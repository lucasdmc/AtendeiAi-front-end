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
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiService.getMessages(conversationId, {
        ...params,
        offset: pageParam,
      });
      return response.data;
    },
    enabled: !!conversationId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        // Calcular offset para próxima página
        const currentOffset = allPages.reduce((total, page) => total + page.messages.length, 0);
        return currentOffset;
      }
      return undefined;
    },
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
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
      // Usar o mesmo queryKey que o useMessages usa (com parâmetros)
      const queryKey = messageKeys.list(variables.conversationId, { limit: 50 });
      
      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey });

      // Snapshot do estado anterior
      const previousMessages = queryClient.getQueryData(queryKey);

      // Criar mensagem otimista
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
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

      // Apenas invalidar mensagens para esta conversa específica
      queryClient.invalidateQueries({
        queryKey,
        exact: true,
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
    onError: (error, variables, context) => {
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
