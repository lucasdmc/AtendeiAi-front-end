import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { toast } from '../components/ui/use-toast';

export interface GlobalScheduledMessage {
  _id: string;
  conversation_id: {
    _id: string;
    customer_name?: string;
    customer_phone: string;
    group_name?: string;
    conversation_type: 'individual' | 'group';
  };
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio';
  scheduled_at: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  created_by: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
    interval?: number;
    unit?: 'days' | 'weeks' | 'months' | 'years';
    daysOfWeek?: string[];
    end?: {
      mode: 'never' | 'date' | 'after';
      date?: string;
      occurrences?: number;
    };
  };
  is_recurring: boolean;
  occurrences_sent: number;
  total_occurrences?: number;
  next_execution?: string;
  sent_at?: string;
  cancelled_at?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledMessageData {
  recipients: Array<{ id?: string; name?: string; phone: string }>;
  content: string;
  scheduled_at: string;
  recurrence?: any;
}

export interface UpdateScheduledMessageData {
  content?: string;
  scheduled_at?: string;
  recurrence?: any;
}

// Hook para buscar todas as mensagens programadas
export const useGlobalScheduledMessages = (params: {
  clinic_id?: string;
  status?: 'pending' | 'sent' | 'cancelled' | 'failed';
  limit?: number;
  offset?: number;
} = {}) => {
  return useQuery({
    queryKey: ['global-scheduled-messages', params],
    queryFn: async (): Promise<{
      messages: GlobalScheduledMessage[];
      total: number;
      hasMore: boolean;
    }> => {
      try {
        const response = await apiService.getAllScheduledMessages(params);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar mensagens programadas:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Refetch a cada minuto
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

// Hook para cancelar mensagem programada
export const useCancelGlobalScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<GlobalScheduledMessage> => {
      const response = await apiService.cancelScheduledMessage(messageId);
      return response.data;
    },
    onSuccess: (cancelledMessage) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['global-scheduled-messages'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['scheduled-messages', cancelledMessage.conversation_id._id] 
      });

      toast({
        title: 'Mensagem cancelada',
        description: 'A mensagem agendada foi cancelada com sucesso.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Erro ao cancelar mensagem agendada:', error);
      
      toast({
        title: 'Erro ao cancelar',
        description: error.response?.data?.message || 'Erro ao cancelar mensagem agendada.',
        variant: 'destructive'
      });
    }
  });
};

// Hook para atualizar mensagem programada
export const useUpdateGlobalScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      data 
    }: { 
      messageId: string; 
      data: UpdateScheduledMessageData;
    }): Promise<GlobalScheduledMessage> => {
      const response = await apiService.updateScheduledMessage(messageId, data);
      return response.data;
    },
    onSuccess: (updatedMessage) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['global-scheduled-messages'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['scheduled-messages', updatedMessage.conversation_id._id] 
      });

      toast({
        title: 'Mensagem atualizada',
        description: 'A mensagem agendada foi atualizada com sucesso.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar mensagem agendada:', error);
      
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.message || 'Erro ao atualizar mensagem agendada.',
        variant: 'destructive'
      });
    }
  });
};

// Hook para criar nova mensagem programada
export const useCreateGlobalScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScheduledMessageData): Promise<GlobalScheduledMessage> => {
      const response = await apiService.createScheduledMessage(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['global-scheduled-messages'] 
      });

      toast({
        title: 'Mensagem agendada',
        description: 'A mensagem foi agendada com sucesso.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Erro ao agendar mensagem:', error);
      
      toast({
        title: 'Erro ao agendar',
        description: error.response?.data?.message || 'Erro ao agendar mensagem.',
        variant: 'destructive'
      });
    }
  });
};

// Hook para duplicar mensagem programada
export const useDuplicateGlobalScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<GlobalScheduledMessage> => {
      const response = await apiService.duplicateScheduledMessage(messageId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['global-scheduled-messages'] 
      });

      toast({
        title: 'Mensagem duplicada',
        description: 'A mensagem foi duplicada com sucesso.',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Erro ao duplicar mensagem:', error);
      
      toast({
        title: 'Erro ao duplicar',
        description: error.response?.data?.message || 'Erro ao duplicar mensagem.',
        variant: 'destructive'
      });
    }
  });
};

// Hook para buscar histórico de mensagem programada
export const useScheduledMessageHistory = (messageId: string) => {
  return useQuery({
    queryKey: ['scheduled-message-history', messageId],
    queryFn: async () => {
      const response = await apiService.getScheduledMessageHistory(messageId);
      return response.data;
    },
    enabled: !!messageId,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para buscar contatos (para seleção de destinatários)
export const useContacts = (searchTerm: string = '') => {
  return useQuery({
    queryKey: ['contacts', searchTerm],
    queryFn: async () => {
      // TODO: Implementar API de contatos
      // Por enquanto, retorna dados mock
      return [
        { id: '1', name: 'João Silva', phone: '+5547999999999' },
        { id: '2', name: 'Maria Santos', phone: '+5547888888888' },
        { id: '3', name: 'Pedro Oliveira', phone: '+5547777777777' },
      ].filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
      );
    },
    enabled: true,
    staleTime: 300000, // 5 minutos
  });
};
