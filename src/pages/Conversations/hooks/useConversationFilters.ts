import { useState, useMemo, useCallback } from 'react';
import { UseConversationFiltersReturn, FilterOption } from '../types';
import { Conversation } from '../../../services/api';
import { 
  filterConversationsBySearch, 
  filterConversationsByType, 
  applyConfigurationFilters,
  getUnreadConversationsCount 
} from '../utils';
import { useDebounce } from '../utils/performance';
import { Users, MessageCircle, Flag } from 'lucide-react';

export const useConversationFilters = (
  conversations: Conversation[],
  searchTerm: string,
  activeFilter: string,
  settings?: {
    show_newsletter?: boolean;
    show_groups?: boolean;
  }
): UseConversationFiltersReturn => {
  const [selectedFilterFlags, setSelectedFilterFlags] = useState<string[]>([]);
  
  // Debounce do termo de busca para melhor performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Aplicar filtros de configuração primeiro
  const configFilteredConversations = useMemo(() => {
    return applyConfigurationFilters(conversations, settings);
  }, [conversations, settings]);

  // Opções de filtro com contadores dinâmicos (memoizadas)
  const filterOptions: FilterOption[] = useMemo(() => {
    const manualCount = configFilteredConversations.filter(c => !!c.assigned_user_id).length;
    const unreadCount = getUnreadConversationsCount(configFilteredConversations);
    const groupsCount = configFilteredConversations.filter(c => c.conversation_type === 'group').length;
    const individualsCount = configFilteredConversations.filter(c => c.conversation_type === 'individual').length;

    const baseOptions = [
      { 
        id: 'all', 
        label: 'Tudo', 
        value: 'Tudo', 
        count: configFilteredConversations.length 
      },
      { 
        id: 'manual', 
        label: 'Manual', 
        value: 'Manual', 
        icon: Users, 
        count: manualCount 
      },
      { 
        id: 'unread', 
        label: 'Não lidas', 
        value: 'Não lidas', 
        icon: MessageCircle, 
        count: unreadCount 
      }
    ];

    // Adicionar filtros condicionalmente baseado nas configurações
    if (settings?.show_groups !== false && groupsCount > 0) {
      baseOptions.push({
        id: 'groups',
        label: 'Grupos',
        value: 'Grupos',
        icon: Users,
        count: groupsCount
      });
    }

    if (settings?.show_groups !== false && individualsCount > 0) {
      baseOptions.push({
        id: 'individuals',
        label: 'Individuais',
        value: 'Individuais',
        icon: Users,
        count: individualsCount
      });
    }

    baseOptions.push({
      id: 'flags', 
      label: 'Flags Personalizadas', 
      value: 'Flags Personalizadas', 
      icon: Flag, 
      count: 0 // Será atualizado quando implementarmos flags reais
    });

    return baseOptions;
  }, [configFilteredConversations, settings]);

  // Conversas filtradas (otimizado com debounce)
  const filteredConversations = useMemo(() => {
    let result = configFilteredConversations;

    // Aplica filtro de busca com debounce
    if (debouncedSearchTerm.trim()) {
      result = filterConversationsBySearch(result, debouncedSearchTerm);
    }

    // Aplica filtro por tipo (já com configurações aplicadas)
    result = filterConversationsByType(result, activeFilter, settings);

    // Aplica filtros de flags personalizadas (quando implementado)
    if (activeFilter === 'Flags Personalizadas' && selectedFilterFlags.length > 0) {
      // TODO: Implementar filtro por flags quando tiver integração real
      console.log('Filtros de flags selecionados:', selectedFilterFlags);
    }

    return result;
  }, [configFilteredConversations, debouncedSearchTerm, activeFilter, selectedFilterFlags, settings]);

  // Handler para clique em filtro
  const handleFilterClick = useCallback((filter: string) => {
    // Lógica específica para cada tipo de filtro pode ser adicionada aqui
    console.log('Filtro selecionado:', filter);
  }, []);

  // Aplica filtros customizados (usado no modal de filtros)
  const applyCustomFilters = useCallback(() => {
    console.log('Aplicando filtros customizados:', {
      selectedFilterFlags,
      activeFilter
    });
    
    // Aqui seria implementada a lógica para aplicar filtros mais complexos
    // Por exemplo, combinações de flags, filtros por data, etc.
  }, [selectedFilterFlags, activeFilter]);

  return {
    filteredConversations,
    filterOptions,
    selectedFilterFlags,
    handleFilterClick,
    setSelectedFilterFlags,
    applyCustomFilters
  };
};
