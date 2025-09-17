// Hooks minimalistas apenas para evitar erros de importação

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

export const useUsers = (clinicId: string) => {
  return {
    data: [],
    loading: false,
    error: null,
    refetch: () => {}
  };
};

export const useClinics = () => {
  return {
    data: [],
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