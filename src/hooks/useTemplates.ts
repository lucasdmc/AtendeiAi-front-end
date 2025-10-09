import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Template } from '../services/api';

// Chaves de query para React Query
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...templateKeys.lists(), params] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
};

// Hook para buscar templates
export const useTemplates = (params: {
  institution_id: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: async () => {
      const response = await apiService.getTemplates(params);
      return response.data;
    },
    enabled: !!params.institution_id,
    staleTime: 1000 * 60 * 10, // 10 minutos (templates mudam pouco)
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
};

// Hook para buscar categorias de templates
export const useTemplateCategories = () => {
  return useQuery({
    queryKey: templateKeys.categories(),
    queryFn: async () => {
      // Como as categorias são fixas, vamos retornar elas diretamente
      // Em produção, isso poderia vir da API
      return [
        { value: 'saudacao', label: 'Saudação', color: '#E91E63' },
        { value: 'agendamento', label: 'Agendamento', color: '#3B82F6' },
        { value: 'consulta', label: 'Consulta', color: '#10B981' },
        { value: 'exame', label: 'Exame', color: '#F59E0B' },
        { value: 'financeiro', label: 'Financeiro', color: '#8B5CF6' },
        { value: 'despedida', label: 'Despedida', color: '#EC4899' },
        { value: 'outro', label: 'Outro', color: '#6B7280' }
      ];
    },
    staleTime: Infinity, // Nunca expira, pois é estático
  });
};

// Hook para criar template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      institution_id: string;
      name: string;
      content: string;
      category: string;
      variables?: string[];
      description?: string;
    }) => {
      const response = await apiService.createTemplate(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar lista de templates
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
};

// Hook para usar template (incrementa contador)
export const useUseTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.useTemplate(id);
      return response.data;
    },
    onSuccess: (updatedTemplate) => {
      // Atualizar cache do template específico
      queryClient.setQueryData(
        templateKeys.detail(updatedTemplate._id),
        updatedTemplate
      );

      // Invalidar listas de templates para atualizar contadores
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      });
    },
  });
};

// Hook utilitário para renderizar template com variáveis
export const useTemplateRenderer = () => {
  return (template: Template, variables: Record<string, string>): string => {
    if (!template.variables || template.variables.length === 0) {
      return template.content;
    }

    let rendered = template.content;

    // Substituir cada variável
    template.variables.forEach(variable => {
      const value = variables[variable] || `{${variable}}`;
      const regex = new RegExp(`\\{${variable}\\}`, 'gi');
      rendered = rendered.replace(regex, value);
    });

    return rendered;
  };
};

// Hook para buscar templates por categoria
export const useTemplatesByCategory = (institutionId: string, category?: string) => {
  return useQuery({
    queryKey: templateKeys.list({ institution_id: institutionId, category }),
    queryFn: async () => {
      const response = await apiService.getTemplates({
        institution_id: institutionId,
        category,
      });
      return response.data;
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

// Hook para buscar templates mais usados
export const useMostUsedTemplates = (institutionId: string, limit: number = 5) => {
  return useQuery({
    queryKey: [...templateKeys.lists(), 'most-used', institutionId, limit],
    queryFn: async () => {
      const response = await apiService.getTemplates({
        institution_id: institutionId,
        limit,
      });
      return response.data.templates.sort((a, b) => b.usage_count - a.usage_count);
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 30,
  });
};
