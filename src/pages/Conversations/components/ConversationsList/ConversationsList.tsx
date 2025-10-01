import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  CheckSquare, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  Plus,
  Filter
} from 'lucide-react';
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
    activeTab,
    conversationsLoading,
    clinicSettings,
    setSelectedConversation,
    setSearchTerm,
    setActiveTab,
    setFilterColumnOpen
  } = useConversationsContext();

  // Estados para o header
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'created_at' | 'last_message' | 'waiting'>('last_message');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect para fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hook para gerenciar menu das conversas
  const { openMenuId, handleMenuClick, handleMenuAction } = useConversationMenu();

  // Hook para filtros simples (com activeTab)
  const {
    filteredConversations
  } = useConversationFilters(conversations, searchTerm, 'Tudo', activeTab, clinicSettings?.conversations);

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
        return conversations.filter(c => getConversationStatus(c) === 'inbox').length;
      case 'waiting':
        return conversations.filter(c => getConversationStatus(c) === 'waiting').length;
      case 'finished':
        return conversations.filter(c => getConversationStatus(c) === 'finished').length;
      default:
        return 0;
    }
  };

  const inboxCount = getTabCount('inbox');

  // Funções do header
  const toggleMultiSelect = () => {
    setMultiSelectMode(!multiSelectMode);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy: 'created_at' | 'last_message' | 'waiting') => {
    setSortBy(newSortBy);
    setSortDropdownOpen(false);
  };


  return (
    <div className="w-[420px] min-w-[420px] max-w-[420px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {/* Lado esquerdo - Título */}
          <h1 className="text-xl font-semibold text-gray-900">Conversas</h1>
          
          {/* Lado direito - Controles */}
          <div className="flex items-center gap-2">
            {/* Ícone de seleção múltipla */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${multiSelectMode ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              onClick={toggleMultiSelect}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            
            {/* Botão de ordenação com dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1 shadow-sm">
                {/* Ícone de ordenação */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-gray-500 hover:text-blue-500"
                  onClick={toggleSortOrder}
                >
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Separador */}
                <div className="border-l border-gray-300 h-4"></div>
                
                {/* Dropdown trigger */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-gray-500 hover:text-blue-500"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Dropdown menu */}
              {sortDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[200px] z-10">
                  <div className="text-sm font-medium text-gray-700 mb-2 px-2">Ordenar por:</div>
                  <div className="space-y-1">
                    {[
                      { key: 'created_at', label: 'Data de criação' },
                      { key: 'last_message', label: 'Última mensagem' },
                      { key: 'waiting', label: 'Esperando resposta' }
                    ].map((option) => (
                      <button
                        key={option.key}
                        className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-50 ${
                          sortBy === option.key 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                        onClick={() => handleSortChange(option.key as any)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Botão de adicionar nova conversa */}
            <Button 
              size="icon" 
              className="h-10 w-10 bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm"
            >
              <Plus className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Campo de busca com filtro */}
        <div className="relative mb-4">
          <div className="flex items-center border border-gray-300 rounded-md bg-white">
            {/* Ícone de filtro */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-400 hover:text-gray-600 rounded-none"
              onClick={() => setFilterColumnOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {/* Separador */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Ícone de busca */}
            <div className="pl-3 pr-2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            
            {/* Input de busca */}
            <Input
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
              placeholder="Buscar por nome ou telefone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Abas de Status das Conversas */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={activeTab === 'inbox' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-full px-4 ${
              activeTab === 'inbox' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('inbox')}
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
            onClick={() => setActiveTab('waiting')}
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
            onClick={() => setActiveTab('finished')}
          >
            Finalizados
            {activeTab === 'finished' && (
              <Badge className="ml-2 bg-white text-blue-500 hover:bg-white px-2 py-0.5 text-xs">
                {getTabCount('finished')}
              </Badge>
            )}
          </Button>
        </div>

        {/* Componente de Filtros - REMOVIDO - Agora usamos FilterColumn */}
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
