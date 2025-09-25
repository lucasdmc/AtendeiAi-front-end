import React from 'react';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Search, Users, MessageCircle, Flag } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { ConversationMenu } from './ConversationMenu';
import { ConversationsLoading, EmptyState } from '../ui';
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
    setActiveFilter,
    setFilterModalOpen
  } = useConversationsContext();

  // Hook para gerenciar menu das conversas
  const { openMenuId, handleMenuClick, handleMenuAction } = useConversationMenu();

  // Hook para filtros
  const {
    filteredConversations,
    handleFilterClick
  } = useConversationFilters(conversations, searchTerm, activeFilter, clinicSettings?.conversations);


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

        <div className="space-y-2 mt-3">
          {/* Primeira linha - Filtros principais */}
          <div className="flex space-x-2">
            {['Tudo', 'Manual'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  handleFilterClick(filter);
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                  ${activeFilter === filter 
                    ? 'bg-pink-100 text-pink-800 border border-pink-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }
                `}
              >
                {filter === 'Manual' && <Users className="h-3 w-3" />}
                <span>{filter}</span>
              </button>
            ))}
          </div>
          
          {/* ✅ Segunda linha - Filtros de tipo de conversa */}
          <div className="flex space-x-2">
            {['Grupos', 'Individuais'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  handleFilterClick(filter);
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                  ${activeFilter === filter 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }
                `}
              >
                {filter === 'Grupos' && <Users className="h-3 w-3" />}
                {filter === 'Individuais' && <MessageCircle className="h-3 w-3" />}
                <span>{filter}</span>
              </button>
            ))}
          </div>
          
          {/* Terceira linha - Filtros especiais */}
          <div className="flex space-x-2">
            {/* Filtro Não lidas */}
            <button
              onClick={() => {
                setActiveFilter('Não lidas');
                handleFilterClick('Não lidas');
              }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                ${activeFilter === 'Não lidas' 
                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              <MessageCircle className="h-3 w-3" />
              <span>Não lidas</span>
              {/* Contador de conversas não lidas */}
              {conversations.filter(c => (c.unread_count || 0) > 0).length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-orange-200 text-orange-800 text-xs">
                  {conversations.filter(c => (c.unread_count || 0) > 0).length}
                </Badge>
              )}
            </button>
            
            {/* Botão especial para Flags Personalizadas */}
            <button
              onClick={() => setFilterModalOpen(true)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                ${activeFilter === 'Flags Personalizadas' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              <Flag className="h-3 w-3" />
              <span>Flags</span>
            </button>
          </div>
        </div>
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
