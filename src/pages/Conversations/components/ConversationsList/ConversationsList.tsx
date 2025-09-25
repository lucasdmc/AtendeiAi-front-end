import React from 'react';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Search, MessageCircle } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { ConversationMenu } from './ConversationMenu';
import { ConversationsLoading, EmptyState } from '../ui';
import { ConversationFilters } from '../ConversationFilters';
import { useConversationsContext } from '../../context';
import { useConversationMenu } from '../../hooks';
import { useConversationFilters } from '../../hooks';
import { Conversation } from '../../../../services/api';

export const ConversationsList: React.FC = () => {
  const {
    conversations,
    selectedConversation,
    searchTerm,
    activeFilter,
    conversationsLoading,
    clinicSettings,
    setSelectedConversation,
    setSearchTerm,
    setActiveFilter
  } = useConversationsContext();

  // Hook para gerenciar menu das conversas
  const { openMenuId, handleMenuClick, handleMenuAction } = useConversationMenu();

  // Hook para filtros
  const {
    filteredConversations,
    handleFilterClick
  } = useConversationFilters(conversations, searchTerm, activeFilter, clinicSettings?.conversations);

  // Handler para filtros avançados
  const handleAdvancedFilter = (type: string, values: string[]) => {
    console.log('Filtro avançado aplicado:', { type, values });
    // TODO: Implementar lógica de filtros avançados
  };


  return (
    <div className="w-[420px] min-w-[420px] max-w-[420px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header com busca */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9 bg-white border-gray-300"
            placeholder="Pesquisar ou começar uma nova conversa"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Indicador de status de conexão */}
        <div className="flex items-center space-x-2 mb-3 px-2 py-1 bg-gray-50 rounded text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-green-600">Tempo real ativo</span>
        </div>

        {/* Componente de Filtros */}
        <ConversationFilters
          activeFilter={activeFilter}
          conversations={conversations}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            handleFilterClick(filter);
          }}
          onAdvancedFilter={handleAdvancedFilter}
          clinicSettings={clinicSettings}
        />
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        {conversationsLoading ? (
          <ConversationsLoading />
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-full h-full" />}
            title={searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
            description={searchTerm ? 'Tente ajustar os filtros de busca' : 'As conversas aparecerão aqui quando chegarem'}
          />
        ) : (
          <div className="relative">
            {filteredConversations.map((conversation, index) => (
              <div key={conversation._id || `conv-${index}`} className="relative">
                <ConversationItem
                  conversation={conversation as Conversation}
                  isSelected={selectedConversation?._id === conversation._id}
                  onSelect={setSelectedConversation}
                  onMenuClick={handleMenuClick}
                  showMenu={openMenuId === conversation._id}
                  onMenuAction={handleMenuAction}
                />

                {/* Menu da conversa */}
                <ConversationMenu
                  conversation={conversation}
                  isOpen={openMenuId === conversation._id}
                  onAction={handleMenuAction}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer com estatísticas */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          {filteredConversations.length} de {conversations.length} conversas
        </div>
      </div>
    </div>
  );
};
