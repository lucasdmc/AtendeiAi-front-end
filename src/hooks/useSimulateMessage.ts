import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { messageKeys } from './useMessages';

// Hook para simular mensagem de cliente
export const useSimulateCustomerMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      message_type = 'text',
      media_url,
      media_filename,
      media_size,
      media_mime_type,
      reply_to,
      whatsapp_message_id
    }: {
      conversationId: string;
      content: string;
      message_type?: 'text' | 'image' | 'document' | 'audio';
      media_url?: string;
      media_filename?: string;
      media_size?: number;
      media_mime_type?: string;
      reply_to?: string;
      whatsapp_message_id?: string;
    }) => {
      const response = await apiService.simulateCustomerMessage(conversationId, {
        content,
        message_type,
        media_url,
        media_filename,
        media_size,
        media_mime_type,
        reply_to,
        whatsapp_message_id,
      });
      return { ...response.data, conversationId };
    },
    onSuccess: (newMessage, variables) => {
      const conversationId = newMessage.conversationId || variables.conversationId;
      const queryKey = messageKeys.list(conversationId, { limit: 50 });

      // Invalidar mensagens para refetch
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
            unread_count: (oldData.unread_count || 0) + 1,
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
                    unread_count: (conv.unread_count || 0) + 1,
                  }
                : conv
            )
          };
        }
      );
    },
    onError: (error) => {
      console.error('Erro ao simular mensagem do cliente:', error);
    },
  });
};
