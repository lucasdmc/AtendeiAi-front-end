// Service para gerenciar Tags
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color: string;
  createdAt: string;
  order: number;
}

export interface CreateTagDTO {
  name: string;
  description?: string;
  emoji?: string;
  color: string;
}

export interface UpdateTagDTO {
  name?: string;
  description?: string;
  emoji?: string;
  color?: string;
}

export interface TagsResponse {
  success: boolean;
  data: Tag[];
  message?: string;
}

export interface TagResponse {
  success: boolean;
  data: Tag;
  message?: string;
}

class TagService {
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

      // Para DELETE, pode não retornar conteúdo
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

  // Listar todas as tags
  async list(query?: string): Promise<TagsResponse> {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    return this.request<TagsResponse>(`/tags${params}`);
  }

  // Criar nova tag
  async create(data: CreateTagDTO): Promise<TagResponse> {
    return this.request<TagResponse>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Atualizar tag
  async update(id: string, data: UpdateTagDTO): Promise<TagResponse> {
    return this.request<TagResponse>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Excluir tag
  async remove(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // Excluir múltiplas tags
  async removeBulk(ids: string[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/tags/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // Reordenar tags
  async reorder(orderedIds: string[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/tags/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }
}

export const tagService = new TagService(API_BASE_URL);

