import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/api/ConversationService';
import { useWebSocket } from './useWebSocket';

// Interfaces
interface ConversationActionData {
  conversationId: string;
  clinicId: string;
  userId?: string;
  reason?: string;
  feedback?: string;
  agentId?: string;
  sectorId?: string;
  flagId?: string;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Hook para gerenciar ações de conversas (assumir, transferir, fechar, etc.)
 */
export function useConversationActions(clinicId: string) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useWebSocket({ clinicId });
  
  // Estado local
  const [isPending, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mutation para assumir conversa
  const assumeConversationMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.assignConversation(data.conversationId, {
        agentId: data.userId || 'current-user', // TODO: pegar do contexto de auth
        reason: data.reason || 'Conversa assumida pelo usuário'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_assigned', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          agentId: variables.userId,
          agentName: 'Usuário Atual' // TODO: pegar nome do usuário
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao assumir conversa');
    }
  });
  
  // Mutation para transferir conversa
  const transferConversationMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.transferConversation(data.conversationId, {
        agentId: data.agentId,
        sectorId: data.sectorId,
        reason: data.reason || 'Conversa transferida'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_transferred', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          fromAgentId: variables.userId,
          toAgentId: variables.agentId,
          reason: variables.reason
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao transferir conversa');
    }
  });
  
  // Mutation para fechar conversa
  const closeConversationMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.closeConversation(data.conversationId, {
        reason: data.reason || 'Conversa fechada pelo usuário',
        feedback: data.feedback,
        closedBy: data.userId || 'current-user' // TODO: pegar do contexto de auth
      });
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_closed', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          closedBy: variables.userId,
          reason: variables.reason
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao fechar conversa');
    }
  });
  
  // Mutation para arquivar conversa
  const archiveConversationMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.updateConversation(data.conversationId, {
        status: 'archived'
      });
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-counters'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_archived', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          archivedBy: variables.userId
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao arquivar conversa');
    }
  });
  
  // Mutation para aplicar flag
  const applyFlagMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.applyFlag(data.conversationId, {
        flagId: data.flagId!
      });
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_flagged', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          flagId: variables.flagId,
          appliedBy: variables.userId
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao aplicar flag');
    }
  });
  
  // Mutation para remover flag
  const removeFlagMutation = useMutation({
    mutationFn: async (data: ConversationActionData) => {
      return await conversationService.removeFlag(data.conversationId, data.flagId!);
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Emitir evento WebSocket
      if (socket && isConnected) {
        socket.emit('conversation_unflagged', {
          conversationId: variables.conversationId,
          clinicId: variables.clinicId,
          flagId: variables.flagId,
          removedBy: variables.userId
        });
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Erro ao remover flag');
    }
  });
  
  // Função para assumir conversa
  const assumeConversation = useCallback(async (conversationId: string, reason?: string): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await assumeConversationMutation.mutateAsync({
        conversationId,
        clinicId,
        reason
      });
      
      return {
        success: true,
        message: 'Conversa assumida com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao assumir conversa';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [assumeConversationMutation, clinicId]);
  
  // Função para transferir conversa
  const transferConversation = useCallback(async (
    conversationId: string, 
    agentId?: string, 
    sectorId?: string, 
    reason?: string
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await transferConversationMutation.mutateAsync({
        conversationId,
        clinicId,
        agentId,
        sectorId,
        reason
      });
      
      return {
        success: true,
        message: 'Conversa transferida com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao transferir conversa';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [transferConversationMutation, clinicId]);
  
  // Função para fechar conversa
  const closeConversation = useCallback(async (
    conversationId: string, 
    reason?: string, 
    feedback?: string
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await closeConversationMutation.mutateAsync({
        conversationId,
        clinicId,
        reason,
        feedback
      });
      
      return {
        success: true,
        message: 'Conversa fechada com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fechar conversa';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [closeConversationMutation, clinicId]);
  
  // Função para arquivar conversa
  const archiveConversation = useCallback(async (conversationId: string): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await archiveConversationMutation.mutateAsync({
        conversationId,
        clinicId
      });
      
      return {
        success: true,
        message: 'Conversa arquivada com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao arquivar conversa';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [archiveConversationMutation, clinicId]);
  
  // Função para aplicar flag
  const applyFlag = useCallback(async (conversationId: string, flagId: string): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await applyFlagMutation.mutateAsync({
        conversationId,
        clinicId,
        flagId
      });
      
      return {
        success: true,
        message: 'Flag aplicada com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aplicar flag';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [applyFlagMutation, clinicId]);
  
  // Função para remover flag
  const removeFlag = useCallback(async (conversationId: string, flagId: string): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await removeFlagMutation.mutateAsync({
        conversationId,
        clinicId,
        flagId
      });
      
      return {
        success: true,
        message: 'Flag removida com sucesso',
        data: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover flag';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [removeFlagMutation, clinicId]);
  
  // Função para limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Estados
    isPending: isPending || 
      assumeConversationMutation.isPending ||
      transferConversationMutation.isPending ||
      closeConversationMutation.isPending ||
      archiveConversationMutation.isPending ||
      applyFlagMutation.isPending ||
      removeFlagMutation.isPending,
    error,
    
    // Estados individuais das mutations
    isAssuming: assumeConversationMutation.isPending,
    isTransferring: transferConversationMutation.isPending,
    isClosing: closeConversationMutation.isPending,
    isArchiving: archiveConversationMutation.isPending,
    isApplyingFlag: applyFlagMutation.isPending,
    isRemovingFlag: removeFlagMutation.isPending,
    
    // Ações
    assumeConversation,
    transferConversation,
    closeConversation,
    archiveConversation,
    applyFlag,
    removeFlag,
    clearError,
    
    // Utilitários
    canPerformAction: !isPending && !error
  };
}



