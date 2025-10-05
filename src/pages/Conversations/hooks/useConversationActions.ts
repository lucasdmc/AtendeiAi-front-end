import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../../../services/api/index';
import { useToast } from '../../../components/ui/use-toast';

/**
 * Hook para ações de conversação (assumir, iniciar, finalizar, etc.)
 */
export function useConversationActions(_clinicId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Assumir conversa (ROUTING → ASSIGNED)
  const assumeConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await conversationService.assumeConversation(conversationId);
    },
    onSuccess: (_data, _conversationId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      toast({
        title: "Conversa assumida",
        description: "Você assumiu a conversa com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao assumir conversa",
        variant: "destructive",
      });
    }
  });

  // Iniciar atendimento (ASSIGNED → IN_PROGRESS)
  const startHandlingMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await conversationService.startHandling(conversationId);
    },
    onSuccess: (_data, _conversationId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      toast({
        title: "Atendimento iniciado",
        description: "Atendimento iniciado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar atendimento",
        variant: "destructive",
      });
    }
  });

  // Finalizar conversa (→ RESOLVED)
  const closeConversationMutation = useMutation({
    mutationFn: async ({ conversationId, reason }: { conversationId: string; reason?: string }) => {
      return await conversationService.closeConversation(conversationId, { reason: reason || 'Finalizada pelo atendente' });
    },
    onSuccess: (_data, { conversationId: _conversationId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      toast({
        title: "Conversa finalizada",
        description: "A conversa foi finalizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao finalizar conversa",
        variant: "destructive",
      });
    }
  });

  return {
    // Ações
    assumeConversation: (conversationId: string) => assumeConversationMutation.mutate(conversationId),
    startHandling: (conversationId: string) => startHandlingMutation.mutate(conversationId),
    closeConversation: (conversationId: string, reason?: string) => 
      closeConversationMutation.mutate({ conversationId, reason }),

    // Estados
    isAssuming: assumeConversationMutation.isPending,
    isStarting: startHandlingMutation.isPending,
    isClosing: closeConversationMutation.isPending,

    // Resultados
    assumeResult: assumeConversationMutation.data,
    startResult: startHandlingMutation.data,
    closeResult: closeConversationMutation.data,
  };
}
