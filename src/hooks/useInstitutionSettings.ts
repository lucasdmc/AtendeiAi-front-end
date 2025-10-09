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

export interface InstitutionSettings {
  auto_response: boolean;
  business_hours_only: boolean;
  max_concurrent_conversations: number;
  ai_enabled: boolean;
  conversations: ConversationSettings;
  ui: UISettings;
}

// Hook para buscar configurações da instituição
export const useInstitutionSettings = (institutionId: string) => {
  return useQuery({
    queryKey: ['institution-settings', institutionId],
    queryFn: async (): Promise<InstitutionSettings> => {
      console.log('📋 [FRONTEND] Buscando configurações da instituição:', institutionId);
      
      const response = await apiService.getInstitutionSettings(institutionId);
      
      console.log('✅ [FRONTEND] Configurações recebidas:', response.data);
      
      return response.data;
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};

// Hook para atualizar todas as configurações
export const useUpdateInstitutionSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, settings }: { 
      institutionId: string; 
      settings: InstitutionSettings 
    }): Promise<InstitutionSettings> => {
      console.log('📝 [FRONTEND] Atualizando todas as configurações:', { institutionId, settings });
      
      const response = await apiService.updateInstitutionSettings(institutionId, settings);
      
      return response.data;
    },
    onSuccess: (updatedSettings, { institutionId }) => {
      // Atualizar cache
      queryClient.setQueryData(['institution-settings', institutionId], updatedSettings);
      
      console.log('✅ [FRONTEND] Configurações atualizadas no cache');
    },
    onError: (error: any) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações:', error);
    }
  });
};

// Hook para atualizar apenas configurações de conversas
export const useUpdateConversationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, settings }: { 
      institutionId: string; 
      settings: Partial<ConversationSettings>
    }): Promise<ConversationSettings> => {
      console.log('💬 [FRONTEND] Atualizando configurações de conversas:', { institutionId, settings });
      
      const response = await apiService.updateConversationSettings(institutionId, settings);
      
      return response.data;
    },
    onSuccess: (updatedConversationSettings, { institutionId }) => {
      // Atualizar cache parcialmente
      queryClient.setQueryData(
        ['institution-settings', institutionId], 
        (oldData: InstitutionSettings | undefined) => {
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
    onError: (error: any) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações de conversas:', error);
    }
  });
};

// Hook para atualizar apenas configurações de UI
export const useUpdateUISettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, settings }: { 
      institutionId: string; 
      settings: Partial<UISettings>
    }): Promise<UISettings> => {
      console.log('🎨 [FRONTEND] Atualizando configurações de UI:', { institutionId, settings });
      
      const response = await apiService.updateUISettings(institutionId, settings);
      
      return response.data;
    },
    onSuccess: (updatedUISettings, { institutionId }) => {
      // Atualizar cache parcialmente
      queryClient.setQueryData(
        ['institution-settings', institutionId], 
        (oldData: InstitutionSettings | undefined) => {
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
    onError: (error: any) => {
      console.error('❌ [FRONTEND] Erro ao atualizar configurações de UI:', error);
    }
  });
};
