// Service para gerenciar Organization
import {
  Organization,
  UpdateOrganizationDto,
  ViaCepResponse,
} from '@/types/organization';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class OrganizationService {
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

  // Buscar organização
  async getOrganization(): Promise<Organization> {
    return this.request<Organization>('/organization');
  }

  // Atualizar organização
  async updateOrganization(payload: UpdateOrganizationDto): Promise<void> {
    return this.request<void>('/organization', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Excluir organização
  async deleteOrganization(reason?: string): Promise<void> {
    return this.request<void>('/organization', {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  // Buscar CEP via ViaCEP
  async lookupCep(cep: string): Promise<ViaCepResponse> {
    const cleanedCep = cep.replace(/\D/g, '');
    
    if (cleanedCep.length !== 8) {
      throw new Error('CEP inválido');
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar CEP');
    }
  }

  // Upload de avatar
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseURL}/organization/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload do avatar');
    }

    return response.json();
  }
}

export const organizationService = new OrganizationService(API_BASE_URL);

