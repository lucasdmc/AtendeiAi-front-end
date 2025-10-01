import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  QuickReply, 
  CreateQuickReplyDTO, 
  UpdateQuickReplyDTO, 
  QuickReplyFilters,
  PickerFilters,
  BulkMoveToCategoryDTO,
  PaginatedResponse,
  ApiResponse,
  QuickReplyPickerItem 
} from '@/types/quickReplies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Query Keys
export const quickReplyKeys = {
  all: ['quickReplies'] as const,
  lists: () => [...quickReplyKeys.all, 'list'] as const,
  list: (filters: QuickReplyFilters) => [...quickReplyKeys.lists(), filters] as const,
  details: () => [...quickReplyKeys.all, 'detail'] as const,
  detail: (id: string) => [...quickReplyKeys.details(), id] as const,
  picker: () => [...quickReplyKeys.all, 'picker'] as const,
  pickerQuery: (filters: PickerFilters) => [...quickReplyKeys.picker(), filters] as const,
  favorites: () => [...quickReplyKeys.all, 'favorites'] as const,
};

// API Functions
const quickRepliesApi = {
  // Listar respostas rápidas
  getQuickReplies: async (filters: QuickReplyFilters = {}): Promise<PaginatedResponse<QuickReply>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.scope && filters.scope !== 'all') params.append('scope', filters.scope);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/quick-replies?${params}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar respostas rápidas: ${response.statusText}`);
    }
    return response.json();
  },

  // Buscar resposta rápida por ID
  getQuickReplyById: async (id: string): Promise<ApiResponse<QuickReply>> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar resposta rápida: ${response.statusText}`);
    }
    return response.json();
  },

  // Buscar respostas rápidas para picker (otimizada)
  getQuickRepliesForPicker: async (filters: PickerFilters = {}): Promise<ApiResponse<QuickReplyPickerItem[]>> => {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('query', filters.query);
    if (filters.category_id) params.append('category_id', filters.category_id);

    const response = await fetch(`${API_BASE_URL}/quick-replies/picker?${params}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar respostas para picker: ${response.statusText}`);
    }
    return response.json();
  },

  // Criar resposta rápida
  createQuickReply: async (data: CreateQuickReplyDTO): Promise<ApiResponse<QuickReply>> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao criar resposta rápida: ${response.statusText}`);
    }
    return response.json();
  },

  // Atualizar resposta rápida
  updateQuickReply: async ({ id, data }: { id: string; data: UpdateQuickReplyDTO }): Promise<ApiResponse<QuickReply>> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao atualizar resposta rápida: ${response.statusText}`);
    }
    return response.json();
  },

  // Excluir resposta rápida
  deleteQuickReply: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao excluir resposta rápida: ${response.statusText}`);
    }
  },

  // Duplicar resposta rápida
  duplicateQuickReply: async (id: string): Promise<ApiResponse<QuickReply>> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}/duplicate`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao duplicar resposta rápida: ${response.statusText}`);
    }
    return response.json();
  },

  // Registrar uso de resposta rápida
  trackUsage: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}/track-usage`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao registrar uso: ${response.statusText}`);
    }
  },

  // Adicionar aos favoritos
  addToFavorites: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}/favorite`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao adicionar aos favoritos: ${response.statusText}`);
    }
  },

  // Remover dos favoritos
  removeFromFavorites: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/${id}/favorite`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao remover dos favoritos: ${response.statusText}`);
    }
  },

  // Mover múltiplas respostas para categoria
  bulkMoveToCategory: async (data: BulkMoveToCategoryDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/quick-replies/bulk-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao mover respostas: ${response.statusText}`);
    }
  },
};

// Hooks

// Hook para listar respostas rápidas
export const useQuickReplies = (filters: QuickReplyFilters = {}) => {
  return useQuery({
    queryKey: quickReplyKeys.list(filters),
    queryFn: () => quickRepliesApi.getQuickReplies(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar resposta rápida por ID
export const useQuickReply = (id: string) => {
  return useQuery({
    queryKey: quickReplyKeys.detail(id),
    queryFn: () => quickRepliesApi.getQuickReplyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para picker de respostas rápidas
export const useQuickRepliesPicker = (filters: PickerFilters = {}) => {
  return useQuery({
    queryKey: quickReplyKeys.pickerQuery(filters),
    queryFn: () => quickRepliesApi.getQuickRepliesForPicker(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto (picker precisa ser mais atualizado)
  });
};

// Hook para criar resposta rápida
export const useCreateQuickReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quickRepliesApi.createQuickReply,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      
      toast({
        title: 'Resposta rápida criada',
        description: response.message || 'Resposta rápida criada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar resposta rápida',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar resposta rápida
export const useUpdateQuickReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quickRepliesApi.updateQuickReply,
    onSuccess: (response, variables) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      
      // Atualizar cache específico
      queryClient.setQueryData(
        quickReplyKeys.detail(variables.id),
        response
      );
      
      toast({
        title: 'Resposta rápida atualizada',
        description: response.message || 'Resposta rápida atualizada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar resposta rápida',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para excluir resposta rápida
export const useDeleteQuickReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quickRepliesApi.deleteQuickReply,
    onSuccess: (_, id) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      
      // Remover do cache específico
      queryClient.removeQueries({ queryKey: quickReplyKeys.detail(id) });
      
      toast({
        title: 'Resposta rápida excluída',
        description: 'Resposta rápida excluída com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir resposta rápida',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para duplicar resposta rápida
export const useDuplicateQuickReply = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quickRepliesApi.duplicateQuickReply,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      
      toast({
        title: 'Resposta rápida duplicada',
        description: response.message || 'Resposta rápida duplicada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao duplicar resposta rápida',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para registrar uso (sem toast, usado silenciosamente)
export const useTrackUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickRepliesApi.trackUsage,
    onSuccess: () => {
      // Invalidar cache para atualizar contadores de uso
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
    },
    // Não mostrar toast para esta ação
  });
};

// Hook para adicionar/remover favoritos
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: quickRepliesApi.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      toast({
        title: 'Adicionado aos favoritos',
        description: 'Resposta rápida adicionada aos favoritos!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao adicionar aos favoritos',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: quickRepliesApi.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      toast({
        title: 'Removido dos favoritos',
        description: 'Resposta rápida removida dos favoritos!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover dos favoritos',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};

// Hook para mover múltiplas respostas
export const useBulkMoveToCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quickRepliesApi.bulkMoveToCategory,
    onSuccess: (_, variables) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quickReplyKeys.picker() });
      
      toast({
        title: 'Respostas movidas',
        description: `${variables.ids.length} resposta(s) movida(s) com sucesso!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao mover respostas',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para invalidar cache (útil para refresh manual)
export const useInvalidateQuickReplies = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: quickReplyKeys.all });
  };
};


