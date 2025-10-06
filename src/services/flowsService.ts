// Service para gerenciar fluxos de chatbot
import { FlowDTO } from '@/types/flow';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class FlowsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/flows`;
  }

  /**
   * Busca um fluxo por ID
   */
  async getFlow(id: string): Promise<FlowDTO> {
    const response = await fetch(`${this.baseURL}/${id}?clinic_id=test-clinic-123`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fluxo');
    }
    
    const result = await response.json();
    console.log('📤 [FLOWS SERVICE] Resposta getFlow do backend:', result);
    
    // Backend retorna: { success: true, data: { id: '...', nodes: [...], edges: [...] } }
    return result.data;
  }

  /**
   * Cria um novo fluxo
   */
  async createFlow(dto: Omit<FlowDTO, 'id' | 'createdAt'>): Promise<{ id: string }> {
    const response = await fetch(`${this.baseURL}?clinic_id=test-clinic-123`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar fluxo');
    }

    const result = await response.json();
    console.log('📤 [FLOWS SERVICE] Resposta do backend:', result);
    
    // Backend retorna: { success: true, data: { id: '...', ... } }
    return { id: result.data.id };
  }

  /**
   * Atualiza um fluxo existente
   */
  async updateFlow(id: string, dto: Omit<FlowDTO, 'createdAt'>): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}?clinic_id=test-clinic-123`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar fluxo');
    }
  }

  /**
   * Exclui um fluxo
   */
  async deleteFlow(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}?clinic_id=test-clinic-123`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir fluxo');
    }
  }

  /**
   * Ativa um fluxo
   */
  async activateFlow(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}/activate?clinic_id=test-clinic-123`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Erro ao ativar fluxo');
    }
  }

  /**
   * Testa um fluxo
   */
  async testFlow(id: string, message: string, phone?: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/${id}/test?clinic_id=test-clinic-123`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao testar fluxo');
    }

    const result = await response.json();
    return result.data;
  }
}

export const flowsService = new FlowsService();

