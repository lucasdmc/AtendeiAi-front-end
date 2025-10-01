// Tipos para o sistema de Respostas Rápidas

export type CategoryStatus = 'ACTIVE' | 'ARCHIVED';
export type QuickReplyScope = 'GLOBAL' | 'PERSONAL';
export type QuickReplyStatus = 'ACTIVE' | 'INACTIVE';

// Interface para Categoria
export interface Category {
  _id: string;
  tenant_id?: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  icon?: string;
  color?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interface para Resposta Rápida
export interface QuickReply {
  _id: string;
  tenant_id?: string;
  title: string;
  content: string;
  status: QuickReplyStatus;
  scope: QuickReplyScope;
  category_id?: string | null;
  category?: Category; // Populated quando necessário
  usage_count: number;
  last_used_at?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean; // Calculado no frontend baseado no usuário atual
}

// Interface para Favorito de Resposta Rápida
export interface QuickReplyFavorite {
  _id: string;
  user_id: string;
  quick_reply_id: string;
  created_at: string;
}

// DTOs para API

// DTO para criar categoria
export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  color?: string;
  status?: CategoryStatus;
}

// DTO para atualizar categoria
export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
  color?: string;
  status?: CategoryStatus;
}

// DTO para criar resposta rápida
export interface CreateQuickReplyDTO {
  title: string;
  content: string;
  status?: QuickReplyStatus;
  scope?: QuickReplyScope;
  category_id?: string | null;
}

// DTO para atualizar resposta rápida
export interface UpdateQuickReplyDTO {
  title?: string;
  content?: string;
  status?: QuickReplyStatus;
  scope?: QuickReplyScope;
  category_id?: string | null;
}

// DTO para mover múltiplas respostas para categoria
export interface BulkMoveToCategoryDTO {
  ids: string[];
  category_id?: string | null;
}

// Interfaces para filtros e busca

export interface CategoryFilters {
  status?: CategoryStatus | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuickReplyFilters {
  search?: string;
  category_id?: string;
  status?: QuickReplyStatus | 'all';
  scope?: QuickReplyScope | 'all';
  sort?: 'usage_count' | 'recent' | 'title' | 'created_at';
  limit?: number;
  offset?: number;
}

// Interface para picker (usado no chat)
export interface PickerFilters {
  query?: string;
  category_id?: string;
}

// Interfaces para respostas da API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Tipos para o picker de respostas rápidas
export interface QuickReplyPickerItem {
  _id: string;
  title: string;
  content: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  usage_count: number;
  is_favorite?: boolean;
}

// Interface para estatísticas
export interface QuickReplyStats {
  total: number;
  by_status: Record<QuickReplyStatus, number>;
  by_scope: Record<QuickReplyScope, number>;
  by_category: Record<string, number>;
  most_used: QuickReply[];
  recent: QuickReply[];
}

// Tipos para placeholders
export interface PlaceholderField {
  key: string;
  label: string;
  description?: string;
  example?: string;
}

export const AVAILABLE_PLACEHOLDERS: PlaceholderField[] = [
  {
    key: '@nome',
    label: 'Nome do cliente',
    description: 'Nome do cliente da conversa',
    example: 'João Silva'
  },
  {
    key: '@telefone',
    label: 'Telefone do cliente',
    description: 'Número de telefone do cliente',
    example: '+55 11 99999-9999'
  },
  {
    key: '@data',
    label: 'Data atual',
    description: 'Data atual no formato DD/MM/AAAA',
    example: '26/09/2025'
  },
  {
    key: '@hora',
    label: 'Hora atual',
    description: 'Hora atual no formato HH:MM',
    example: '14:30'
  },
  {
    key: '@clinica',
    label: 'Nome da clínica',
    description: 'Nome da clínica/empresa',
    example: 'Clínica Exemplo'
  },
  {
    key: '@atendente',
    label: 'Nome do atendente',
    description: 'Nome do atendente logado',
    example: 'Maria Santos'
  }
];

// Tipos para cores predefinidas das categorias
export const CATEGORY_COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amarelo' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#84CC16', label: 'Lima' },
  { value: '#F97316', label: 'Laranja' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6B7280', label: 'Cinza' }
] as const;

// Tipos para ícones predefinidos das categorias
export const CATEGORY_ICONS = [
  { value: '💬', label: 'Conversa' },
  { value: '📞', label: 'Telefone' },
  { value: '📧', label: 'Email' },
  { value: '🏥', label: 'Médico' },
  { value: '💊', label: 'Remédio' },
  { value: '📅', label: 'Agenda' },
  { value: '💰', label: 'Pagamento' },
  { value: '📋', label: 'Formulário' },
  { value: '🎉', label: 'Celebração' },
  { value: '⚠️', label: 'Aviso' },
  { value: '✅', label: 'Confirmação' },
  { value: '❌', label: 'Cancelamento' },
  { value: '🔔', label: 'Notificação' },
  { value: '📍', label: 'Localização' },
  { value: '🕐', label: 'Horário' }
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number]['value'];
export type CategoryIcon = typeof CATEGORY_ICONS[number]['value'];


