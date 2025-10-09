import React, { useState, useEffect, useRef } from 'react';
import { useInstitution } from '../../../../contexts/InstitutionContext';
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
import { useConversationActions } from '../../hooks/useConversationActions';
import { Conversation } from '../../../../services/api';

export const ConversationsList: React.FC = () => {
  const { selectedInstitution } = useInstitution();
  const {
    conversations,
    selectedConversation,
    searchTerm,
    activeTab,
    conversationsLoading,
    tabCounters, // Adicionar tabCounters do contexto
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

  // Hook para ações de conversa
  const conversationActions = useConversationActions(selectedInstitution?._id || '');

  // Handler para ações de conversa
  const handleConversationAction = (action: string, conversation: Conversation) => {
    console.log('🔍 [ConversationsList] Ação executada:', { action, conversationId: conversation._id });
    
    switch (action) {
      case 'assumir':
        conversationActions.assumeConversation(conversation._id);
        break;
      case 'iniciar':
        conversationActions.startHandling(conversation._id);
        break;
      case 'finalizar':
        conversationActions.closeConversation(conversation._id, 'Finalizada pelo atendente');
        break;
      default:
        console.log('Ação não implementada:', action);
    }
  };

  // Nova estrutura de abas conforme especificação
  // Função para determinar a aba da conversa baseado na nova lógica
  const getConversationTab = (conversation: Conversation): TabKey => {
    console.log('🔍 [getConversationTab] Analisando conversa:', {
      _id: conversation._id,
      customer_name: conversation.customer_name,
      status: conversation.status,
      assigned_user_id: conversation.assigned_user_id,
      state: (conversation as any).state
    });

    const state = (conversation as any).state;

    // Finalizadas: conversas encerradas OU com state RESOLVED/CLOSED/DROPPED
    if (conversation.status === 'closed' || conversation.status === 'archived' || 
        state === 'RESOLVED' || state === 'CLOSED' || state === 'DROPPED') {
      console.log('🔍 [getConversationTab] Classificada como FINALIZADAS:', conversation.customer_name);
      return 'finalizadas';
    }

    // Para conversas ativas, usar a lógica baseada no estado
    if (conversation.status === 'active') {
      
      // Bot/IA: conversas com state = 'BOT_ACTIVE'
      if (state === 'BOT_ACTIVE') {
        console.log('🔍 [getConversationTab] Classificada como BOT (state):', conversation.customer_name);
        return 'bot';
      }

      // Entrada: conversas com state = 'ROUTING' e sem usuário atribuído
      if (state === 'ROUTING' && !conversation.assigned_user_id) {
        console.log('🔍 [getConversationTab] Classificada como ENTRADA (state):', conversation.customer_name);
        return 'entrada';
      }

      // Aguardando: conversas com state = 'ASSIGNED'
      if (state === 'ASSIGNED') {
        console.log('🔍 [getConversationTab] Classificada como AGUARDANDO (state):', conversation.customer_name);
        return 'aguardando';
      }

      // Em atendimento: conversas com state = 'IN_PROGRESS' ou 'WAITING_CUSTOMER'
      if (state === 'IN_PROGRESS' || state === 'WAITING_CUSTOMER') {
        console.log('🔍 [getConversationTab] Classificada como EM_ATENDIMENTO (state):', conversation.customer_name);
        return 'em_atendimento';
      }

      // Fallback para conversas ativas com state = 'NEW': entrada
      if (state === 'NEW' && !conversation.assigned_user_id) {
        console.log('🔍 [getConversationTab] Classificada como ENTRADA (NEW fallback):', conversation.customer_name);
        return 'entrada';
      }
    }

    // Default para entrada
    console.log('🔍 [getConversationTab] Classificada como ENTRADA (default):', conversation.customer_name);
    return 'entrada';
  };

  // Filtrar conversas baseado na aba ativa
  const filteredConversations = React.useMemo(() => {
    console.log('🔍 [ConversationsList] Filtrando conversas:', {
      totalConversations: conversations.length,
      activeTab,
      firstConversation: conversations[0] ? {
        _id: conversations[0]._id,
        customer_name: conversations[0].customer_name,
        status: conversations[0].status
      } : null
    });
    
    let filtered = conversations;

    // Filtrar por aba ativa
    filtered = filtered.filter(conversation => {
      const conversationTab = getConversationTab(conversation);
      return conversationTab === activeTab;
    });

    console.log('🔍 [ConversationsList] Conversas filtradas por aba:', {
      filteredCount: filtered.length,
      activeTab,
      firstFiltered: filtered[0] ? {
        _id: filtered[0]._id,
        customer_name: filtered[0].customer_name,
        status: filtered[0].status,
        tab: getConversationTab(filtered[0])
      } : null
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

  // Calcular contadores das novas abas usando dados do backend
  const tabCounts = {
    bot: tabCounters?.bot || 0,
    entrada: tabCounters?.entrada || 0,
    aguardando: tabCounters?.aguardando || 0,
    em_atendimento: tabCounters?.em_atendimento || 0,
    finalizadas: tabCounters?.finalizadas || 0
  };

  console.log('🔍 [ConversationsList] Contadores das abas:', {
    tabCounters,
    tabCounts,
    activeTab,
    detailedCounters: {
      bot: tabCounters?.bot,
      entrada: tabCounters?.entrada,
      aguardando: tabCounters?.aguardando,
      em_atendimento: tabCounters?.em_atendimento,
      finalizadas: tabCounters?.finalizadas
    }
  });

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
                    onClick={() => {
                      console.log('🔍 [ConversationsList] Conversa clicada:', {
                        _id: conversation._id,
                        customer_name: conversation.customer_name,
                        status: conversation.status
                      });
                      setSelectedConversation(conversation);
                    }}
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
                      // Usar nosso novo handler para ações de conversa
                      handleConversationAction(action, conversation);
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
