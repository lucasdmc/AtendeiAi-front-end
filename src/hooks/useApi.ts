// Hooks minimalistas apenas para evitar erros de importação

// Interfaces básicas
interface Clinic {
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
  clinic_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const useConversations = (clinicId: string) => {
  return {
    data: { data: [] },
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useActiveConversations = (clinicId: string) => {
  return {
    data: { data: [] },
    loading: false
  };
};

export const useConversationHistory = (clinicId: string, phone: string, limit: number, offset: number) => {
  return {
    data: null,
    loading: false
  };
};

export const useUsers = (clinicId: string | undefined): {
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

export const useClinics = (): {
  data: Clinic[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  return {
    data: [] as Clinic[],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useAppointments = (clinicId: string) => {
  return {
    data: [],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useClinic = (clinicId: string) => {
  return {
    data: null,
    loading: false,
    error: null
  };
};

export const useClinicProfessionals = (clinicId: string) => {
  return {
    data: [],
    loading: false,
    error: null
  };
};

export const useClinicServices = (clinicId: string) => {
  return {
    data: [],
    loading: false,
    error: null
  };
};