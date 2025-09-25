// Configuração base da API
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}

// Tipos de dados da API
export interface Conversation {
  _id: string;
  clinic_id: string;
  customer_phone: string;
  customer_name?: string;
  customer_profile_pic?: string;
  
  // ✅ Campos para suporte a grupos
  conversation_type: 'individual' | 'group';
  group_id?: string;
  group_name?: string;
  last_participant_id?: string;
  last_participant_name?: string;
  
  status: 'active' | 'closed' | 'archived';
  assigned_user_id: string | null;
  last_message?: {
    content: string;
    timestamp: string;
    sender_type: 'customer' | 'bot' | 'human';
    sender_id?: string; // ID do remetente (para grupos)
    sender_name?: string; // Nome do remetente (para grupos)
  };
  unread_count: number;
  flags: Flag[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface Message {
  _id: string;
  conversation_id: string;
  sender_type: 'customer' | 'bot' | 'human';
  sender_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location';
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  reply_to?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  read_at?: string;
}

export interface Flag {
  _id: string;
  clinic_id: string;
  name: string;
  color: string;
  description?: string;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Template {
  _id: string;
  clinic_id: string;
  name: string;
  content: string;
  category: 'saudacao' | 'agendamento' | 'consulta' | 'exame' | 'financeiro' | 'despedida' | 'outro';
  variables: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface User {
  _id: string;
  name: string;
  login: string;
  role: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
  clinic_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  _id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  specialties: string[];
  opening_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  whatsapp_config?: {
    phone_number: string;
    business_account_id?: string;
    is_active: boolean;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
    expires_at?: string;
  };
  settings?: {
    auto_response: boolean;
    business_hours_only: boolean;
    max_concurrent_conversations: number;
    ai_enabled: boolean;
  };
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  stats?: {
    total_conversations: number;
    active_conversations: number;
    total_messages: number;
    today_messages: number;
  };
}

// Classe para fazer chamadas à API
class ApiService {
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
        console.error('API Error Response:', errorData);
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

  // Conversations API
  async getConversations(params: {
    clinic_id: string;
    status?: 'active' | 'closed' | 'archived';
    assigned_to?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<ApiResponse<{
    conversations: Conversation[];
    total: number;
    hasMore: boolean;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/conversations?${searchParams}`);
  }

  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${id}`);
  }

  async createConversation(data: {
    clinic_id: string;
    customer_phone: string;
    customer_name?: string;
    initial_message?: string;
  }): Promise<ApiResponse<Conversation>> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignConversation(id: string, data: {
    assigned_user_id: string | null;
    reason?: string;
  }): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async closeConversation(id: string, data: {
    reason?: string;
    feedback?: string;
  }): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${id}/close`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Messages API
  async getMessages(conversationId: string, params: {
    limit?: number;
    offset?: number;
    before?: string;
    after?: string;
  } = {}): Promise<ApiResponse<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/conversations/${conversationId}/messages?${searchParams}`);
  }

  async sendMessage(conversationId: string, data: {
    content: string;
    message_type?: 'text' | 'image' | 'document' | 'audio';
    reply_to?: string;
    template_id?: string;
    scheduled_at?: string;
  }): Promise<ApiResponse<Message>> {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendAudioMessage(conversationId: string, audioBlob: Blob, options?: {
    reply_to?: string;
    scheduled_at?: string;
  }): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('message_type', 'audio');
    formData.append('content', '[Áudio]'); // Conteúdo textual para o áudio
    
    if (options?.reply_to) {
      formData.append('reply_to', options.reply_to);
    }
    
    if (options?.scheduled_at) {
      formData.append('scheduled_at', options.scheduled_at);
    }

    // Usar a rota padrão de mensagens, não uma rota específica de áudio
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type para FormData (o browser define automaticamente com boundary)
      headers: {},
    });
  }

  async updateMessageStatus(id: string, status: string): Promise<ApiResponse<Message>> {
    return this.request(`/messages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async markConversationAsRead(conversationId: string): Promise<ApiResponse<{
    messagesMarkedAsRead: number;
  }>> {
    return this.request(`/conversations/${conversationId}/mark-read`, {
      method: 'PUT',
    });
  }

  async simulateCustomerMessage(conversationId: string, data: {
    content: string;
    message_type?: 'text' | 'image' | 'document' | 'audio';
    media_url?: string;
    media_filename?: string;
    media_size?: number;
    media_mime_type?: string;
    reply_to?: string;
    whatsapp_message_id?: string;
  }): Promise<ApiResponse<Message>> {
    return this.request(`/conversations/${conversationId}/simulate-customer-message`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // WhatsApp Profile API
  async getContactProfile(phone: string, sessionId?: string): Promise<ApiResponse<{
    name?: string;
    profilePictureUrl?: string;
  }>> {
    const params = sessionId ? `?session_id=${sessionId}` : '';
    return this.request(`/whatsapp/messages/profile/${phone}${params}`);
  }

  async updateConversationProfile(phone: string, sessionId?: string): Promise<ApiResponse<null>> {
    return this.request(`/whatsapp/messages/profile/${phone}`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Templates API
  async getTemplates(params: {
    clinic_id: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    templates: Template[];
    total: number;
    hasMore: boolean;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/templates?${searchParams}`);
  }

  async createTemplate(data: {
    clinic_id: string;
    name: string;
    content: string;
    category: string;
    variables?: string[];
    description?: string;
  }): Promise<ApiResponse<Template>> {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async useTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.request(`/templates/${id}/use`, {
      method: 'POST',
    });
  }

  // Flags API
  async applyFlag(conversationId: string, flagId: string, notes?: string): Promise<ApiResponse<{
    conversation: Conversation;
    flag: Flag;
  }>> {
    return this.request(`/conversations/${conversationId}/flags`, {
      method: 'POST',
      body: JSON.stringify({ flag_id: flagId, notes }),
    });
  }

  async removeFlag(conversationId: string, flagId: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/conversations/${conversationId}/flags/${flagId}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(params: {
    clinic_id?: string;
    role?: string;
    status?: 'active' | 'inactive';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{
    users: User[];
    total: number;
    hasMore: boolean;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/users?${searchParams}`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`);
  }

  async createUser(data: {
    name: string;
    login: string;
    password: string;
    role: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
    clinic_id: string;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: {
    name?: string;
    login?: string;
    password?: string;
    role?: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Clinics API
  async getClinics(params: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'inactive' | 'suspended';
    search?: string;
    plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  } = {}): Promise<ApiResponse<{
    clinics: Clinic[];
    total: number;
    hasMore: boolean;
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/clinics?${searchParams}`);
  }

  async getClinic(id: string): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.request(`/clinics/${id}`);
  }

  async createClinic(data: {
    name: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    specialties?: string[];
    opening_hours?: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    whatsapp_config: {
      phone_number: string;
      business_account_id?: string;
      access_token?: string;
      webhook_verify_token?: string;
      is_active?: boolean;
    };
    subscription?: {
      plan?: 'free' | 'basic' | 'premium' | 'enterprise';
      status?: 'active' | 'inactive' | 'suspended';
      expires_at?: string;
    };
    settings?: {
      auto_response?: boolean;
      business_hours_only?: boolean;
      max_concurrent_conversations?: number;
      ai_enabled?: boolean;
    };
    status?: 'active' | 'inactive' | 'suspended';
  }): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.request('/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClinic(id: string, data: Partial<{
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    specialties: string[];
    opening_hours: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    whatsapp_config: {
      phone_number: string;
      business_account_id?: string;
      access_token?: string;
      webhook_verify_token?: string;
      is_active: boolean;
    };
    subscription: {
      plan: 'free' | 'basic' | 'premium' | 'enterprise';
      status: 'active' | 'inactive' | 'suspended';
      expires_at?: string;
    };
    settings: {
      auto_response: boolean;
      business_hours_only: boolean;
      max_concurrent_conversations: number;
      ai_enabled: boolean;
    };
    status: 'active' | 'inactive' | 'suspended';
  }>): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.request(`/clinics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClinic(id: string): Promise<ApiResponse<void>> {
    return this.request(`/clinics/${id}`, {
      method: 'DELETE',
    });
  }

  async getClinicStats(id: string): Promise<ApiResponse<{
    clinic_id: string;
    stats: {
      total_conversations: number;
      active_conversations: number;
      total_messages: number;
      today_messages: number;
    };
  }>> {
    return this.request(`/clinics/${id}/stats`);
  }

  async updateClinicStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.request(`/clinics/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Scheduled Messages API
  async getScheduledMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/conversations/${conversationId}/scheduled-messages`);
  }

  async cancelScheduledMessage(messageId: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/scheduled/${messageId}`, {
      method: 'DELETE'
    });
  }

  async updateScheduledMessage(messageId: string, data: {
    content?: string;
    scheduled_at?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/messages/scheduled/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Clinic Settings API
  async getClinicSettings(clinicId: string): Promise<ApiResponse<any>> {
    return this.request(`/clinics/${clinicId}/settings`);
  }

  async updateClinicSettings(clinicId: string, settings: any): Promise<ApiResponse<any>> {
    return this.request(`/clinics/${clinicId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async updateConversationSettings(clinicId: string, settings: {
    show_newsletter?: boolean;
    show_groups?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/clinics/${clinicId}/settings/conversations`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }

  async updateUISettings(clinicId: string, settings: {
    sidebar_minimized?: boolean;
    recent_emojis?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request(`/clinics/${clinicId}/settings/ui`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
}

// Instância singleton da API
export const apiService = new ApiService(API_BASE_URL);

// Exportar instância específica para usuários (compatibilidade)
export const userApi = apiService;

// Exportar função para criar nova instância se necessário
export const createApiService = (baseURL: string) => new ApiService(baseURL);

// Exportar tipos para uso em outros arquivos
export type { ApiService };