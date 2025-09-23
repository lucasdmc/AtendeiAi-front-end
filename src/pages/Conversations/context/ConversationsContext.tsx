import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConversations } from '../../../hooks/useConversations';
import { useMessages } from '../../../hooks/useMessages';
import { useTemplates } from '../../../hooks/useTemplates';
import { useRealtime } from '../../../hooks/useRealtime';
import { 
  ConversationsContextType, 
  Conversation, 
  ConversationsState,
  ModalState
} from '../types';
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
    showContactInfo: false,
    sidebarMinimized: localStorage.getItem('sidebarMinimized') === 'true',
    searchInConversation: false,
    conversationSearchTerm: ''
  });

  // Estados dos modais
  const [modalState, setModalState] = useState<ModalState>({
    filesModalOpen: false,
    flagsModalOpen: false,
    templatesModalOpen: false,
    scheduleModalOpen: false,
    filterModalOpen: false
  });

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

  const { 
    data: templatesData 
  } = useTemplates({ clinic_id: clinicId });

  // Realtime com callback para atualização direta das mensagens
  const { isConnected } = useRealtime(clinicId, {
    onMessageReceived: (message, conversation) => {
      console.log('🎯 Callback SSE: Nova mensagem recebida diretamente', {
        message: {
          _id: message._id,
          content: message.content?.substring(0, 50),
          message_type: message.message_type,
          media_url: message.media_url,
          whatsapp_message: message.whatsapp_message
        },
        conversation: {
          _id: conversation._id,
          customer_name: conversation.customer_name
        },
        selectedConversation: conversationsState.selectedConversation?._id
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
        console.log('🎯 Mensagem é para a conversa selecionada - atualizando estado diretamente');

        // Invalidar especificamente a query de mensagens desta conversa
        queryClient.invalidateQueries({
          queryKey: ['messages', 'list', conversation._id, { limit: 50 }],
          refetchType: 'active' // Apenas refetch se a query estiver ativa
        });

        // Também tentar atualizar o cache diretamente se possível
        const messagesQueryKey = ['messages', 'list', conversation._id, { limit: 50 }];
        const currentMessages = queryClient.getQueryData(messagesQueryKey);

        if (currentMessages) {
          console.log('🎯 Tentando atualizar cache diretamente');
          // Forçar refetch imediato
          queryClient.refetchQueries({
            queryKey: messagesQueryKey,
            type: 'active'
          });
        }
      }
    }
  });

  // Extrair arrays dos dados da API
  const conversations = conversationsData?.conversations || [];
  const messages = Array.isArray(messagesData) ? messagesData : (messagesData as any)?.pages?.flatMap((page: any) => page?.messages || []) || [];
  const templates = (templatesData as any)?.templates || [];

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

  const setShowContactInfo = (show: boolean) => {
    setConversationsState(prev => ({ ...prev, showContactInfo: show }));
  };

  const setSidebarMinimized = (minimized: boolean) => {
    localStorage.setItem('sidebarMinimized', minimized.toString());
    setConversationsState(prev => ({ ...prev, sidebarMinimized: minimized }));
  };

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
    messages,
    templates,
    flags: mockFlags,
    
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
    setShowContactInfo,
    setSidebarMinimized,
    setSearchInConversation,
    setConversationSearchTerm,
    
    // Modal actions (expostas através do contexto para facilitar acesso)
    setFilesModalOpen,
    setFlagsModalOpen,
    setTemplatesModalOpen,
    setScheduleModalOpen,
    setFilterModalOpen,
    
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