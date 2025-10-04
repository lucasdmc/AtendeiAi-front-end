import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Button } from '../../../../components/ui/button';
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
import { TabsSegmented } from './TabsSegmented';
import type { TabKey } from './TabsSegmented';
import { ConversationsLoading, EmptyState } from '../ui';
import { useConversationsContext } from '../../context';
import { useConversationMenu } from '../../hooks';
import { Conversation } from '../../../../services/api';

export const ConversationsList: React.FC = () => {
  const {
    conversations,
    selectedConversation,
    searchTerm,
    activeTab,
    conversationsLoading,
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

  // Nova estrutura de abas conforme especificação
  // Função para determinar a aba da conversa baseado na nova lógica
  const getConversationTab = (conversation: Conversation): TabKey => {
    // Bot/IA: conversas em atendimento automatizado (mock para demonstração)
    if (conversation.assigned_user_id === null && conversation.status === 'active') {
      return 'bot';
    }

    // Finalizadas: conversas encerradas
    if (conversation.status === 'closed' || conversation.status === 'archived') {
      return 'finalizadas';
    }

    // Em atendimento: conversas ativamente sendo atendidas
    if (conversation.assigned_user_id && conversation.status === 'active') {
      return 'em_atendimento';
    }

    // Aguardando atendimento: atribuídas ao atendente mas não iniciadas (mock)
    if (conversation.assigned_user_id && conversation.status === 'active') {
      // Para demonstração, vamos considerar algumas como aguardando
      const conversationIndex = conversations.indexOf(conversation);
      if (conversationIndex % 3 === 1) {
        return 'aguardando';
      }
    }

    // Entrada: roteadas mas não atribuídas
    if (!conversation.assigned_user_id && conversation.status === 'active') {
      return 'entrada';
    }

    // Default para entrada
    return 'entrada';
  };

  // Filtrar conversas baseado na aba ativa
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    // Filtrar por aba ativa
    filtered = filtered.filter(conversation => {
      const conversationTab = getConversationTab(conversation);
      return conversationTab === activeTab;
    });

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conversation => {
        const displayName = conversation.conversation_type === 'group' 
          ? (conversation.group_name || `Grupo ${conversation.group_id?.split('@')[0] || 'Desconhecido'}`)
          : (conversation.customer_name && conversation.customer_name.trim() !== '' 
            ? conversation.customer_name 
            : conversation.customer_phone);
        
        return displayName.toLowerCase().includes(term) ||
               conversation.customer_phone?.includes(term) ||
               conversation.last_message?.content?.toLowerCase().includes(term);
      });
    }

    return filtered;
  }, [conversations, activeTab, searchTerm]);

  // Calcular contadores das novas abas
  const getTabCount = (tab: TabKey): number => {
    return conversations.filter(c => getConversationTab(c) === tab).length;
  };

  // Contadores para cada aba
  const tabCounts = {
    bot: getTabCount('bot'),
    entrada: getTabCount('entrada'),
    aguardando: getTabCount('aguardando'),
    em_atendimento: getTabCount('em_atendimento'),
    finalizadas: getTabCount('finalizadas')
  };

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
    <div className="w-[550px] min-w-[550px] max-w-[550px] border-r border-gray-200 flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {/* Lado esquerdo - Título */}
          <h1 className="text-xl font-semibold" style={{ color: '#2E2E2E' }}>Conversas</h1>
          
          {/* Lado direito - Controles */}
          <div className="flex items-center gap-2">
            {/* Ícone de seleção múltipla */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${multiSelectMode ? 'text-blue-500' : 'hover:text-blue-500'}`}
              style={{ color: multiSelectMode ? '#2D61E0' : '#6F6F6F' }}
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
              className="h-10 w-10 rounded-full shadow-sm"
              style={{ backgroundColor: '#2D61E0' }}
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
              className="h-10 w-10 rounded-none"
              style={{ color: '#6F6F6F' }}
              onClick={() => setFilterColumnOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {/* Separador */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Ícone de busca */}
            <div className="pl-3 pr-2">
              <Search className="h-4 w-4" style={{ color: '#6F6F6F' }} />
            </div>
            
            {/* Input de busca */}
            <Input
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
              placeholder="Buscar por nome ou telefone"
              style={{ color: '#2E2E2E' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Nova estrutura de abas conforme especificação */}
        <TabsSegmented
          active={activeTab}
          counts={tabCounts}
          onChange={setActiveTab}
          compactCount={true}
        />

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
            {filteredConversations.map((conversation, index) => {
              // Mapear dados da API para a nova interface do ConversationItem
              const displayName = conversation.conversation_type === 'group' 
                ? (conversation.group_name || `Grupo ${conversation.group_id?.split('@')[0] || 'Desconhecido'}`)
                : (conversation.customer_name && conversation.customer_name.trim() !== '' 
                  ? conversation.customer_name 
                  : conversation.customer_phone);

              const lastMessageTime = conversation.last_message?.timestamp || conversation.updated_at;
              
              // Mock data para demonstração - em produção viria da API
              const mockTags = conversation.flags?.map(flag => ({
                label: flag.name,
                tone: 'blue' as const
              })) || [];

              // Mock tags de conversa específicas - em produção viria da API
              const mockConversationTags = [
                { id: '1', name: 'Vendido', color: '#10B981', type: 'conversation' as const },
                { id: '3', name: 'Pendente', color: '#F59E0B', type: 'conversation' as const }
              ];

              // Simular algumas conversas com mensagens de diferentes atendentes
              const conversationIndex = index % 3;
              let mockConversationTagsForItem = mockConversationTags;
              
              if (conversationIndex === 0) {
                // Primeira conversa: sem tags
                mockConversationTagsForItem = [];
              } else if (conversationIndex === 1) {
                // Segunda conversa: apenas uma tag
                mockConversationTagsForItem = [mockConversationTags[0]];
              }
              // Terceira conversa: duas tags (padrão)

              const mockSector = 'Geral'; // Em produção viria da API
              const mockAgentAvatar = undefined; // Em produção viria da API
              const isPrivate = false; // Em produção viria da API
              const hasScheduled = false; // Em produção viria da API

              return (
                <div key={conversation._id || `conv-${index}`} className="relative">
                  <ConversationItem
                    id={conversation._id}
                    contactName={displayName}
                    contactAvatarUrl={conversation.customer_profile_pic}
                    lastMessageSnippet={conversation.last_message?.content}
                    lastActiveAt={lastMessageTime}
                    sectorLabel={mockSector}
                    contactTags={mockTags}
                    conversationTags={mockConversationTagsForItem}
                    isSelected={selectedConversation?._id === conversation._id}
                    isUnread={(conversation.unread_count || 0) > 0}
                    isPrivate={isPrivate}
                    hasScheduledMessage={hasScheduled}
                    agentAvatarUrl={mockAgentAvatar}
                    source="whatsapp"
                    activeTab={activeTab}
                    onClick={() => setSelectedConversation(conversation)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleMenuClick(conversation._id);
                    }}
                    onTagsChange={(tags) => {
                      console.log('Tags changed for conversation:', conversation._id, tags);
                      // Em produção, aqui faria a chamada para API para salvar as tags
                    }}
                    onAction={(action, conversationId) => {
                      console.log('Action triggered:', action, 'for conversation:', conversationId);
                      // Em produção, aqui faria a chamada para API para executar a ação
                      handleMenuAction(action, conversation);
                    }}
                  />

                  {/* Menu da conversa - manter o existente por compatibilidade */}
                  <ConversationMenu
                    conversation={conversation}
                    isOpen={openMenuId === conversation._id}
                    onAction={handleMenuAction}
                  />
                </div>
              );
            })}
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
