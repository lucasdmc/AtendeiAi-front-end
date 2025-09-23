import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Conversation } from '../services/api';

// Chaves de query para React Query
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...conversationKeys.lists(), params] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

// Hook para buscar conversas
export const useConversations = (params: {
  clinic_id: string;
  status?: 'active' | 'closed' | 'archived';
  assigned_to?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: async () => {
      console.log('🔍 Buscando conversas via API:', params);
      const response = await apiService.getConversations(params);
      console.log('✅ Conversas recebidas:', response.data?.conversations?.length || 0, 'itens');
      return response.data;
    },
    enabled: !!params.clinic_id,
    staleTime: 0, // Sempre considerar stale para permitir invalidação
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 3, // Tentar 3 vezes
    retryDelay: 1000, // 1 segundo entre tentativas
  });
};

// Hook para buscar uma conversa específica
export const useConversation = (id: string) => {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getConversation(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};

// Hook para criar uma nova conversa
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clinic_id: string;
      customer_phone: string;
      customer_name?: string;
      initial_message?: string;
    }) => {
      const response = await apiService.createConversation(data);
      return response.data;
    },
    onSuccess: (newConversation) => {
      // Invalidar lista de conversas
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });

      // Adicionar à cache
      queryClient.setQueryData(
        conversationKeys.detail(newConversation._id),
        newConversation
      );
    },
  });
};

// Hook para atribuir conversa a usuário ou IA
export const useAssignConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      assigned_user_id,
      reason
    }: {
      id: string;
      assigned_user_id: string | null;
      reason?: string;
    }) => {
      const response = await apiService.assignConversation(id, {
        assigned_user_id,
        reason,
      });
      return response.data;
    },
    onSuccess: (updatedConversation) => {
      // Atualizar cache da conversa específica
      queryClient.setQueryData(
        conversationKeys.detail(updatedConversation._id),
        updatedConversation
      );

      // Atualizar cache da lista de conversas diretamente
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (oldData: any) => {
          if (!oldData?.conversations) return oldData;
          
          return {
            ...oldData,
            conversations: oldData.conversations.map((conv: any) => 
              conv._id === updatedConversation._id 
                ? updatedConversation
                : conv
            )
          };
        }
      );
    },
  });
};

// Hook para encerrar conversa
export const useCloseConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      feedback
    }: {
      id: string;
      reason?: string;
      feedback?: string;
    }) => {
      const response = await apiService.closeConversation(id, {
        reason,
        feedback,
      });
      return response.data;
    },
    onSuccess: (closedConversation) => {
      // Atualizar cache da conversa específica
      queryClient.setQueryData(
        conversationKeys.detail(closedConversation._id),
        closedConversation
      );

      // Invalidar lista de conversas
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
};

// Hook para aplicar flag a conversa
export const useApplyFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      flagId,
      notes
    }: {
      conversationId: string;
      flagId: string;
      notes?: string;
    }) => {
      const response = await apiService.applyFlag(conversationId, flagId, notes);
      return response.data;
    },
    onSuccess: (result, variables) => {
      // Atualizar cache da conversa
      queryClient.setQueryData(
        conversationKeys.detail(variables.conversationId),
        (oldData: Conversation | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            flags: [...oldData.flags, result.flag],
          };
        }
      );

      // Invalidar lista de conversas
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
};

// Hook para remover flag da conversa
export const useRemoveFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      flagId
    }: {
      conversationId: string;
      flagId: string;
    }) => {
      const response = await apiService.removeFlag(conversationId, flagId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Atualizar cache da conversa
      queryClient.setQueryData(
        conversationKeys.detail(variables.conversationId),
        (oldData: Conversation | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            flags: oldData.flags.filter(flag => flag._id !== variables.flagId),
          };
        }
      );

      // Invalidar lista de conversas
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
};
