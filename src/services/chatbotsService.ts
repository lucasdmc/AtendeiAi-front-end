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
    return this.request<Chatbot>('/chatbots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Atualizar chatbot
  async update(id: string, payload: UpdateChatbotDto): Promise<Chatbot> {
    return this.request<Chatbot>(`/chatbots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Excluir chatbot
  async remove(id: string): Promise<void> {
    return this.request<void>(`/chatbots/${id}`, {
      method: 'DELETE',
    });
  }

  // Excluir múltiplos chatbots
  async removeBulk(ids: string[]): Promise<void> {
    return this.request<void>('/chatbots/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // Ativar chatbot
  async activate(id: string): Promise<void> {
    return this.request<void>(`/chatbots/${id}/activate`, {
      method: 'POST',
    });
  }

  // Pausar chatbot
  async pause(id: string): Promise<void> {
    return this.request<void>(`/chatbots/${id}/pause`, {
      method: 'POST',
    });
  }

  // Clonar chatbot
  async clone(id: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/chatbots/${id}/clone`, {
      method: 'POST',
    });
  }

  // Reordenar chatbots
  async reorder(orderedIds: string[]): Promise<void> {
    return this.request<void>('/chatbots/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }
}

export const chatbotsService = new ChatbotsService(API_BASE_URL);

