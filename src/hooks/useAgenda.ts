// Hook minimalista para agenda - apenas para evitar erros

export const useAgenda = () => {
  return {
    events: [],
    loading: false,
    error: null
  };
};
