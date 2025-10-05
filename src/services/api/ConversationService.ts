import { apiClient } from './apiClient';
import { DEFAULT_AGENT_ID } from '../../constants/auth';

// Interfaces
interface Conversation {
  id: string;
  clinic_id: string;
  customer_name: string;
  customer_phone: string;
  status: 'active' | 'closed' | 'archived';
  assigned_user_id?: string;
  last_message?: {
    content: string;
    timestamp: Date;
    sender_type: string;
  };
  unread_count: number;
  flags: any[];
  current_session_id?: string;
  created_at: Date;
  updated_at: Date;
}

interface ConversationFilters {
  clinic_id: string;
  status?: 'active' | 'closed' | 'archived';
  assigned_to?: string;
  search?: string;
  tab?: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
  agent_id?: string;
  sector_id?: string;
  limit?: string;
  offset?: string;
  include_counters?: string;
}

interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
}

interface TabCounters {
  bot: number;
  entrada: number;
  aguardando: number;
  em_atendimento: number;
  finalizadas: number;
}

interface ConversationDetailsResponse {
  conversation: Conversation;
  activeSession?: any;
  sessionHistory?: any[];
  messages?: any[];
}

interface AssignConversationData {
  agentId: string;
  reason?: string;
}

interface TransferConversationData {
  agentId?: string;
  sectorId?: string;
  reason?: string;
}

interface CloseConversationData {
  reason?: string;
  feedback?: string;
  closedBy?: string;
}

interface ApplyFlagData {
  flagId: string;
}

/**
 * Serviço para operações de conversas
 */
export class ConversationService {
  
  /**
   * Listar conversas com filtros
   */
  async getConversations(filters: ConversationFilters): Promise<ConversationListResponse> {
    try {
      console.log('🔍 [ConversationService] Fazendo chamada para API com filtros:', filters);
      
      const response = await apiClient.get('/conversations', {
        params: filters
      } as any);
      
      console.log('🔍 [ConversationService] Resposta da API:', {
        conversationsCount: response.data.data.conversations?.length || 0,
        total: response.data.data.total || 0,
        hasMore: response.data.data.hasMore || false,
        firstConversation: response.data.data.conversations?.[0] ? {
          _id: response.data.data.conversations[0]._id,
          status: response.data.data.conversations[0].status,
          customer_name: response.data.data.conversations[0].customer_name
        } : null
      });
      
      return {
        conversations: response.data.data.conversations || [],
        total: response.data.data.total || 0,
        hasMore: response.data.data.hasMore || false
      };
    } catch (error) {
      console.error('❌ [ConversationService] Erro ao buscar conversas:', error);
      throw error;
    }
  }
  
  /**
   * Obter detalhes de uma conversa
   */
  async getConversation(conversationId: string): Promise<ConversationDetailsResponse> {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}`);
      
      return {
        conversation: response.data.data.conversation,
        activeSession: response.data.data.activeSession,
        sessionHistory: response.data.data.sessionHistory,
        messages: response.data.data.messages
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes da conversa:', error);
      throw error;
    }
  }
  
  /**
   * Atualizar conversa
   */
  async updateConversation(conversationId: string, data: Partial<Conversation>): Promise<Conversation> {
    try {
      const response = await apiClient.put(`/conversations/${conversationId}`, data);
      return response.data.data.conversation;
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      throw error;
    }
  }
  
  /**
   * Atribuir conversa
   */
  async assignConversation(conversationId: string, data: AssignConversationData): Promise<any> {
    try {
      const response = await apiClient.put(`/conversations/${conversationId}/assign`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error);
      throw error;
    }
  }
  
  /**
   * Transferir conversa
   */
  async transferConversation(conversationId: string, data: TransferConversationData): Promise<any> {
    try {
      const response = await apiClient.put(`/conversations/${conversationId}/transfer`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao transferir conversa:', error);
      throw error;
    }
  }
  
  /**
   * Fechar conversa
   */
  async closeConversation(conversationId: string, data: CloseConversationData): Promise<any> {
    try {
      const response = await apiClient.put(`/conversations/${conversationId}/close`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao fechar conversa:', error);
      throw error;
    }
  }
  
  /**
   * Aplicar flag
   */
  async applyFlag(conversationId: string, data: ApplyFlagData): Promise<any> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/flags`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao aplicar flag:', error);
      throw error;
    }
  }
  
  /**
   * Remover flag
   */
  async removeFlag(conversationId: string, flagId: string): Promise<any> {
    try {
      const response = await apiClient.delete(`/conversations/${conversationId}/flags/${flagId}`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao remover flag:', error);
      throw error;
    }
  }
  
  /**
   * Assume uma conversa (ROUTING → ASSIGNED)
   */
  async assumeConversation(conversationId: string): Promise<any> {
    try {
      console.log('🔍 [ConversationService] Assumindo conversa:', conversationId);
      
      const response = await apiClient.put(`/conversations/${conversationId}/assume`, {
        agent_id: DEFAULT_AGENT_ID // TODO: Pegar do contexto de autenticação
      });
      
      console.log('🔍 [ConversationService] Conversa assumida:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ConversationService] Erro ao assumir conversa:', error);
      throw error;
    }
  }

  /**
   * Inicia o atendimento (ASSIGNED → IN_PROGRESS)
   */
  async startHandling(conversationId: string): Promise<any> {
    try {
      console.log('🔍 [ConversationService] Iniciando atendimento:', conversationId);
      
      const response = await apiClient.put(`/conversations/${conversationId}/start-handling`, {
        agent_id: DEFAULT_AGENT_ID // TODO: Pegar do contexto de autenticação
      });
      
      console.log('🔍 [ConversationService] Atendimento iniciado:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ConversationService] Erro ao iniciar atendimento:', error);
      throw error;
    }
  }

  /**
   * Obter contadores por aba
   */
  async getTabCounters(clinicId: string): Promise<TabCounters> {
    try {
      const response = await apiClient.get('/conversations', {
        params: {
          clinic_id: clinicId,
          include_counters: 'true'
        }
      } as any);
      
      return response.data.data.counters || {
        bot: 0,
        entrada: 0,
        aguardando: 0,
        em_atendimento: 0,
        finalizadas: 0
      };
    } catch (error) {
      console.error('Erro ao buscar contadores:', error);
      throw error;
    }
  }
  
  /**
   * Criar nova conversa
   */
  async createConversation(data: {
    clinic_id: string;
    customer_phone: string;
    customer_name?: string;
    initial_message?: string;
  }): Promise<Conversation> {
    try {
      const response = await apiClient.post('/conversations', data);
      return response.data.data.conversation;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      throw error;
    }
  }
  
  /**
   * Marcar conversa como lida
   */
  async markAsRead(conversationId: string): Promise<any> {
    try {
      const response = await apiClient.put(`/conversations/${conversationId}/mark-read`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
      throw error;
    }
  }
  
  /**
   * Obter histórico de sessões
   */
  async getSessionHistory(conversationId: string, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<any> {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}/sessions`, {
        params: pagination
      } as any);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de sessões:', error);
      throw error;
    }
  }
  
  /**
   * Criar nova sessão
   */
  async createSession(conversationId: string, data: {
    agent_id?: string;
    sector_id?: string;
    bot_id?: string;
    initial_state?: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/sessions`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }
}

// Instância singleton do serviço
export const conversationService = new ConversationService();
