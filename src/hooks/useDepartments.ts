import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { departmentService, CreateDepartmentData, UpdateDepartmentData, DepartmentsQuery } from '@/services/departmentService';

// Hook para listar departamentos
export const useDepartments = (params: DepartmentsQuery = {}, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentService.getDepartments(params),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obter um departamento específico
export const useDepartment = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartment(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar departamento
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateDepartmentData) => departmentService.createDepartment(data),
    onSuccess: (newDepartment) => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      toast({
        title: "Departamento criado",
        description: `O departamento "${newDepartment.name}" foi criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar departamento:', error);
      toast({
        title: "Erro ao criar departamento",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar departamento
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) => 
      departmentService.updateDepartment(id, data),
    onSuccess: (updatedDepartment) => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', updatedDepartment._id] });
      
      toast({
        title: "Departamento atualizado",
        description: `O departamento foi atualizado com sucesso.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar departamento:', error);
      toast({
        title: "Erro ao atualizar departamento",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar departamento
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      toast({
        title: "Departamento excluído",
        description: "O departamento foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao excluir departamento:', error);
      toast({
        title: "Erro ao excluir departamento",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};

// Hook para alterar status do departamento
export const useUpdateDepartmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      departmentService.updateDepartmentStatus(id, is_active),
    onSuccess: (updatedDepartment) => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', updatedDepartment._id] });
      
      toast({
        title: "Status atualizado",
        description: `O departamento foi ${updatedDepartment.is_active ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao alterar status do departamento:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};

// Hook para reordenar departamentos
export const useReorderDepartments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ departmentIds, institution_id }: { departmentIds: string[]; institution_id: string }) => 
      departmentService.reorderDepartments(departmentIds, institution_id),
    onSuccess: () => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos departamentos foi alterada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao reordenar departamentos:', error);
      toast({
        title: "Erro ao reordenar",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};

// Hook para criar setor padrão
export const useCreateDefaultDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (institution_id: string) => departmentService.createDefaultDepartment(institution_id),
    onSuccess: (newDepartment) => {
      // Invalidar cache de departamentos
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      
      toast({
        title: "Setor padrão criado",
        description: `O setor padrão "${newDepartment.name}" foi criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar setor padrão:', error);
      toast({
        title: "Erro ao criar setor padrão",
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};
