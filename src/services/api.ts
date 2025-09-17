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

export const userApi = {
  createUser: async (data: any) => {
    console.log('Mock createUser:', data);
    return { success: true };
  },
  
  updateUser: async (id: string, data: any) => {
    console.log('Mock updateUser:', { id, data });
    return { success: true };
  },
  
  deleteUser: async (id: string) => {
    console.log('Mock deleteUser:', id);
    return { success: true };
  }
};
