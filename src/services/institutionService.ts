/**
 * Serviço de Institution - Comunicação com API de Instituições
 * 
 * Este serviço fornece métodos para interagir com a API de instituições,
 * substituindo o antigo serviço de instituiçãos.
 */

// Serviço de instituições para comunicação com a API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Interfaces para Institution
export interface Institution {
  _id: string;
  id: string;
  name: string;
  type?: 'hospital' | 'clinica' | 'consultor' | 'grupo' | 'laboratorio' | 'farmacia' | 'outros';
  description?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  logo_url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  whatsapp_config: {
    phone_number?: string;
    webhook_url?: string;
    api_key?: string;
    business_account_id?: string;
    phone_number_id?: string;
    verify_token?: string;
  };
  settings?: {
    timezone?: string;
    language?: string;
    currency?: string;
    business_hours?: any;
    notifications?: any;
    features?: any;
  };
  status: 'active' | 'inactive' | 'suspended';
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    start_date: string;
    end_date?: string;
    features: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface InstitutionStats {
  total: number;
  active: number;
  inactive: number;
  top_institutions: Array<{
    name: string;
    attendant_count: number;
    status: string;
  }>;
}

export interface InstitutionWithStats extends Institution {
  attendant_count: number;
  context_json?: string;
  whatsapp_number?: string;
}

export interface InstitutionListResponse {
  institutions: InstitutionWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateInstitutionData {
  name: string;
  type?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: any;
  whatsapp_config?: any;
  settings?: any;
}

export interface UpdateInstitutionData extends Partial<CreateInstitutionData> {
  status?: 'active' | 'inactive' | 'suspended';
}

class InstitutionService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/institutions${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  }

  // Listar todas as instituições
  async getInstitutions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<InstitutionListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    const response = await this.makeRequest<{ success: boolean; data: InstitutionListResponse }>(endpoint);
    return response.data;
  }

  // Buscar todas as instituições (para admin_lify/suporte_lify)
  async getAllInstitutions(): Promise<{ institutions: Institution[]; pagination: any }> {
    const response = await this.makeRequest<{ success: boolean; data: InstitutionListResponse }>('');
    return response.data;
  }

  // Buscar instituição por ID
  async getInstitution(id: string): Promise<{ institution: Institution; attendants: any[] }> {
    const response = await this.makeRequest<{ success: boolean; data: { institution: Institution; attendants: any[] } }>(`/${id}`);
    return response.data;
  }

  // Criar nova instituição
  async createInstitution(data: CreateInstitutionData): Promise<{ institution: Institution }> {
    const response = await this.makeRequest<{ success: boolean; data: { institution: Institution } }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Atualizar instituição
  async updateInstitution(id: string, data: UpdateInstitutionData): Promise<{ institution: Institution }> {
    const response = await this.makeRequest<{ success: boolean; data: { institution: Institution } }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Alternar status da instituição
  async toggleInstitutionStatus(id: string, status: 'active' | 'inactive'): Promise<{ institution: Institution }> {
    const response = await this.makeRequest<{ success: boolean; data: { institution: Institution } }>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  // Deletar instituição
  async deleteInstitution(id: string): Promise<void> {
    await this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Obter estatísticas das instituições
  async getInstitutionStats(): Promise<InstitutionStats> {
    const response = await this.makeRequest<{ success: boolean; data: InstitutionStats }>('/stats');
    return response.data;
  }

  // Buscar instituições por nome
  async searchInstitutions(query: string): Promise<Institution[]> {
    const response = await this.getInstitutions({ search: query });
    return response.institutions;
  }

  // Verificar se nome da instituição está disponível
  async checkInstitutionNameAvailability(name: string): Promise<boolean> {
    try {
      const institutions = await this.searchInstitutions(name);
      return !institutions.some(inst => 
        inst.name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do nome:', error);
      return false;
    }
  }

  // Obter tipos de instituição disponíveis
  getInstitutionTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'hospital', label: 'Hospital' },
      { value: 'clinica', label: 'Clínica' },
      { value: 'consultor', label: 'Consultório' },
      { value: 'grupo', label: 'Grupo de saúde' },
      { value: 'laboratorio', label: 'Laboratório' },
      { value: 'farmacia', label: 'Farmácia' },
      { value: 'outros', label: 'Outros' }
    ];
  }

  // Obter status disponíveis
  getInstitutionStatuses(): Array<{ value: string; label: string }> {
    return [
      { value: 'active', label: 'Ativa' },
      { value: 'inactive', label: 'Inativa' },
      { value: 'suspended', label: 'Suspensa' }
    ];
  }

  // Obter planos de assinatura
  getSubscriptionPlans(): Array<{ value: string; label: string }> {
    return [
      { value: 'free', label: 'Gratuito' },
      { value: 'basic', label: 'Básico' },
      { value: 'premium', label: 'Premium' },
      { value: 'enterprise', label: 'Empresarial' }
    ];
  }
}

export const institutionService = new InstitutionService();
export default institutionService;
