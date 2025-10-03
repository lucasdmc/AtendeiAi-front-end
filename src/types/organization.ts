// Tipos para Organization

export interface Organization {
  id: string;
  razaoSocial: string;
  cnpj: string;
  avatarUrl?: string;
  responsavel: {
    nome: string;
    email?: string;
    telefone?: string;
    whatsapp?: string;
  };
  endereco: {
    cep?: string;
    cidade?: string;
    estado?: string;
    bairro?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
}

export interface UpdateOrganizationDto {
  razaoSocial?: string;
  cnpj?: string;
  avatarUrl?: string;
  responsavel?: {
    nome?: string;
    email?: string;
    telefone?: string;
    whatsapp?: string;
  };
  endereco?: {
    cep?: string;
    cidade?: string;
    estado?: string;
    bairro?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const DELETE_REASONS = [
  { value: 'difficult-to-use', label: 'Achei difícil de utilizar' },
  { value: 'banned', label: 'Sofri banimento' },
  { value: 'expensive', label: 'Achei caro' },
  { value: 'slow', label: 'Achei lento' },
  { value: 'business-channel-errors', label: 'Achei difícil e/ou obtive erros ao criar o Canal Business' },
  { value: 'missing-features', label: 'Faltou funcionalidades' },
  { value: 'missing-support', label: 'Faltou suporte' },
  { value: 'other', label: 'Outros' },
];

