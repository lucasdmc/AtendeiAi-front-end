/**
 * Tipos para o nó Webhook
 */

export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'GET';
export type SaveFieldTarget = 'context' | 'contact';

export interface UrlParameter {
  id: string;
  key: string;
  value: string;
}

export interface HeaderParameter {
  id: string;
  key: string;
  value: string;
}

export interface ReturnMapping {
  id: string;
  path: string; // ex: "retorno.data.id"
  saveIn: SaveFieldTarget; // Contexto ou Contato
  fieldKey: string; // Campo onde salvar
}

export interface WebhookConfig {
  endpoint: string;
  method: HttpMethod;
  urlParameters: UrlParameter[];
  headers: HeaderParameter[];
  body: string; // JSON
  returnMappings: ReturnMapping[];
}

export const HTTP_METHOD_OPTIONS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'GET'];

export const SAVE_FIELD_TARGET_LABELS: Record<SaveFieldTarget, string> = {
  context: 'Contexto.',
  contact: 'Contato.',
};

