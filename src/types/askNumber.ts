/**
 * Tipos para o nó "Perguntar por um número"
 */

export type NumberFormat = 'auto' | 'decimals' | 'whole';

export type NumberValidationType =
  | 'none'
  | 'cpf'
  | 'cnpj'
  | 'crm'
  | 'telefone'
  | 'cep'
  | 'cartao-credito'
  | 'regex';

export interface NumberValidation {
  type: NumberValidationType;
  customRegex?: string; // Usado quando type = 'regex'
}

export interface AskNumberConfig {
  // Mensagem/pergunta obrigatória
  headerRichText: string;

  // Settings
  format: NumberFormat;
  prefix?: string;
  minValue?: number;
  maxValue?: number;

  // Mensagem de erro de validação (obrigatória se não houver fluxo de erro)
  validationErrorMessage: string;

  // Campo onde salvar a resposta
  targetField: {
    key: string;
    type: string;
  };

  // Validação opcional
  validation?: NumberValidation;

  // Fluxos opcionais
  invalidFlowEnabled: boolean;
  noResponseEnabled: boolean;
  noResponseDelayValue?: number;
  noResponseDelayUnit?: 'minutes' | 'hours';
}

