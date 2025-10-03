// Service para gerenciar Activity Logs
import {
  ActivityLogsFilters,
  ActivityLogsResponse,
  Agent,
} from '@/types/activityLogs';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ActivityLogsService {
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

  // Listar agentes (atendentes)
  async getAgents(): Promise<{ items: Agent[] }> {
    return this.request<{ items: Agent[] }>('/agents?role=attendant');
  }

  // Listar logs de atividade
  async getActivityLogs(filters: ActivityLogsFilters = {}): Promise<ActivityLogsResponse> {
    const params = new URLSearchParams();
    
    if (filters.agentId) params.append('agentId', filters.agentId);
    if (filters.activity) params.append('activity', filters.activity);
    if (filters.startAt) params.append('startAt', filters.startAt);
    if (filters.endAt) params.append('endAt', filters.endAt);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/activity-logs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ActivityLogsResponse>(endpoint);
  }
}

export const activityLogsService = new ActivityLogsService(API_BASE_URL);

