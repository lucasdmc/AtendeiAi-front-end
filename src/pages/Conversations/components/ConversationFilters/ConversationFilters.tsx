import React from 'react';
import { 
  Users, 
  MessageCircle, 
  Star,
  Bot,
  User,
  Tag,
  Activity
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { FilterChip } from './FilterChip';
import { FilterDropdown } from './FilterDropdown';
import { Conversation } from '../../../../services/api';
import { applyConfigurationFilters } from '../../utils/helpers';

interface ConversationFiltersProps {
  activeFilter: string;
  activeTab: string; // Nova prop para controlar as abas
  conversations: Conversation[];
  onFilterChange: (filter: string) => void;
  onTabChange: (tab: string) => void; // Nova prop para mudança de aba
  onAdvancedFilter: (type: string, values: string[]) => void;
  clinicSettings?: any;
}

// Definir tipos de filtros rápidos
const quickFilters = [
  {
    key: 'Tudo',
    label: 'Tudo',
    variant: 'primary' as const
  },
  {
    key: 'Não lidas',
    label: 'Não lidas',
    icon: MessageCircle,
    variant: 'warning' as const,
    showCount: true
  },
  {
    key: 'BOT',
    label: 'BOT',
    icon: Bot,
    variant: 'primary' as const
  },
  {
    key: 'Grupos',
    label: 'Grupos',
    icon: Users,
    variant: 'secondary' as const
  },
  {
    key: 'Individuais',
    label: 'Individuais',
    icon: MessageCircle,
    variant: 'secondary' as const
  },
  {
    key: 'Favoritas',
    label: 'Favoritas',
    icon: Star,
    variant: 'info' as const
  }
];

// Opções para filtros avançados
const statusOptions = [
  { value: 'active', label: 'Ativo', icon: Activity },
  { value: 'inactive', label: 'Inativo' },
  { value: 'paused', label: 'Pausado' }
];

const userOptions = [
  { value: 'bot', label: 'Bot/IA', icon: Bot },
  { value: 'human', label: 'Humano', icon: User },
  { value: 'unassigned', label: 'Não atribuído' }
];

const tagOptions = [
  { value: 'urgent', label: 'Urgente', icon: Tag },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'complaint', label: 'Reclamação' },
  { value: 'support', label: 'Suporte' },
  { value: 'vip', label: 'VIP' },
  { value: 'priority', label: 'Prioridade' }
];

export const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  activeFilter,
  activeTab,
  conversations,
  onFilterChange,
  onTabChange,
  onAdvancedFilter,
  clinicSettings
}) => {
  // Estados para filtros avançados
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Aplicar filtros de configuração primeiro para contadores consistentes
  const configFilteredConversations = React.useMemo(() => {
    return applyConfigurationFilters(conversations, clinicSettings?.conversations);
  }, [conversations, clinicSettings?.conversations]);

  // Função para determinar o status da conversa baseado em lógica de negócio
  const getConversationStatus = (conversation: Conversation): 'inbox' | 'waiting' | 'finished' => {
    // Lógica baseada no status atual da conversa
    if (conversation.status === 'closed' || conversation.status === 'archived') {
      return 'finished';
    }
    // Para determinar "waiting", podemos usar uma lógica baseada em assigned_to ou outros campos
    // Por enquanto, vamos considerar que conversas sem assigned_to ou com assigned_to === 'waiting' estão esperando
    if (!conversation.assigned_to || conversation.assigned_to === 'waiting') {
      return 'waiting';
    }
    return 'inbox'; // conversas ativas e atribuídas
  };

  // Calcular contadores das abas
  const getTabCount = (tab: string): number => {
    switch (tab) {
      case 'inbox':
        return configFilteredConversations.filter(c => getConversationStatus(c) === 'inbox').length;
      case 'waiting':
        return configFilteredConversations.filter(c => getConversationStatus(c) === 'waiting').length;
      case 'finished':
        return configFilteredConversations.filter(c => getConversationStatus(c) === 'finished').length;
      default:
        return 0;
    }
  };

  const inboxCount = getTabCount('inbox');

  // Calcular contadores usando conversas já filtradas pelas configurações
  const getFilterCount = (filterKey: string): number => {
    switch (filterKey) {
      case 'Não lidas':
        const unreadCount = configFilteredConversations.filter(c => (c.unread_count || 0) > 0).length;
        // Debug temporário
        if (import.meta.env.DEV) {
          console.log('🔍 [DEBUG] Contadores de filtros:', {
            totalConversations: conversations.length,
            configFiltered: configFilteredConversations.length,
            unreadCount,
            unreadConversations: configFilteredConversations.filter(c => (c.unread_count || 0) > 0).map(c => ({
              id: c._id,
              name: c.customer_name || c.group_name,
              unread_count: c.unread_count,
              phone: c.customer_phone
            }))
          });
        }
        return unreadCount;
      case 'BOT':
        return configFilteredConversations.filter(c => c.assigned_to === 'bot' || c.assigned_to === 'ai').length;
      case 'Grupos':
        return configFilteredConversations.filter(c => c.conversation_type === 'group').length;
      case 'Individuais':
        return configFilteredConversations.filter(c => c.conversation_type === 'individual').length;
      case 'Favoritas':
        return configFilteredConversations.filter(c => c.is_favorite).length;
      default:
        return 0;
    }
  };

  // Handler para filtros rápidos com toggle
  const handleQuickFilterClick = (filterKey: string) => {
    // Se o filtro já está ativo, desseleciona (volta para "Tudo")
    if (activeFilter === filterKey) {
      onFilterChange('Tudo');
    } else {
      onFilterChange(filterKey);
    }
  };

  // Handlers para filtros avançados
  const handleStatusChange = (values: string[]) => {
    setSelectedStatus(values);
    onAdvancedFilter('status', values);
  };

  const handleUsersChange = (values: string[]) => {
    setSelectedUsers(values);
    onAdvancedFilter('users', values);
  };

  const handleTagsChange = (values: string[]) => {
    setSelectedTags(values);
    onAdvancedFilter('tags', values);
  };

  return (
    <div className="space-y-3">
      {/* Container com scroll horizontal para filtros */}
      <div className="overflow-x-auto">
        <div className="flex items-center space-x-2 pb-2 min-w-max">
          {/* Filtros rápidos (chips) */}
          <div className="flex items-center space-x-2">
            {quickFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                isActive={activeFilter === filter.key}
                onClick={() => handleQuickFilterClick(filter.key)}
                icon={filter.icon}
                count={filter.showCount ? getFilterCount(filter.key) : undefined}
                variant={filter.variant}
              />
            ))}
          </div>

          {/* Separador visual */}
          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Filtros avançados (dropdowns) */}
          <div className="flex items-center space-x-2">
            <FilterDropdown
              label="Status"
              icon={Activity}
              options={statusOptions}
              selectedValues={selectedStatus}
              onSelectionChange={handleStatusChange}
            />

            <FilterDropdown
              label="Usuários"
              icon={User}
              options={userOptions}
              selectedValues={selectedUsers}
              onSelectionChange={handleUsersChange}
            />

            <FilterDropdown
              label="Etiquetas"
              icon={Tag}
              options={tagOptions}
              selectedValues={selectedTags}
              onSelectionChange={handleTagsChange}
            />
          </div>
        </div>
      </div>

      {/* Abas de Status das Conversas - Posicionadas ABAIXO dos filtros */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === 'inbox' ? 'default' : 'ghost'}
          size="sm"
          className={`rounded-full px-4 ${
            activeTab === 'inbox' 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => onTabChange('inbox')}
        >
          Entrada
          {activeTab === 'inbox' && (
            <Badge className="ml-2 bg-white text-blue-500 hover:bg-white px-2 py-0.5 text-xs">
              {inboxCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'waiting' ? 'default' : 'ghost'}
          size="sm"
          className={`rounded-full px-4 ${
            activeTab === 'waiting' 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => onTabChange('waiting')}
        >
          Esperando
          {activeTab === 'waiting' && (
            <Badge className="ml-2 bg-white text-blue-500 hover:bg-white px-2 py-0.5 text-xs">
              {getTabCount('waiting')}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'finished' ? 'default' : 'ghost'}
          size="sm"
          className={`rounded-full px-4 ${
            activeTab === 'finished' 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => onTabChange('finished')}
        >
          Finalizados
          {activeTab === 'finished' && (
            <Badge className="ml-2 bg-white text-blue-500 hover:bg-white px-2 py-0.5 text-xs">
              {getTabCount('finished')}
            </Badge>
          )}
        </Button>
      </div>

      {/* Indicador de filtros ativos */}
      {(selectedStatus.length > 0 || selectedUsers.length > 0 || selectedTags.length > 0) && (
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Filtros ativos:</span>
          {selectedStatus.length > 0 && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              Status ({selectedStatus.length})
            </span>
          )}
          {selectedUsers.length > 0 && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              Usuários ({selectedUsers.length})
            </span>
          )}
          {selectedTags.length > 0 && (
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              Etiquetas ({selectedTags.length})
            </span>
          )}
          <button
            onClick={() => {
              setSelectedStatus([]);
              setSelectedUsers([]);
              setSelectedTags([]);
              onAdvancedFilter('clear', []);
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};
