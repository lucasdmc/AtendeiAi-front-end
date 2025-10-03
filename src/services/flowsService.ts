// Service para gerenciar fluxos de chatbot
import { FlowDTO } from '@/types/flow';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class FlowsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/chatbots/flows`;
  }

  /**
   * Busca um fluxo por ID
   */
  async getFlow(id: string): Promise<FlowDTO> {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fluxo');
    }
    return response.json();
  }

  /**
   * Cria um novo fluxo
   */
  async createFlow(dto: Omit<FlowDTO, 'id' | 'createdAt'>): Promise<{ id: string }> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar fluxo');
    }

    return response.json();
  }

  /**
   * Atualiza um fluxo existente
   */
  async updateFlow(id: string, dto: Omit<FlowDTO, 'createdAt'>): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}`, {
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
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir fluxo');
    }
  }
}

export const flowsService = new FlowsService();

