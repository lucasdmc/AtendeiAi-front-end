import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConversations } from '../../../hooks/useConversations';
import { useMessages, useMarkMessagesAsRead } from '../../../hooks/useMessages';
import { useTemplates } from '../../../hooks/useTemplates';
import { useRealtime } from '../../../hooks/useRealtime';
import { useClinicSettings } from '../../../hooks/useClinicSettings';
import { useMarkAsRead, getSessionIdFromConversation, getUnreadMessageIds } from '../../../hooks/useReceipts';
import { 
  ConversationsContextType, 
  ConversationsState,
  ModalState,
  Template
} from '../types';
import { Conversation } from '../../../services/api';
import { mockPatientInfo, mockFlags, templateCategories, menuItems } from '../constants';

// Criar contexto com valor padrão para evitar problemas de HMR
const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

// Adicionar display name para debugging
ConversationsContext.displayName = 'ConversationsContext';

interface ConversationsProviderProps {
  children: ReactNode;
}

export const ConversationsProvider: React.FC<ConversationsProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();

  // Estados principais da página
  const [conversationsState, setConversationsState] = useState<ConversationsState>({
    selectedConversation: null,
    searchTerm: '',
    activeFilter: 'Tudo',
    activeTab: 'inbox', // Nova propriedade para controlar as abas (inbox, waiting, finished)
    showContactInfo: false,
    searchInConversation: false,
    conversationSearchTerm: ''
  });

  // Estado para controlar a coluna de filtros
  const [filterColumnOpen, setFilterColumnOpen] = useState(false);

  // Estado para controlar o drawer de contato
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [contactDrawerTab, setContactDrawerTab] = useState<'contact' | 'conversation'>('contact');
  const [transferDrawerOpen, setTransferDrawerOpen] = useState(false);
  const [scheduleMessageDrawerOpen, setScheduleMessageDrawerOpen] = useState(false);
  const [finishConversationDrawerOpen, setFinishConversationDrawerOpen] = useState(false);
  const [quickRepliesDrawerOpen, setQuickRepliesDrawerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Função para verificar se algum drawer está aberto
  const isAnyDrawerOpen = contactDrawerOpen || transferDrawerOpen || scheduleMessageDrawerOpen || finishConversationDrawerOpen || quickRepliesDrawerOpen;

  // Estados dos modais
  const [modalState, setModalState] = useState<ModalState>({
    filesModalOpen: false,
    flagsModalOpen: false,
    templatesModalOpen: false,
    scheduleModalOpen: false,
    filterModalOpen: false
  });

  // Callback para agendamento
  // Estado para dados de agendamento
  const [scheduleData, setScheduleData] = useState<any>(null);

  // Função para definir agendamento
  const setScheduleDataWithLogs = (data: any) => {
    console.log('📅 [CONTEXT] Definindo dados de agendamento:', data);
    setScheduleData(data);
  };

  // Hooks da API
  const clinicId = '68cd84230e29f31cf5f5f1b8';
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useConversations({ clinic_id: clinicId });

  const { 
    data: messagesData = [], 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useMessages(conversationsState.selectedConversation?._id || '', { limit: 50 });

  // Extrair mensagens do useInfiniteQuery
  const messages = React.useMemo(() => {
    const extracted = Array.isArray(messagesData) ? messagesData : (messagesData as any)?.pages?.flatMap((page: any) => page?.messages || []) || [];
    return extracted;
  }, [messagesData]);

  // Log detalhado do useMessages
  React.useEffect(() => {
    if (conversationsState.selectedConversation) {
      console.log('📨 [CONTEXT] Conversa selecionada:', {
        id: conversationsState.selectedConversation._id,
        name: conversationsState.selectedConversation.customer_name || conversationsState.selectedConversation.customer_phone,
        messagesCount: messages.length
      });
    } else {
      console.log('📨 [CONTEXT] Nenhuma conversa selecionada');
    }
  }, [conversationsState.selectedConversation, messages.length]);

  // Processar mensagens para adicionar mock data de atendentes
  const processedMessages = React.useMemo(() => {
    if (!messages || !Array.isArray(messages)) {
      return [];
    }
    
    // Simular diferentes atendentes apenas para mensagens que não têm sender_id
    const processed = messages.map((message: any, index: number) => {
      // Se for mensagem enviada (human) E não tiver sender_id, adicionar sender_id mock
      if (message.sender_type === 'human' && !message.sender_id) {
        const agentIds = ['marcos-id', 'paulo-id', 'agent-1', 'agent-2'];
        // Distribuir mensagens entre diferentes atendentes (excluindo current-user-id)
        const agentIndex = index % agentIds.length;
        return {
          ...message,
          sender_id: agentIds[agentIndex]
        };
      }
      return message;
    });
    
    return processed;
  }, [messages]);

  const { 
    data: templatesData 
  } = useTemplates({ clinic_id: clinicId });

  // Hook para configurações da clínica
  const { 
    data: clinicSettings 
  } = useClinicSettings(clinicId);

  // Hook para marcar mensagens como lidas (antigo)
  const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();

  // Hook para receipts do WhatsApp
  const { mutate: markAsRead } = useMarkAsRead();

  // Ref para evitar chamadas duplicadas
  const lastProcessedConversationRef = useRef<string | null>(null);

  // Realtime com callback para atualização direta das mensagens
  const { isConnected } = useRealtime(clinicId, {
    onMessageReceived: (message, conversation) => {
      console.log('🎯 [CONTEXT] Callback SSE: Nova mensagem recebida diretamente', {
        message: {
          _id: message._id,
          content: message.content?.substring(0, 50),
          message_type: message.message_type,
          media_url: message.media_url,
          sender_type: message.sender_type,
          whatsapp_message: message.whatsapp_message
        },
        conversation: {
          _id: conversation._id,
          customer_name: conversation.customer_name,
          customer_phone: conversation.customer_phone,
          conversation_type: conversation.conversation_type
        },
        selectedConversation: conversationsState.selectedConversation?._id,
        clinicSettings: clinicSettings?.conversations
      });

      // Log específico para mensagens de texto
      if (message.message_type === 'text') {
        console.log('💬 SSE: Callback processando mensagem de TEXTO:', {
          content: message.content,
          conversationId: conversation._id,
          selectedConversationId: conversationsState.selectedConversation?._id,
          isSameConversation: conversationsState.selectedConversation?._id === conversation._id
        });
      }

      // Se a mensagem é para a conversa atualmente selecionada, atualizar diretamente
      if (conversationsState.selectedConversation?._id === conversation._id) {
        console.log('🎯 [CONTEXT] Mensagem é para a conversa selecionada - atualizando estado diretamente');

        // Invalidar especificamente a query de mensagens desta conversa
        const messagesQueryKey = ['messages', 'list', conversation._id, { limit: 50 }];
        console.log('🎯 [CONTEXT] Invalidando query de mensagens:', messagesQueryKey);
        
        queryClient.invalidateQueries({
          queryKey: messagesQueryKey,
          refetchType: 'active' // Apenas refetch se a query estiver ativa
        });

        // Também tentar atualizar o cache diretamente se possível
        const currentMessages = queryClient.getQueryData(messagesQueryKey);
        console.log('🎯 [CONTEXT] Cache atual de mensagens:', currentMessages ? 'EXISTE' : 'NÃO EXISTE');

        if (currentMessages) {
          console.log('🎯 [CONTEXT] Forçando refetch imediato...');
          // Forçar refetch imediato
          queryClient.refetchQueries({
            queryKey: messagesQueryKey,
            type: 'active'
          });
        }
      }

      // SEMPRE invalidar cache de conversas para atualizar last_message
      console.log('🎯 [CONTEXT] Invalidando cache de conversas...');
      queryClient.invalidateQueries({
        queryKey: ['conversations', 'list'],
        refetchType: 'active'
      });
    }
  });

  // Extrair arrays dos dados da API
  const conversations = conversationsData?.conversations || [];
  const templates = (templatesData as any)?.templates || [];

  // ✅ Marcar mensagens como lidas quando uma conversa é selecionada
  React.useEffect(() => {
    if (conversationsState.selectedConversation && (conversationsState.selectedConversation.unread_count || 0) > 0) {
      const conversationKey = `${conversationsState.selectedConversation._id}-${conversationsState.selectedConversation.unread_count}`;
      
      // Evitar chamadas duplicadas
      if (lastProcessedConversationRef.current === conversationKey) {
        console.log('📖 [CONTEXT] Conversa já processada, ignorando:', conversationKey);
        return;
      }
      
      lastProcessedConversationRef.current = conversationKey;
      
      console.log('📖 [CONTEXT] Marcando conversa como lida:', {
        conversationId: conversationsState.selectedConversation._id,
        unreadCount: conversationsState.selectedConversation.unread_count,
        customerName: conversationsState.selectedConversation.customer_name || conversationsState.selectedConversation.group_name
      });
      
      // Marcar como lida no backend (antigo sistema)
      markMessagesAsRead(conversationsState.selectedConversation._id);

      // Enviar read receipts para WhatsApp (novo sistema)
      if (messages.length > 0) {
        const unreadMessageIds = getUnreadMessageIds(messages);
        if (unreadMessageIds.length > 0) {
          const sessionId = getSessionIdFromConversation(conversationsState.selectedConversation);
          
          console.log('📨 [CONTEXT] Enviando read receipts:', {
            conversationId: conversationsState.selectedConversation._id,
            messageCount: unreadMessageIds.length,
            sessionId
          });

          markAsRead({
            messageIds: unreadMessageIds,
            conversationId: conversationsState.selectedConversation._id,
            sessionId
          });
        }
      }
    }
  }, [conversationsState.selectedConversation?._id, conversationsState.selectedConversation?.unread_count]);

  // Configurações da clínica são gerenciadas pelo Layout principal

  // Actions para ConversationsState
  const setSelectedConversation = (conversation: Conversation | null) => {
    setConversationsState(prev => ({ ...prev, selectedConversation: conversation }));
  };

  const setSearchTerm = (term: string) => {
    setConversationsState(prev => ({ ...prev, searchTerm: term }));
  };

  const setActiveFilter = (filter: string) => {
    setConversationsState(prev => ({ ...prev, activeFilter: filter }));
  };

  const setActiveTab = (tab: string) => {
    setConversationsState(prev => ({ ...prev, activeTab: tab }));
  };

  const setShowContactInfo = (show: boolean) => {
    setConversationsState(prev => ({ ...prev, showContactInfo: show }));
  };

  // setSidebarMinimized removido - agora gerenciado pelo Layout principal

  const setSearchInConversation = (search: boolean) => {
    setConversationsState(prev => ({ ...prev, searchInConversation: search }));
  };

  const setConversationSearchTerm = (term: string) => {
    setConversationsState(prev => ({ ...prev, conversationSearchTerm: term }));
  };

  // Actions para ModalState
  const setFilesModalOpen = (open: boolean) => {
    setModalState(prev => ({ ...prev, filesModalOpen: open }));
  };

  const setFlagsModalOpen = (open: boolean) => {
    setModalState(prev => ({ ...prev, flagsModalOpen: open }));
  };

  const setTemplatesModalOpen = (open: boolean) => {
    setModalState(prev => ({ ...prev, templatesModalOpen: open }));
  };

  const setScheduleModalOpen = (open: boolean) => {
    console.log('📅 [CONTEXT] Abrindo modal de agendamento.');
    setModalState(prev => ({ ...prev, scheduleModalOpen: open }));
  };

  const setFilterModalOpen = (open: boolean) => {
    setModalState(prev => ({ ...prev, filterModalOpen: open }));
  };

  // Valor do contexto
  const contextValue: ConversationsContextType = {
    // Estados da página
    ...conversationsState,
    
    // Dados da API
    conversations,
    messages: processedMessages,
    templates,
    flags: mockFlags,
    clinicSettings,
    
    // Estados de loading
    conversationsLoading,
    messagesLoading,
    
    // Estados de erro
    conversationsError,
    messagesError,
    
    // Configurações
    clinicId,
    isConnected,
    
    // Dados mock/estáticos
    patientInfo: mockPatientInfo,
    templateCategories,
    menuItems,
    
    // Actions
    setSelectedConversation,
    setSearchTerm,
    setActiveFilter,
    setActiveTab,
    setShowContactInfo,
    setSearchInConversation,
    setConversationSearchTerm,
    
    // Filter column control
    filterColumnOpen,
    setFilterColumnOpen,
    
    // Contact drawer control
    contactDrawerOpen,
    setContactDrawerOpen,
    contactDrawerTab,
    setContactDrawerTab,
    transferDrawerOpen,
    setTransferDrawerOpen,
    scheduleMessageDrawerOpen,
    setScheduleMessageDrawerOpen,
    finishConversationDrawerOpen,
    setFinishConversationDrawerOpen,
    quickRepliesDrawerOpen,
    setQuickRepliesDrawerOpen,
    selectedTemplate,
    setSelectedTemplate,
    isAnyDrawerOpen,
    
    // Modal actions (expostas através do contexto para facilitar acesso)
    setFilesModalOpen,
    setFlagsModalOpen,
    setTemplatesModalOpen,
    setScheduleModalOpen,
    setFilterModalOpen,
    scheduleData,
    setScheduleData: setScheduleDataWithLogs,
    
    // Estados dos modais
    ...modalState
  };

  return (
    <ConversationsContext.Provider value={contextValue}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversationsContext = (): ConversationsContextType => {
  const context = useContext(ConversationsContext);
  
  if (context === undefined) {
    throw new Error('useConversationsContext must be used within a ConversationsProvider');
  }
  
  return context;
};