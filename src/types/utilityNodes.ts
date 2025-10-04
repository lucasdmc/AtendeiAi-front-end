/**
 * Tipos para os nós utilitários (sem drawer)
 */

// Status esperando
export interface WaitingStatusConfig {
  enabled: boolean; // Sim ou Não
}

// Privar ou liberar
export interface PrivacyConfig {
  action: 'private' | 'public'; // Privar ou Liberar
}

// Fluxo de espera
export interface WaitingFlowConfig {
  enabled: boolean; // Ativar ou Desativar
}

// Finalizar conversa
export type ClosedBy = 'none' | 'chat_owner';

export interface EndConversationConfig {
  closedBy: ClosedBy; // Ninguém ou Dono do chat
}

