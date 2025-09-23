import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { toast } from '../components/ui/use-toast';

export interface ScheduledMessage {
  _id: string;
  conversation_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  scheduled_at: string;
  created_by: string;
  template_id?: string;
  media_url?: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string;
  cancelled_at?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

// Hook para buscar mensagens agendadas de uma conversa
export const useScheduledMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['scheduled-messages', conversationId],
    queryFn: async (): Promise<ScheduledMessage[]> => {
      if (!conversationId) {
        console.log('📅 [FRONTEND] useScheduledMessages: conversationId vazio');
        return [];
      }
      
      console.log(`📅 [FRONTEND] Buscando mensagens agendadas para conversa: ${conversationId}`);
      
      try {
        const response = await apiService.getScheduledMessages(conversationId);
        console.log(`📅 [FRONTEND] Resposta da API:`, response);
        console.log(`📅 [FRONTEND] Total de mensagens agendadas: ${response.data?.length || 0}`);
        
        if (response.data && response.data.length > 0) {
          response.data.forEach((msg: ScheduledMessage, index: number) => {
            console.log(`📅 [FRONTEND] ${index + 1}. ${msg._id} - "${msg.content}" - ${new Date(msg.scheduled_at).toLocaleString('pt-BR')}`);
          });
        }
        
        return response.data || [];
      } catch (error) {
        console.error('❌ [FRONTEND] Erro ao buscar mensagens agendadas:', error);
        return [];
      }
    },
    enabled: !!conversationId,
    staleTime: 0, // Sem cache para debug
    refetchInterval: 10000, // Refetch a cada 10 segundos para debug
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

// Hook para cancelar mensagem agendada
export const useCancelScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<ScheduledMessage> => {
      const response = await apiService.cancelScheduledMessage(messageId);
      return response.data;
    },
    onSuccess: (cancelledMessage) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['scheduled-messages', cancelledMessage.conversation_id] 
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

// Hook para editar mensagem agendada
export const useUpdateScheduledMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      content, 
      scheduled_at 
    }: { 
      messageId: string; 
      content?: string; 
      scheduled_at?: string; 
    }): Promise<ScheduledMessage> => {
      const response = await apiService.updateScheduledMessage(messageId, {
        content,
        scheduled_at
      });
      return response.data;
    },
    onSuccess: (updatedMessage) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['scheduled-messages', updatedMessage.conversation_id] 
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
