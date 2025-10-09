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
  async getFlow(id: string, institutionId: string): Promise<FlowDTO> {
    const response = await fetch(`${this.baseURL}/${id}?institution_id=${institutionId}`);
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
  async createFlow(dto: Omit<FlowDTO, 'id' | 'createdAt'>, institutionId: string): Promise<{ id: string }> {
    const response = await fetch(`${this.baseURL}?institution_id=${institutionId}`, {
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
  async updateFlow(id: string, dto: Omit<FlowDTO, 'createdAt'>, institutionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}?institution_id=${institutionId}`, {
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
  async deleteFlow(id: string, institutionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}?institution_id=${institutionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir fluxo');
    }
  }

  /**
   * Ativa um fluxo
   */
  async activateFlow(id: string, institutionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}/activate?institution_id=${institutionId}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Erro ao ativar fluxo');
    }
  }

  /**
   * Testa um fluxo
   */
  async testFlow(id: string, message: string, institutionId: string, phone?: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/${id}/test?institution_id=${institutionId}`, {
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

