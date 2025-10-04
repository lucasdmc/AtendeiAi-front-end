/**
 * Funções de validação para diferentes formatos de números
 */

/**
 * Valida CPF (xxx.xxx.xxx-xx)
 */
export function validateCPF(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;

  if (digit1 !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;

  return digit2 === parseInt(cleaned.charAt(10));
}

/**
 * Valida CNPJ (xx.xxx.xxx/xxxx-xx)
 */
export function validateCNPJ(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (digit1 !== parseInt(cleaned.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return digit2 === parseInt(cleaned.charAt(13));
}

/**
 * Valida CRM (formato: XX/12345 ou XX-12345, onde XX é o estado)
 */
export function validateCRM(value: string): boolean {
  const cleaned = value.replace(/\s/g, '');
  
  // Aceita formatos: XX/12345, XX-12345, XX 12345, XX12345
  const crmRegex = /^[A-Z]{2}[\/-]?\d{4,6}$/i;
  
  return crmRegex.test(cleaned);
}

/**
 * Valida telefone brasileiro (com ou sem DDD)
 * Aceita: (11) 98765-4321, 11987654321, 11 98765-4321, etc.
 */
export function validateTelefone(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');

  // Aceita 10 dígitos (fixo com DDD) ou 11 dígitos (celular com DDD)
  if (cleaned.length !== 10 && cleaned.length !== 11) return false;

  // Verifica se o DDD é válido (11 a 99)
  const ddd = parseInt(cleaned.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Se for celular (11 dígitos), o terceiro dígito deve ser 9
  if (cleaned.length === 11 && cleaned.charAt(2) !== '9') return false;

  return true;
}

/**
 * Valida CEP (xxxxx-xxx)
 */
export function validateCEP(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Valida cartão de crédito usando algoritmo de Luhn
 */
export function validateCartaoCredito(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  // Percorre os dígitos de trás para frente
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Aplica máscara de CPF
 */
export function maskCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Aplica máscara de CNPJ
 */
export function maskCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/**
 * Aplica máscara de telefone
 */
export function maskTelefone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // Celular: (11) 98765-4321
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
}

/**
 * Aplica máscara de CEP
 */
export function maskCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/**
 * Aplica máscara de cartão de crédito
 */
export function maskCartaoCredito(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

