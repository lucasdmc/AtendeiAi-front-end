import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { messageService } from '../services/api/MessageService';
import { useWebSocket } from './useWebSocket';

// Interfaces
interface Message {
  id: string;
  conversation_id: string;
  session_id?: string;
  sender_type: 'customer' | 'bot' | 'human';
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  reply_to?: string;
  media_url?: string;
  metadata?: any;
}

interface MessageListResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

interface SendMessageData {
  content: string;
  message_type?: 'text' | 'image' | 'audio' | 'video' | 'document';
  reply_to?: string;
  media_url?: string;
}

/**
 * Hook para gerenciar mensagens com cache inteligente e tempo real
 */
export function useMessages(conversationId: string) {
  console.log('🔍 [useMessages] Hook chamado com conversationId:', conversationId);
  
  const queryClient = useQueryClient();
  const { socket, isConnected } = useWebSocket({ roomId: conversationId, roomType: 'conversation' });
  
  // Estado local
  const [isPending, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Chave de cache
  const queryKey = useMemo(() => ['messages', conversationId], [conversationId]);
  
  // Query principal com paginação infinita
  const {
    data,
    error: queryError,
    isPending: queryLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🔍 [useMessages] Fazendo query para conversationId:', conversationId, 'pageParam:', pageParam);
      
      if (!conversationId) {
        console.log('🔍 [useMessages] conversationId vazio, retornando dados vazios');
        return {
          messages: [],
          total: 0,
          hasMore: false
        };
      }
      
      const response = await messageService.getMessages(conversationId, {
        limit: 50,
        offset: pageParam
      });
      
      console.log('🔍 [useMessages] Resposta recebida:', {
        messagesCount: response.messages.length,
        total: response.total,
        hasMore: response.hasMore,
        firstMessage: response.messages[0] ? {
          id: response.messages[0].id,
          content: response.messages[0].content?.substring(0, 50) + '...',
          sender_type: response.messages[0].sender_type
        } : null
      });
      
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const totalLoaded = allPages.reduce((acc, page: any) => acc + page.messages.length, 0);
      return lastPage.hasMore ? totalLoaded : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!conversationId
  });
  
  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessageData) => {
      return await messageService.sendMessage(conversationId, messageData);
    },
    onMutate: async (newMessage) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot do estado anterior
      const previousData = queryClient.getQueryData(queryKey);
      
      // Otimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_type: 'human',
        sender_id: 'current-user', // TODO: pegar do contexto de auth
        content: newMessage.content,
        message_type: newMessage.message_type || 'text',
        status: 'sent',
        timestamp: new Date(),
        reply_to: newMessage.reply_to,
        media_url: newMessage.media_url
      };
      
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.pages) return oldData;

          return {
            ...oldData,
          pages: oldData.pages.map((page: MessageListResponse, index: number) => {
            if (index === 0) {
              return {
                ...page,
                messages: [...page.messages, optimisticMessage],
                total: page.total + 1
              };
            }
            return page;
          })
        };
      });
      
      return { previousData };
    },
    onError: (err, _, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    },
    onSuccess: (data) => {
      // Remover mensagem otimista e adicionar a real
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.pages) return oldData;

          return {
            ...oldData,
          pages: oldData.pages.map((page: MessageListResponse) => ({
            ...page,
            messages: page.messages.map(msg => 
              msg.id.startsWith('temp-') ? data : msg
            )
          }))
        };
      });
    },
    onSettled: () => {
      // Refetch para garantir consistência
      queryClient.invalidateQueries({ queryKey });
    }
  });
  
  // Mutation para atualizar mensagem
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, updates }: { messageId: string; updates: Partial<Message> }) => {
      return await messageService.updateMessage(messageId, updates);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
          return {
          ...oldData,
          pages: oldData.pages.map((page: MessageListResponse) => ({
            ...page,
            messages: page.messages.map(msg => 
              msg.id === data.id ? { ...msg, ...data } : msg
            )
          }))
        };
      });
    }
  });
  
  // Mutation para deletar mensagem
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await messageService.deleteMessage(messageId);
    },
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: MessageListResponse) => ({
            ...page,
            messages: page.messages.filter(msg => msg.id !== messageId),
            total: Math.max(0, page.total - 1)
          }))
        };
      });
    }
  });
  
  // Combinar dados de todas as páginas
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.messages);
  }, [data]);
  
  // Total de mensagens
  const total = useMemo(() => {
    return data?.pages?.[0]?.total || 0;
  }, [data]);
  
  // Estado de loading combinado
  const combinedLoading = isPending || queryLoading;
  
  // Estado de erro combinado
  const combinedError = error || queryError;
  
  // Função para carregar mais mensagens (histórico)
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Função para enviar mensagem
  const sendMessage = useCallback(async (messageData: SendMessageData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await sendMessageMutation.mutateAsync(messageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  }, [sendMessageMutation]);
  
  // Função para atualizar mensagem
  const updateMessage = useCallback(async (messageId: string, updates: Partial<Message>) => {
    try {
      await updateMessageMutation.mutateAsync({ messageId, updates });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar mensagem');
    }
  }, [updateMessageMutation]);
  
  // Função para deletar mensagem
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar mensagem');
    }
  }, [deleteMessageMutation]);
  
  // Função para iniciar digitação
  const startTyping = useCallback(() => {
    if (socket && isConnected) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId });
    }
  }, [socket, isConnected, conversationId]);
  
  // Função para parar digitação
  const stopTyping = useCallback(() => {
    if (socket && isConnected) {
      setIsTyping(false);
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket, isConnected, conversationId]);
  
  // Função para adicionar mensagem
  const addMessage = useCallback((message: Message) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: MessageListResponse, index: number) => {
          if (index === 0) {
            return {
              ...page,
              messages: [...page.messages, message],
              total: page.total + 1
            };
          }
          return page;
        })
      };
    });
  }, [queryClient, queryKey]);
  
  // Função para atualizar mensagem específica
  const updateMessageInCache = useCallback((messageId: string, updates: Partial<Message>) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      
          return {
            ...oldData,
        pages: oldData.pages.map((page: MessageListResponse) => ({
          ...page,
          messages: page.messages.map(msg => 
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }))
      };
    });
  }, [queryClient, queryKey]);
  
  // Escutar eventos WebSocket
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;
    
    // Evento: Nova mensagem
    const handleNewMessage = (data: { 
      conversationId: string; 
      message: Message 
    }) => {
      if (data.conversationId === conversationId) {
        addMessage(data.message);
      }
    };
    
    // Evento: Mensagem atualizada
    const handleMessageUpdated = (data: { 
      conversationId: string; 
      messageId: string; 
      updates: Partial<Message> 
    }) => {
      if (data.conversationId === conversationId) {
        updateMessageInCache(data.messageId, data.updates);
      }
    };
    
    // Evento: Mensagem deletada
    const handleMessageDeleted = (data: { 
      conversationId: string; 
      messageId: string 
    }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: MessageListResponse) => ({
              ...page,
              messages: page.messages.filter(msg => msg.id !== data.messageId),
              total: Math.max(0, page.total - 1)
            }))
          };
        });
      }
    };
    
    // Evento: Usuário começou a digitar
    const handleTypingStart = (data: { 
      conversationId: string; 
      userId: string; 
      userName: string 
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    };
    
    // Evento: Usuário parou de digitar
    const handleTypingStop = (data: { 
      conversationId: string; 
      userId: string 
    }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };
    
    // Registrar listeners
    socket.on('message_received', handleNewMessage);
    socket.on('message_sent', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    
    // Cleanup
    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('message_sent', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, isConnected, conversationId, addMessage, updateMessageInCache, queryClient, queryKey]);
  
  // Refetch automático quando reconectar
  useEffect(() => {
    if (isConnected && !isRefetching) {
      refetch();
    }
  }, [isConnected, isRefetching, refetch]);
  
  // Auto-scroll para última mensagem quando adicionar nova
  useEffect(() => {
    if (messages.length > 0) {
      // TODO: Implementar auto-scroll
    }
  }, [messages.length]);
  
            return {
    // Dados
    messages,
    total,
    
    // Estados
    isPending: combinedLoading,
    error: combinedError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
    isTyping,
    typingUsers,
    
    // Mutations
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    
    // Ações
    loadMore,
    sendMessage,
    updateMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    refetch,
    
    // Utilitários
    isEmpty: messages.length === 0,
    hasData: messages.length > 0,
    canLoadMore: hasNextPage && !isFetchingNextPage,
    lastMessage: messages[messages.length - 1],
    firstMessage: messages[0]
  };
}

// Exportar query keys para uso em outros hooks
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (conversationId: string, filters?: any) => [...messageKeys.lists(), conversationId, filters] as const,
  details: () => [...messageKeys.all, 'detail'] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
};

// Hook para enviar mensagem (exportado separadamente)
export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { content: string; messageType?: 'text' | 'image' | 'audio' | 'video' | 'document'; replyTo?: string; media?: File }) => 
      messageService.sendMessage(conversationId, {
        content: data.content,
        message_type: data.messageType,
        reply_to: data.replyTo,
        media_url: data.media ? URL.createObjectURL(data.media) : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    }
  });
};

// Hook para enviar áudio (exportado separadamente)
export const useSendAudio = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audioFile: File) => 
      messageService.sendMessage(conversationId, {
        content: '',
        message_type: 'audio',
        media_url: URL.createObjectURL(audioFile)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
    }
  });
};

// Hook para marcar mensagens como lidas (exportado separadamente)
export const useMarkMessagesAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => messageService.markMessagesAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};