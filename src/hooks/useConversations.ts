import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { conversationService } from '../services/api/ConversationService';
import { useWebSocket } from './useWebSocket';
import { useConversationFilters } from './useConversationFilters';

// Interfaces
interface Conversation {
  id: string;
  clinic_id: string;
  customer_name: string;
  customer_phone: string;
  status: 'active' | 'closed' | 'archived';
  assigned_user_id?: string;
  last_message?: {
    content: string;
    timestamp: Date;
    sender_type: string;
  };
  unread_count: number;
  flags: any[];
  current_session_id?: string;
  created_at: Date;
  updated_at: Date;
}

interface ConversationFilters {
  clinic_id: string;
  status?: 'active' | 'closed' | 'archived';
  assigned_to?: string;
  search?: string;
  tab?: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
  agent_id?: string;
  sector_id?: string;
}

interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
}

interface TabCounters {
  bot: number;
  entrada: number;
  aguardando: number;
  em_atendimento: number;
  finalizadas: number;
}

/**
 * Hook para gerenciar conversas com cache inteligente e tempo real
 */
export function useConversations(filters: ConversationFilters) {
  const queryClient = useQueryClient();
  const { filters: activeFilters, updateFilters } = useConversationFilters();
  const { socket, isConnected } = useWebSocket({ roomId: filters.clinic_id, roomType: 'clinic' });
  
  // Estado local
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chave de cache baseada nos filtros
  const queryKey = useMemo(() => [
    'conversations',
    filters.clinic_id,
    filters.status,
    filters.assigned_to,
    filters.search,
    filters.tab,
    filters.agent_id,
    filters.sector_id
  ], [filters]);
  
  // Query principal com paginação infinita
  const {
    data,
    error: queryError,
    isLoading: queryLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🔍 [useConversations] Fazendo query com filtros:', {
        ...filters,
        limit: '50',
        offset: pageParam.toString()
      });
      
      const response = await conversationService.getConversations({
        ...filters,
        limit: '50',
        offset: pageParam.toString()
      });
      
      console.log('🔍 [useConversations] Resposta recebida:', {
        conversationsCount: response.conversations.length,
        total: response.total,
        hasMore: response.hasMore,
        firstConversation: response.conversations[0] ? {
          id: response.conversations[0].id,
          status: response.conversations[0].status,
          customer_name: response.conversations[0].customer_name
        } : null
      });
      
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const totalLoaded = allPages.reduce((acc, page: any) => acc + page.conversations.length, 0);
      return lastPage.hasMore ? totalLoaded : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  // Query para contadores por aba
  const {
    data: tabCounters,
    error: countersError,
    isLoading: countersLoading,
    refetch: refetchCounters
  } = useQuery({
    queryKey: ['conversation-counters', filters.clinic_id],
    queryFn: () => conversationService.getTabCounters(filters.clinic_id),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    enabled: !!filters.clinic_id
  });
  
  // Combinar dados de todas as páginas
  const conversations = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page.conversations);
  }, [data]);
  
  // Total de conversas
  const total = useMemo(() => {
    return (data?.pages?.[0] as any)?.total || 0;
  }, [data]);
  
  // Estado de loading combinado
  const combinedLoading = isLoading || queryLoading || countersLoading;
  
  // Estado de erro combinado
  const combinedError = error || queryError || countersError;
  
  // Função para carregar mais conversas
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Função para atualizar filtros
  const updateFiltersAndRefetch = useCallback(async (newFilters: Partial<ConversationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    updateFilters(updatedFilters);
    
    // Invalidar cache e refetch
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    await refetch();
  }, [filters, updateFilters, queryClient, refetch]);
  
  // Função para buscar conversas
  const searchConversations = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateFiltersAndRefetch({ search: searchTerm.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar conversas');
    } finally {
      setIsLoading(false);
    }
  }, [updateFiltersAndRefetch]);
  
  // Função para filtrar por aba
  const filterByTab = useCallback(async (tab: ConversationFilters['tab']) => {
    await updateFiltersAndRefetch({ tab });
  }, [updateFiltersAndRefetch]);
  
  // Função para filtrar por status
  const filterByStatus = useCallback(async (status: ConversationFilters['status']) => {
    await updateFiltersAndRefetch({ status });
  }, [updateFiltersAndRefetch]);
  
  // Função para filtrar por agente
  const filterByAgent = useCallback(async (agentId: string) => {
    await updateFiltersAndRefetch({ agent_id: agentId });
  }, [updateFiltersAndRefetch]);
  
  // Função para resetar filtros
  const resetFilters = useCallback(async () => {
    await updateFiltersAndRefetch({
      status: 'active',
      assigned_to: undefined,
      search: undefined,
      tab: undefined,
      agent_id: undefined,
      sector_id: undefined
    });
  }, [updateFiltersAndRefetch]);
  
  // Função para atualizar uma conversa específica
  const updateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: ConversationListResponse) => ({
          ...page,
          conversations: page.conversations.map(conv => 
            conv.id === conversationId ? { ...conv, ...updates } : conv
          )
        }))
      };
    });
  }, [queryClient, queryKey]);
  
  // Função para adicionar uma nova conversa
  const addConversation = useCallback((conversation: Conversation) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: ConversationListResponse, index: number) => {
          if (index === 0) {
            return {
              ...page,
              conversations: [conversation, ...page.conversations],
              total: page.total + 1
            };
          }
          return page;
        })
      };
    });
  }, [queryClient, queryKey]);
  
  // Função para remover uma conversa
  const removeConversation = useCallback((conversationId: string) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: ConversationListResponse) => ({
          ...page,
          conversations: page.conversations.filter(conv => conv.id !== conversationId),
          total: Math.max(0, page.total - 1)
        }))
      };
    });
  }, [queryClient, queryKey]);
  
  // Escutar eventos WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Evento: Nova conversa
    const handleNewConversation = (data: { conversation: Conversation }) => {
      addConversation(data.conversation);
    };
    
    // Evento: Conversa atualizada
    const handleConversationUpdated = (data: { 
      conversationId: string; 
      updates: Partial<Conversation> 
    }) => {
      updateConversation(data.conversationId, data.updates);
    };
    
    // Evento: Conversa removida
    const handleConversationRemoved = (data: { conversationId: string }) => {
      removeConversation(data.conversationId);
    };
    
    // Evento: Contadores atualizados
    const handleCountersUpdated = (data: { counters: TabCounters }) => {
      queryClient.setQueryData(['conversation-counters', filters.clinic_id], data.counters);
    };
    
    // Registrar listeners
    socket.on('conversation_created', handleNewConversation);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('conversation_removed', handleConversationRemoved);
    socket.on('counters_updated', handleCountersUpdated);
    
    // Cleanup
    return () => {
      socket.off('conversation_created', handleNewConversation);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('conversation_removed', handleConversationRemoved);
      socket.off('counters_updated', handleCountersUpdated);
    };
  }, [socket, isConnected, addConversation, updateConversation, removeConversation, queryClient, filters.clinic_id]);
  
  // Refetch automático quando reconectar
  useEffect(() => {
    if (isConnected && !isRefetching) {
      refetch();
      refetchCounters();
    }
  }, [isConnected, isRefetching, refetch, refetchCounters]);
  
  return {
    // Dados
    conversations,
    total,
    tabCounters: tabCounters || {
      bot: 0,
      entrada: 0,
      aguardando: 0,
      em_atendimento: 0,
      finalizadas: 0
    },
    
    // Estados
    isLoading: combinedLoading,
    error: combinedError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
    
    // Filtros
    filters: activeFilters,
    
    // Ações
    loadMore,
    searchConversations,
    filterByTab,
    filterByStatus,
    filterByAgent,
    resetFilters,
    updateConversation,
    addConversation,
    removeConversation,
    refetch,
    refetchCounters,
    
    // Utilitários
    isEmpty: conversations.length === 0,
    hasData: conversations.length > 0,
    canLoadMore: hasNextPage && !isFetchingNextPage
  };
}

// Exportar query keys para uso em outros hooks
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationFilters) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  counters: (clinicId: string) => [...conversationKeys.all, 'counters', clinicId] as const,
};