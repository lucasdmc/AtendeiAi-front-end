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
