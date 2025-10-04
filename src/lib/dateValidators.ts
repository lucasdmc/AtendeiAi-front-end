/**
 * Funções de validação para datas
 */

import { DateFormat } from '@/types/askDate';

/**
 * Valida se uma string é uma data válida no formato especificado
 */
export function validateDate(value: string, format: DateFormat): boolean {
  // Remover espaços extras
  const cleaned = value.trim();

  // Determinar separador baseado no formato
  const separator = format.includes('/') ? '/' : '-';
  
  // Dividir a data em partes
  const parts = cleaned.split(separator);
  
  if (parts.length !== 3) {
    return false;
  }

  let day: number, month: number, year: number;

  // Extrair dia, mês e ano baseado no formato
  switch (format) {
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
      break;
    
    case 'MM/DD/YYYY':
    case 'MM-DD-YYYY':
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
      break;
    
    case 'YYYY/MM/DD':
    case 'YYYY-MM-DD':
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
      break;
    
    default:
      return false;
  }

  // Verificar se os valores são números válidos
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return false;
  }

  // Verificar ranges básicos
  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  if (year < 1900 || year > 2100) {
    return false;
  }

  // Criar objeto Date e verificar se é válido
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Retorna um exemplo de data no formato especificado
 */
export function getDateFormatExample(format: DateFormat): string {
  const examples: Record<DateFormat, string> = {
    'DD/MM/YYYY': '31/12/2024',
    'MM/DD/YYYY': '12/31/2024',
    'YYYY/MM/DD': '2024/12/31',
    'DD-MM-YYYY': '31-12-2024',
    'MM-DD-YYYY': '12-31-2024',
    'YYYY-MM-DD': '2024-12-31',
  };

  return examples[format];
}

/**
 * Retorna um label amigável para o formato
 */
export function getDateFormatLabel(format: DateFormat): string {
  return format;
}

