import { apiClient } from './apiClient';

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
  template_id?: string;
  scheduled_at?: string;
}

interface UpdateMessageData {
  content?: string;
  message_type?: string;
  media_url?: string;
  status?: string;
  metadata?: any;
}

interface ScheduledMessage {
  id: string;
  conversation_id: string;
  content: string;
  message_type: string;
  scheduled_at: Date;
  status: 'pending' | 'sent' | 'cancelled';
  created_by: string;
  created_at: Date;
}

interface ScheduledMessageListResponse {
  scheduledMessages: ScheduledMessage[];
  total: number;
  hasMore: boolean;
}

/**
 * Serviço para operações de mensagens
 */
export class MessageService {
  
  /**
   * Listar mensagens de uma conversa
   */
  async getMessages(conversationId: string, pagination?: {
    limit?: number;
    offset?: number;
    before?: string;
    after?: string;
  }): Promise<MessageListResponse> {
    try {
      console.log('🔍 [MessageService] Fazendo chamada para API - conversationId:', conversationId, 'pagination:', pagination);
      
      const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
        params: pagination
      } as any);
      
      console.log('🔍 [MessageService] Resposta da API:', {
        messagesCount: response.data.data.messages?.length || 0,
        total: response.data.data.total || 0,
        hasMore: response.data.data.hasMore || false,
        firstMessage: response.data.data.messages?.[0] ? {
          id: response.data.data.messages[0].id,
          content: response.data.data.messages[0].content?.substring(0, 50) + '...',
          sender_type: response.data.data.messages[0].sender_type
        } : null
      });
      
      return {
        messages: response.data.data.messages || [],
        total: response.data.data.total || 0,
        hasMore: response.data.data.hasMore || false
      };
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }
  
  /**
   * Enviar mensagem
   */
  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar mensagem
   */
  async updateMessage(messageId: string, data: UpdateMessageData): Promise<Message> {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      throw error;
    }
  }
  
  /**
   * Deletar mensagem
   */
  async deleteMessage(messageId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar status da mensagem
   */
  async updateMessageStatus(messageId: string, status: string): Promise<Message> {
    try {
      const response = await apiClient.put(`/messages/${messageId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
      throw error;
    }
  }
  
  /**
   * Simular mensagem de cliente
   */
  async simulateCustomerMessage(conversationId: string, data: {
    content: string;
    message_type?: string;
  }): Promise<Message> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/simulate-customer-message`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao simular mensagem de cliente:', error);
      throw error;
    }
  }
  
  /**
   * Upload de mídia
   */
  async uploadMedia(file: File, conversationId?: string): Promise<{
    url: string;
    filename: string;
    size: number;
    type: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }
      
      const response = await apiClient.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } as any);
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      throw error;
    }
  }
  
  /**
   * Listar mensagens agendadas
   */
  async getScheduledMessages(conversationId?: string, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<ScheduledMessageListResponse> {
    try {
      const params: any = { ...pagination };
      if (conversationId) {
        params.conversation_id = conversationId;
      }
      
      const response = await apiClient.get('/messages/scheduled', { params } as any);
      
      return {
        scheduledMessages: response.data.data.scheduledMessages || [],
        total: response.data.data.total || 0,
        hasMore: response.data.data.hasMore || false
      };
    } catch (error) {
      console.error('Erro ao buscar mensagens agendadas:', error);
      throw error;
    }
  }
  
  /**
   * Criar mensagem agendada
   */
  async createScheduledMessage(data: {
    conversation_id: string;
    content: string;
    message_type: string;
    scheduled_at: string;
    template_id?: string;
  }): Promise<ScheduledMessage> {
    try {
      const response = await apiClient.post('/messages/scheduled', data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar mensagem agendada:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar mensagem agendada
   */
  async updateScheduledMessage(scheduledMessageId: string, data: {
    content?: string;
    message_type?: string;
    scheduled_at?: string;
    template_id?: string;
  }): Promise<ScheduledMessage> {
    try {
      const response = await apiClient.put(`/messages/scheduled/${scheduledMessageId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atualizar mensagem agendada:', error);
      throw error;
    }
  }
  
  /**
   * Cancelar mensagem agendada
   */
  async cancelScheduledMessage(scheduledMessageId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/messages/scheduled/${scheduledMessageId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao cancelar mensagem agendada:', error);
      throw error;
    }
  }
  
  /**
   * Duplicar mensagem agendada
   */
  async duplicateScheduledMessage(scheduledMessageId: string): Promise<ScheduledMessage> {
    try {
      const response = await apiClient.post(`/messages/scheduled/${scheduledMessageId}/duplicate`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao duplicar mensagem agendada:', error);
      throw error;
    }
  }
  
  /**
   * Obter histórico de execuções de mensagem agendada
   */
  async getScheduledMessageHistory(scheduledMessageId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/messages/scheduled/${scheduledMessageId}/history`);
      return response.data.data.history || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de mensagem agendada:', error);
      throw error;
    }
  }
  
  /**
   * Processar mensagens agendadas agora
   */
  async processScheduledMessages(): Promise<any> {
    try {
      const response = await apiClient.post('/messages/scheduled/process');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao processar mensagens agendadas:', error);
      throw error;
    }
  }
  
  /**
   * Marcar mensagens como lidas
   */
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.put(`/conversations/${conversationId}/messages/read`);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de mensagens
   */
  async getMessageStats(conversationId?: string, dateRange?: {
    start: Date;
    end: Date;
  }): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    bySender: Record<string, number>;
  }> {
    try {
      const params: any = {};
      if (conversationId) {
        params.conversation_id = conversationId;
      }
      if (dateRange) {
        params.start_date = dateRange.start.toISOString();
        params.end_date = dateRange.end.toISOString();
      }
      
      const response = await apiClient.get('/messages/stats', { params } as any);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de mensagens:', error);
      throw error;
    }
  }
}

// Instância singleton do serviço
export const messageService = new MessageService();
