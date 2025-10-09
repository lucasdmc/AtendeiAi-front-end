// Service para gerenciar Channels
import { Channel } from '@/types/chatbot';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface CreateChannelRequest {
  name: string;
  type: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'sms';
  config?: any;
}

export interface AssociateSessionRequest {
  session_id: string;
  session_type: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'sms';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ChannelsService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      mode: 'cors',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido na requisição');
    }
  }

  // Listar canais
  async list(institutionId: string): Promise<Channel[]> {
    const response = await this.request<ApiResponse<{ items: Channel[], total: number, page: number, limit: number, pages: number }>>(`/channels?institution_id=${institutionId}`);
    return response.data?.items || [];
  }

  // Criar canal
  async create(channelData: CreateChannelRequest, institutionId: string): Promise<Channel> {
    const response = await this.request<ApiResponse<Channel>>(`/channels?institution_id=${institutionId}`, {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao criar canal');
    }
    
    return response.data;
  }

  // Atualizar canal
  async update(id: string, channelData: Partial<CreateChannelRequest>, institutionId: string): Promise<Channel> {
    const response = await this.request<ApiResponse<Channel>>(`/channels/${id}?institution_id=${institutionId}`, {
      method: 'PUT',
      body: JSON.stringify(channelData),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao atualizar canal');
    }
    
    return response.data;
  }

  // Deletar canal
  async delete(id: string, institutionId: string): Promise<void> {
    const response = await this.request<ApiResponse<null>>(`/channels/${id}?institution_id=${institutionId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao deletar canal');
    }
  }

  // Associar sessão ao canal
  async associateSession(channelId: string, sessionData: AssociateSessionRequest, institutionId: string): Promise<void> {
    const response = await this.request<ApiResponse<null>>(`/channels/${channelId}/session?institution_id=${institutionId}`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao associar sessão ao canal');
    }
  }

  // Desassociar sessão do canal
  async dissociateSession(channelId: string, institutionId: string): Promise<void> {
    const response = await this.request<ApiResponse<null>>(`/channels/${channelId}/session?institution_id=${institutionId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao desassociar sessão do canal');
    }
  }

  // Obter informações da sessão do canal
  async getSessionInfo(channelId: string, institutionId: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/channels/${channelId}/session?institution_id=${institutionId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao obter informações da sessão');
    }
    
    return response.data;
  }

  // Listar canais ativos (com sessão conectada)
  async listActive(institutionId: string): Promise<Channel[]> {
    const response = await this.request<ApiResponse<Channel[]>>(`/channels/active?institution_id=${institutionId}`);
    return response.data || [];
  }

  // Desconectar sessão do canal
  async disconnectSession(channelId: string, institutionId: string): Promise<void> {
    const response = await this.request<ApiResponse<null>>(`/channels/${channelId}/disconnect?institution_id=${institutionId}`, {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erro ao desconectar sessão do canal');
    }
  }

  // Ativar canal
  async activate(channelId: string, institutionId: string): Promise<Channel> {
    const response = await this.request<ApiResponse<Channel>>(`/channels/${channelId}/activate?institution_id=${institutionId}`, {
      method: 'POST',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao ativar canal');
    }
    
    return response.data;
  }

  // Desativar canal (desconecta sessão se conectada)
  async deactivate(channelId: string, institutionId: string): Promise<Channel> {
    const response = await this.request<ApiResponse<Channel>>(`/channels/${channelId}/deactivate?institution_id=${institutionId}`, {
      method: 'POST',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erro ao desativar canal');
    }
    
    return response.data;
  }
}

export const channelsService = new ChannelsService(API_BASE_URL);

