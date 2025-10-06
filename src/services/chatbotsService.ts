// Service para gerenciar Chatbots
import {
  Chatbot,
  ChatbotFilters,
  ChatbotsResponse,
  CreateChatbotDto,
  UpdateChatbotDto,
} from '@/types/chatbot';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ChatbotsService {
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

      if (response.status === 204) {
        return { success: true } as T;
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

  // Listar chatbots
  async list(filters: ChatbotFilters = {}): Promise<ChatbotsResponse> {
    const params = new URLSearchParams();
    
    // Adicionar clinic_id obrigatório
    params.append('clinic_id', 'test-clinic-123');
    
    if (filters.query) params.append('query', filters.query);
    if (filters.channelId) params.append('channelId', filters.channelId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/chatbots${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ChatbotsResponse>(endpoint);
  }

  // Criar chatbot
  async create(payload: CreateChatbotDto): Promise<Chatbot> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<Chatbot>(`/chatbots?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Atualizar chatbot
  async update(id: string, payload: UpdateChatbotDto): Promise<Chatbot> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<Chatbot>(`/chatbots/${id}?${params.toString()}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Excluir chatbot
  async remove(id: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<void>(`/chatbots/${id}?${params.toString()}`, {
      method: 'DELETE',
    });
  }

  // Excluir múltiplos chatbots
  async removeBulk(ids: string[]): Promise<void> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<void>(`/chatbots/bulk-delete?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // Ativar chatbot
  async activate(id: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<void>(`/chatbots/${id}/activate?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Pausar chatbot
  async pause(id: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<void>(`/chatbots/${id}/pause?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Clonar chatbot
  async clone(id: string): Promise<{ id: string }> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<{ id: string }>(`/chatbots/${id}/clone?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Reordenar chatbots
  async reorder(orderedIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    params.append('clinic_id', 'test-clinic-123');
    
    return this.request<void>(`/chatbots/reorder?${params.toString()}`, {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }
}

export const chatbotsService = new ChatbotsService(API_BASE_URL);

