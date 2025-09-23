import { useState, useMemo, useCallback } from 'react';
import { Conversation, UseConversationFiltersReturn, FilterOption } from '../types';
import { 
  filterConversationsBySearch, 
  filterConversationsByType, 
  getUnreadConversationsCount 
} from '../utils';
import { useDebounce } from '../utils/performance';
import { Users, Bot, MessageCircle, Flag } from 'lucide-react';

export const useConversationFilters = (
  conversations: Conversation[],
  searchTerm: string,
  activeFilter: string
): UseConversationFiltersReturn => {
  const [selectedFilterFlags, setSelectedFilterFlags] = useState<string[]>([]);
  
  // Debounce do termo de busca para melhor performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Opções de filtro com contadores dinâmicos (memoizadas)
  const filterOptions: FilterOption[] = useMemo(() => {
    const manualCount = conversations.filter(c => !!c.assigned_user_id).length;
    const iaCount = conversations.filter(c => !c.assigned_user_id).length;
    const unreadCount = getUnreadConversationsCount(conversations);

    return [
      { 
        id: 'all', 
        label: 'Tudo', 
        value: 'Tudo', 
        count: conversations.length 
      },
      { 
        id: 'manual', 
        label: 'Manual', 
        value: 'Manual', 
        icon: Users, 
        count: manualCount 
      },
      { 
        id: 'ia', 
        label: 'IA', 
        value: 'IA', 
        icon: Bot, 
        count: iaCount 
      },
      { 
        id: 'unread', 
        label: 'Não lidas', 
        value: 'Não lidas', 
        icon: MessageCircle, 
        count: unreadCount 
      },
      { 
        id: 'flags', 
        label: 'Flags Personalizadas', 
        value: 'Flags Personalizadas', 
        icon: Flag, 
        count: 0 // Será atualizado quando implementarmos flags reais
      }
    ];
  }, [conversations]);

  // Conversas filtradas (otimizado com debounce)
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Aplica filtro de busca com debounce
    if (debouncedSearchTerm.trim()) {
      result = filterConversationsBySearch(result, debouncedSearchTerm);
    }

    // Aplica filtro por tipo
    result = filterConversationsByType(result, activeFilter);

    // Aplica filtros de flags personalizadas (quando implementado)
    if (activeFilter === 'Flags Personalizadas' && selectedFilterFlags.length > 0) {
      // TODO: Implementar filtro por flags quando tiver integração real
      console.log('Filtros de flags selecionados:', selectedFilterFlags);
    }

    return result;
  }, [conversations, debouncedSearchTerm, activeFilter, selectedFilterFlags]);

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
