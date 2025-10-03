// Tipos para Chatbots

export interface Channel {
  id: string;
  name: string;
  kind: 'whatsapp';
  iconUrl?: string;
}

export interface Chatbot {
  id: string;
  name: string;
  channels: Channel[];
  createdAt: string;
  updatedAt: string;
  runsToday: number;
  active: boolean;
  order: number;
}

export interface ChatbotFilters {
  query?: string;
  channelId?: string;
  page?: number;
  limit?: number;
}

export interface ChatbotsResponse {
  items: Chatbot[];
  total: number;
}

export interface CreateChatbotDto {
  name: string;
  channels?: string[];
  active?: boolean;
}

export interface UpdateChatbotDto {
  name?: string;
  channels?: string[];
  active?: boolean;
}

