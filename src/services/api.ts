// API mock minimalista apenas para evitar erros

export const conversationApi = {
  processMessage: async (data: any) => {
    console.log('Mock processMessage:', data);
    return { success: true };
  },
  
  transitionToHuman: async (id: string, userId: string, reason: string) => {
    console.log('Mock transitionToHuman:', { id, userId, reason });
    return { success: true };
  },
  
  transitionToBot: async (id: string, reason: string) => {
    console.log('Mock transitionToBot:', { id, reason });
    return { success: true };
  }
};
