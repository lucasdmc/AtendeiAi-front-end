import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface MarkAsReadPayload {
  messageIds: string[];
  conversationId: string;
  sessionId: string;
}

interface MarkAsPlayedPayload {
  messageId: string;
  sessionId: string;
}

interface ReceiptResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Hook para marcar mensagens como lidas
 */
export const useMarkAsRead = () => {
  return useMutation<ReceiptResponse, Error, MarkAsReadPayload>({
    mutationFn: async (payload) => {
      const response = await (apiService as any).request('/receipts/read', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Mensagens marcadas como lidas:', {
        count: variables.messageIds.length,
        conversationId: variables.conversationId,
        result: data
      });
    },
    onError: (error, variables) => {
      console.error('❌ Erro ao marcar mensagens como lidas:', {
        error: error.message,
        messageIds: variables.messageIds,
        conversationId: variables.conversationId
      });
    }
  });
};

/**
 * Hook para marcar áudio como reproduzido
 */
export const useMarkAsPlayed = () => {
  return useMutation<ReceiptResponse, Error, MarkAsPlayedPayload>({
    mutationFn: async (payload) => {
      const response = await (apiService as any).request('/receipts/played', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response;
    },
    onSuccess: (data, variables) => {
      console.log('🎵 Áudio marcado como reproduzido:', {
        messageId: variables.messageId,
        result: data
      });
    },
    onError: (error, variables) => {
      console.error('❌ Erro ao marcar áudio como reproduzido:', {
        error: error.message,
        messageId: variables.messageId
      });
    }
  });
};

/**
 * Hook para forçar delivery receipt
 */
export const useForceDeliveryReceipt = () => {
  return useMutation<ReceiptResponse, Error, { messageId: string; sessionId: string }>({
    mutationFn: async (payload) => {
      const response = await (apiService as any).request('/receipts/delivery', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response;
    },
    onSuccess: (data, variables) => {
      console.log('📨 Delivery receipt forçado:', {
        messageId: variables.messageId,
        result: data
      });
    },
    onError: (error, variables) => {
      console.error('❌ Erro ao forçar delivery receipt:', {
        error: error.message,
        messageId: variables.messageId
      });
    }
  });
};

/**
 * Função utilitária para obter sessionId da conversa
 */
export const getSessionIdFromConversation = (conversation: any): string => {
  // Assumindo que o sessionId está disponível na conversa
  // Ajustar conforme a estrutura real dos dados
  return conversation.session_id || 'wa_1758558718192_hdf4ulzt9'; // fallback para desenvolvimento
};

/**
 * Função utilitária para extrair messageIds de mensagens não lidas
 */
export const getUnreadMessageIds = (messages: any[]): string[] => {
  return messages
    .filter(msg => 
      msg.sender_type === 'customer' && // Apenas mensagens recebidas
      msg.status !== 'read' && // Não lidas
      msg.message_id // Tem ID válido
    )
    .map(msg => msg.message_id);
};

/**
 * Função utilitária para verificar se mensagem é áudio
 */
export const isAudioMessage = (message: any): boolean => {
  return ['audio', 'voice', 'ptt'].includes(message.message_type);
};
