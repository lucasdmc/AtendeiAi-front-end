import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Category, 
  CreateCategoryDTO, 
  UpdateCategoryDTO, 
  CategoryFilters,
  PaginatedResponse,
  ApiResponse 
} from '@/types/quickReplies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  active: () => [...categoryKeys.all, 'active'] as const,
};

// API Functions
const categoriesApi = {
  // Listar categorias
  getCategories: async (filters: CategoryFilters = {}): Promise<PaginatedResponse<Category>> => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/categories?${params}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
    }
    return response.json();
  },

  // Buscar categoria por ID
  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar categoria: ${response.statusText}`);
    }
    return response.json();
  },

  // Buscar apenas categorias ativas
  getActiveCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetch(`${API_BASE_URL}/categories/active`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias ativas: ${response.statusText}`);
    }
    return response.json();
  },

  // Criar categoria
  createCategory: async (data: CreateCategoryDTO): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao criar categoria: ${response.statusText}`);
    }
    return response.json();
  },

  // Atualizar categoria
  updateCategory: async ({ id, data }: { id: string; data: UpdateCategoryDTO }): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao atualizar categoria: ${response.statusText}`);
    }
    return response.json();
  },

  // Excluir categoria
  deleteCategory: async ({ id, reassignTo }: { id: string; reassignTo?: string }): Promise<void> => {
    const params = new URLSearchParams();
    if (reassignTo) params.append('reassign_to', reassignTo);

    const response = await fetch(`${API_BASE_URL}/categories/${id}?${params}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro ao excluir categoria: ${response.statusText}`);
    }
  },
};

// Hooks

// Hook para listar categorias
export const useCategories = (filters: CategoryFilters = {}) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoriesApi.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar categoria por ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar categorias ativas
export const useActiveCategories = () => {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: categoriesApi.getActiveCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos (categorias ativas mudam menos)
  });
};

// Hook para criar categoria
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
      
      toast({
        title: 'Categoria criada',
        description: response.message || 'Categoria criada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar categoria
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: categoriesApi.updateCategory,
    onSuccess: (response, variables) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
      
      // Atualizar cache específico da categoria
      queryClient.setQueryData(
        categoryKeys.detail(variables.id),
        response
      );
      
      toast({
        title: 'Categoria atualizada',
        description: response.message || 'Categoria atualizada com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para excluir categoria
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: (_, variables) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
      
      // Remover do cache específico
      queryClient.removeQueries({ queryKey: categoryKeys.detail(variables.id) });
      
      toast({
        title: 'Categoria excluída',
        description: 'Categoria excluída com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para invalidar cache de categorias (útil para refresh manual)
export const useInvalidateCategories = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
  };
};


