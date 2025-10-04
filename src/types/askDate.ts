/**
 * Tipos para o nó "Perguntar por uma data"
 */

export type DateFormat = 
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY/MM/DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'YYYY-MM-DD';

export interface AskDateConfig {
  // Mensagem/pergunta obrigatória
  headerRichText: string;

  // Formato da data
  dateFormat: DateFormat;

  // Mensagem de erro de validação (obrigatória se não houver fluxo de erro)
  validationErrorMessage: string;

  // Campo onde salvar a resposta
  targetField: {
    key: string;
    type: string;
  };

  // Fluxos opcionais
  invalidFlowEnabled: boolean;
  noResponseEnabled: boolean;
  noResponseDelayValue?: number;
  noResponseDelayUnit?: 'minutes' | 'hours';
}

