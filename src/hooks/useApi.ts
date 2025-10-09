// Hooks minimalistas apenas para evitar erros de importação

// Interfaces básicas
interface Institution {
  id: string;
  name: string;
  whatsapp_number: string;
  meta_webhook_url?: string;
  whatsapp_id?: string;
  context_json: any;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  name: string;
  login: string;
  role: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
  institution_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const useConversations = () => {
  return {
    data: { data: [] },
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useActiveConversations = () => {
  return {
    data: { data: [] },
    loading: false
  };
};

export const useConversationHistory = () => {
  return {
    data: null,
    loading: false
  };
};

export const useUsers = (_institutionId: string | undefined): {
  data: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  return {
    data: [] as User[],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useInstitutions = (): {
  data: Institution[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  return {
    data: [] as Institution[],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useAppointments = () => {
  return {
    data: [],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useInstitution = () => {
  return {
    data: null,
    loading: false,
    error: null
  };
};

export const useInstitutionProfessionals = () => {
  return {
    data: [],
    loading: false,
    error: null
  };
};

export const useInstitutionServices = () => {
  return {
    data: [],
    loading: false,
    error: null
  };
};