import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

// Interfaces para as configurações
export interface ConversationSettings {
  show_newsletter: boolean;
  show_groups: boolean;
}

export interface UISettings {
  sidebar_minimized: boolean;
  recent_emojis: string[];
}

export interface ClinicSettings {
  auto_response: boolean;
  business_hours_only: boolean;
  max_concurrent_conversations: number;
  ai_enabled: boolean;
  conversations: ConversationSettings;
  ui: UISettings;
}

// Hook para buscar configurações da clínica
export const useClinicSettings = (clinicId: string) => {
  return useQuery({
    queryKey: ['clinic-settings', clinicId],
    queryFn: async (): Promise<ClinicSettings> => {
      console.log('📋 [FRONTEND] Buscando configurações da clínica:', clinicId);
      
      const response = await apiService.getClinicSettings(clinicId);
      
      console.log('✅ [FRONTEND] Configurações recebidas:', response.data);
      
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};

// Hook para atualizar todas as configurações
export const useUpdateClinicSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, settings }: { 
      clinicId: string; 
      settings: ClinicSettings 
    }): Promise<ClinicSettings> => {
      console.log('📝 [FRONTEND] Atualizando todas as configurações:', { clinicId, settings });
      
      const response = await apiService.updateClinicSettings(clinicId, settings);
      
      return response.data;
    },
    onSuccess: (updatedSettings, { clinicId }) => {
      // Atualizar cache
      queryClient.setQueryData(['clinic-settings', clinicId], updatedSettings);
      
      console.log('✅ [FRONTEND] Configurações atualizadas no cache');
    },
    onError: (error) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações:', error);
    }
  });
};

// Hook para atualizar apenas configurações de conversas
export const useUpdateConversationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, settings }: { 
      clinicId: string; 
      settings: Partial<ConversationSettings>
    }): Promise<ConversationSettings> => {
      console.log('💬 [FRONTEND] Atualizando configurações de conversas:', { clinicId, settings });
      
      const response = await apiService.updateConversationSettings(clinicId, settings);
      
      return response.data;
    },
    onSuccess: (updatedConversationSettings, { clinicId }) => {
      // Atualizar cache parcialmente
      queryClient.setQueryData(
        ['clinic-settings', clinicId], 
        (oldData: ClinicSettings | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            conversations: {
              ...oldData.conversations,
              ...updatedConversationSettings
            }
          };
        }
      );
      
      console.log('✅ [FRONTEND] Configurações de conversas atualizadas no cache');
    },
    onError: (error) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações de conversas:', error);
    }
  });
};

// Hook para atualizar apenas configurações de UI
export const useUpdateUISettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clinicId, settings }: { 
      clinicId: string; 
      settings: Partial<UISettings>
    }): Promise<UISettings> => {
      console.log('🎨 [FRONTEND] Atualizando configurações de UI:', { clinicId, settings });
      
      const response = await apiService.updateUISettings(clinicId, settings);
      
      return response.data;
    },
    onSuccess: (updatedUISettings, { clinicId }) => {
      // Atualizar cache parcialmente
      queryClient.setQueryData(
        ['clinic-settings', clinicId], 
        (oldData: ClinicSettings | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            ui: {
              ...oldData.ui,
              ...updatedUISettings
            }
          };
        }
      );
      
      console.log('✅ [FRONTEND] Configurações de UI atualizadas no cache');
    },
    onError: (error) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações de UI:', error);
    }
  });
};
