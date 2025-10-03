// Tipos para Activity Logs

export type ActivityType =
  | 'GENERIC'
  | 'SCHEDULE_MISS'
  | 'SUBSCRIPTION_UPDATED'
  | 'ACCOUNT_NOTICE'
  | 'CHANNEL_INFRA_RECREATED'
  | 'CHANNEL_CREATED'
  | 'CHANNEL_RESTARTED'
  | 'CHATBOT_ENABLED'
  | 'CHATBOT_UPDATED'
  | 'CHATBOT_CREATED'
  | 'CHATBOT_DELETED'
  | 'CHATBOT_DISABLED'
  | 'CONTACT_UPDATED'
  | 'CONTACT_CREATED'
  | 'CONTACT_DELETED'
  | 'CONVERSATION_FINISHED'
  | 'CONVERSATION_STARTED'
  | 'CONVERSATION_PRIVATE'
  | 'CONVERSATION_PUBLIC'
  | 'CONVERSATION_TRANSFERRED'
  | 'INVITE_UPDATED'
  | 'INVITE_DELETED'
  | 'INVITE_SENT_UPDATED'
  | 'CREDITS_PENDING_DISCOUNTED'
  | 'TAG_UPDATED'
  | 'TAG_CREATED'
  | 'TAG_DELETED'
  | 'MENTION'
  | 'MENTION_IN_NOTE'
  | 'SCHEDULED_MSG_UPDATED'
  | 'SCHEDULED_MSG_CREATED'
  | 'SCHEDULED_MSG_DELETED'
  | 'SCHEDULED_MSG_SENT'
  | 'MARKETING_NOTIFICATIONS'
  | 'ORG_UPDATED'
  | 'ADDON_PURCHASED'
  | 'PAYMENT_RECEIVED'
  | 'PERMISSIONS_UPDATED'
  | 'QUICK_REPLY_UPDATED'
  | 'QUICK_REPLY_CREATED'
  | 'QUICK_REPLY_DELETED'
  | 'SECTOR_UPDATED'
  | 'SECTOR_CREATED'
  | 'CONVERSATION_SECTOR_UPDATED'
  | 'SECTOR_DELETED'
  | 'TEMPLATE_UPDATED'
  | 'TEMPLATE_CREATED'
  | 'TEMPLATE_DELETED'
  | 'CREDITS_USED'
  | 'WEBHOOK_UPDATED'
  | 'WEBHOOK_CREATED'
  | 'WEBHOOK_DELETED';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
    isYou?: boolean;
  };
  resource?: {
    label: string;
    url?: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  avatarUrl?: string;
  isYou?: boolean;
}

export interface ActivityLogsFilters {
  agentId?: string;
  activity?: ActivityType;
  startAt?: string;
  endAt?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogsResponse {
  items: ActivityLog[];
  total: number;
}

// Mapeamento de tipos para rótulos em português
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  GENERIC: 'Generic',
  SCHEDULE_MISS: 'Agendamento de mensagem não executado',
  SUBSCRIPTION_UPDATED: 'Assinatura alterada',
  ACCOUNT_NOTICE: 'Aviso de conta',
  CHANNEL_INFRA_RECREATED: 'Canal com infraestrutura recriada',
  CHANNEL_CREATED: 'Canal criado',
  CHANNEL_RESTARTED: 'Canal reiniciado',
  CHATBOT_ENABLED: 'Chatbot ativado',
  CHATBOT_UPDATED: 'Chatbot atualizado',
  CHATBOT_CREATED: 'Chatbot criado',
  CHATBOT_DELETED: 'Chatbot deletado',
  CHATBOT_DISABLED: 'Chatbot desativado',
  CONTACT_UPDATED: 'Contato atualizado',
  CONTACT_CREATED: 'Contato criado',
  CONTACT_DELETED: 'Contato deletado',
  CONVERSATION_FINISHED: 'Conversa finalizada',
  CONVERSATION_STARTED: 'Conversa iniciada',
  CONVERSATION_PRIVATE: 'Conversa privada',
  CONVERSATION_PUBLIC: 'Conversa pública',
  CONVERSATION_TRANSFERRED: 'Conversa transferida',
  INVITE_UPDATED: 'Convite atualizado',
  INVITE_DELETED: 'Convite deletado',
  INVITE_SENT_UPDATED: 'Convite enviado/atualizado',
  CREDITS_PENDING_DISCOUNTED: 'Créditos pendentes descontadas',
  TAG_UPDATED: 'Etiqueta atualizada',
  TAG_CREATED: 'Etiqueta criada',
  TAG_DELETED: 'Etiqueta deletada',
  MENTION: 'Menção',
  MENTION_IN_NOTE: 'Menção em nota do contato',
  SCHEDULED_MSG_UPDATED: 'Mensagem agendada atualizada',
  SCHEDULED_MSG_CREATED: 'Mensagem agendada criada',
  SCHEDULED_MSG_DELETED: 'Mensagem agendada deletada',
  SCHEDULED_MSG_SENT: 'Mensagem agendada enviada',
  MARKETING_NOTIFICATIONS: 'Notificações de marketing',
  ORG_UPDATED: 'Organização atualizada',
  ADDON_PURCHASED: 'Pacote avulso contratado',
  PAYMENT_RECEIVED: 'Pagamento recebido',
  PERMISSIONS_UPDATED: 'Permissões atualizadas',
  QUICK_REPLY_UPDATED: 'Resposta rápida atualizada',
  QUICK_REPLY_CREATED: 'Resposta rápida criada',
  QUICK_REPLY_DELETED: 'Resposta rápida deletada',
  SECTOR_UPDATED: 'Setor atualizado',
  SECTOR_CREATED: 'Setor criado',
  CONVERSATION_SECTOR_UPDATED: 'Setor da conversa atualizado',
  SECTOR_DELETED: 'Setor deletado',
  TEMPLATE_UPDATED: 'Template de mensagem atualizado',
  TEMPLATE_CREATED: 'Template de mensagem criado',
  TEMPLATE_DELETED: 'Template de mensagem deletado',
  CREDITS_USED: 'Utilização de Créditos',
  WEBHOOK_UPDATED: 'Webhook atualizado',
  WEBHOOK_CREATED: 'Webhook criado',
  WEBHOOK_DELETED: 'Webhook deletado',
};

