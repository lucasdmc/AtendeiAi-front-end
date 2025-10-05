import { useState, useEffect, useCallback } from 'react';

// Interfaces
interface ConversationFilters {
  clinic_id: string;
  status?: 'active' | 'closed' | 'archived';
  assigned_to?: string;
  search?: string;
  tab?: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
  agent_id?: string;
  sector_id?: string;
}

interface FilterState {
  filters: ConversationFilters;
  isDirty: boolean;
  hasActiveFilters: boolean;
}

/**
 * Hook para gerenciar filtros de conversas com persistência no localStorage
 */
export function useConversationFilters(initialFilters?: Partial<ConversationFilters>) {
  // Chave para localStorage baseada na clínica
  const storageKey = useCallback((clinicId: string) => 
    `conversation-filters-${clinicId}`, 
    []
  );
  
  // Estado inicial dos filtros
  const getInitialFilters = useCallback((): ConversationFilters => {
    if (initialFilters?.clinic_id) {
      const saved = localStorage.getItem(storageKey(initialFilters.clinic_id));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...initialFilters, ...parsed };
        } catch (error) {
          console.warn('Erro ao carregar filtros salvos:', error);
        }
      }
    }
    
    return {
      clinic_id: initialFilters?.clinic_id || '',
      status: initialFilters?.status || 'active',
      assigned_to: initialFilters?.assigned_to,
      search: initialFilters?.search,
      tab: initialFilters?.tab,
      agent_id: initialFilters?.agent_id,
      sector_id: initialFilters?.sector_id
    };
  }, [initialFilters, storageKey]);
  
  // Estado dos filtros
  const [state, setState] = useState<FilterState>(() => {
    const filters = getInitialFilters();
    return {
      filters,
      isDirty: false,
      hasActiveFilters: hasActiveFilters(filters)
    };
  });
  
  // Função para verificar se há filtros ativos
  function hasActiveFilters(filters: ConversationFilters): boolean {
    return !!(
      filters.status && filters.status !== 'active' ||
      filters.assigned_to ||
      filters.search ||
      filters.tab ||
      filters.agent_id ||
      filters.sector_id
    );
  }
  
  // Função para salvar filtros no localStorage
  const saveFilters = useCallback((filters: ConversationFilters) => {
    if (filters.clinic_id) {
      try {
        localStorage.setItem(storageKey(filters.clinic_id), JSON.stringify(filters));
      } catch (error) {
        console.warn('Erro ao salvar filtros:', error);
      }
    }
  }, [storageKey]);
  
  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const isDirty = JSON.stringify(updatedFilters) !== JSON.stringify(prev.filters);
      const hasActiveFiltersValue = hasActiveFilters(updatedFilters);
      
      // Salvar no localStorage
      saveFilters(updatedFilters);
      
      return {
        filters: updatedFilters,
        isDirty,
        hasActiveFilters: hasActiveFiltersValue
      };
    });
  }, [saveFilters]);
  
  // Função para definir filtros específicos
  const setStatus = useCallback((status: ConversationFilters['status']) => {
    updateFilters({ status });
  }, [updateFilters]);
  
  const setAssignedTo = useCallback((assigned_to: ConversationFilters['assigned_to']) => {
    updateFilters({ assigned_to });
  }, [updateFilters]);
  
  const setSearch = useCallback((search: ConversationFilters['search']) => {
    updateFilters({ search });
  }, [updateFilters]);
  
  const setTab = useCallback((tab: ConversationFilters['tab']) => {
    updateFilters({ tab });
  }, [updateFilters]);
  
  const setAgentId = useCallback((agent_id: ConversationFilters['agent_id']) => {
    updateFilters({ agent_id });
  }, [updateFilters]);
  
  const setSectorId = useCallback((sector_id: ConversationFilters['sector_id']) => {
    updateFilters({ sector_id });
  }, [updateFilters]);
  
  // Função para resetar filtros
  const resetFilters = useCallback(() => {
    const defaultFilters: ConversationFilters = {
      clinic_id: state.filters.clinic_id,
      status: 'active',
      assigned_to: undefined,
      search: undefined,
      tab: undefined,
      agent_id: undefined,
      sector_id: undefined
    };
    
    setState({
      filters: defaultFilters,
      isDirty: false,
      hasActiveFilters: false
    });
    
    saveFilters(defaultFilters);
  }, [state.filters.clinic_id, saveFilters]);
  
  // Função para limpar filtros específicos
  const clearStatus = useCallback(() => {
    updateFilters({ status: undefined });
  }, [updateFilters]);
  
  const clearAssignedTo = useCallback(() => {
    updateFilters({ assigned_to: undefined });
  }, [updateFilters]);
  
  const clearSearch = useCallback(() => {
    updateFilters({ search: undefined });
  }, [updateFilters]);
  
  const clearTab = useCallback(() => {
    updateFilters({ tab: undefined });
  }, [updateFilters]);
  
  const clearAgentId = useCallback(() => {
    updateFilters({ agent_id: undefined });
  }, [updateFilters]);
  
  const clearSectorId = useCallback(() => {
    updateFilters({ sector_id: undefined });
  }, [updateFilters]);
  
  // Função para aplicar múltiplos filtros
  const applyFilters = useCallback((filters: Partial<ConversationFilters>) => {
    updateFilters(filters);
  }, [updateFilters]);
  
  // Função para obter filtros ativos como string
  const getActiveFiltersString = useCallback(() => {
    const activeFilters: string[] = [];
    
    if (state.filters.status && state.filters.status !== 'active') {
      activeFilters.push(`Status: ${state.filters.status}`);
    }
    
    if (state.filters.assigned_to) {
      activeFilters.push(`Atribuído: ${state.filters.assigned_to}`);
    }
    
    if (state.filters.search) {
      activeFilters.push(`Busca: "${state.filters.search}"`);
    }
    
    if (state.filters.tab) {
      const tabNames = {
        bot: 'Bot/IA',
        entrada: 'Entrada',
        aguardando: 'Aguardando',
        em_atendimento: 'Em Atendimento',
        finalizadas: 'Finalizadas'
      };
      activeFilters.push(`Aba: ${tabNames[state.filters.tab]}`);
    }
    
    if (state.filters.agent_id) {
      activeFilters.push(`Agente: ${state.filters.agent_id}`);
    }
    
    if (state.filters.sector_id) {
      activeFilters.push(`Setor: ${state.filters.sector_id}`);
    }
    
    return activeFilters.join(', ');
  }, [state.filters]);
  
  // Função para verificar se um filtro específico está ativo
  const hasFilter = useCallback((key: keyof ConversationFilters, value?: any) => {
    if (value !== undefined) {
      return state.filters[key] === value;
    }
    return state.filters[key] !== undefined && state.filters[key] !== null;
  }, [state.filters]);
  
  // Função para obter contagem de filtros ativos
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    
    if (state.filters.status && state.filters.status !== 'active') count++;
    if (state.filters.assigned_to) count++;
    if (state.filters.search) count++;
    if (state.filters.tab) count++;
    if (state.filters.agent_id) count++;
    if (state.filters.sector_id) count++;
    
    return count;
  }, [state.filters]);
  
  // Salvar filtros quando mudarem
  useEffect(() => {
    if (state.filters.clinic_id) {
      saveFilters(state.filters);
    }
  }, [state.filters, saveFilters]);
  
  // Carregar filtros quando clinic_id mudar
  useEffect(() => {
    if (initialFilters?.clinic_id && initialFilters.clinic_id !== state.filters.clinic_id) {
      const saved = localStorage.getItem(storageKey(initialFilters.clinic_id));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updatedFilters = { ...initialFilters, ...parsed };
          setState({
            filters: updatedFilters,
            isDirty: false,
            hasActiveFilters: hasActiveFilters(updatedFilters)
          });
        } catch (error) {
          console.warn('Erro ao carregar filtros salvos:', error);
        }
      }
    }
  }, [initialFilters?.clinic_id, storageKey]);
  
  return {
    // Estado
    filters: state.filters,
    isDirty: state.isDirty,
    hasActiveFilters: state.hasActiveFilters,
    
    // Ações de atualização
    updateFilters,
    setStatus,
    setAssignedTo,
    setSearch,
    setTab,
    setAgentId,
    setSectorId,
    applyFilters,
    
    // Ações de limpeza
    resetFilters,
    clearStatus,
    clearAssignedTo,
    clearSearch,
    clearTab,
    clearAgentId,
    clearSectorId,
    
    // Utilitários
    getActiveFiltersString,
    hasFilter,
    getActiveFiltersCount,
    
    // Estado individual dos filtros
    status: state.filters.status,
    assignedTo: state.filters.assigned_to,
    search: state.filters.search,
    tab: state.filters.tab,
    agentId: state.filters.agent_id,
    sectorId: state.filters.sector_id
  };
}
