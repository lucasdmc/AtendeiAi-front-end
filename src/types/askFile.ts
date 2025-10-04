/**
 * Tipos para o nó "Perguntar por um arquivo/mídia"
 */

export type FileExtension = 
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'csv'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'mp4'
  | 'mp3'
  | 'wav'
  | 'zip'
  | 'rar';

export interface AskFileConfig {
  // Mensagem/pergunta obrigatória
  headerRichText: string;

  // Extensões permitidas
  allowedExtensions: FileExtension[];

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

