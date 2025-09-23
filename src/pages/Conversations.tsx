import React from 'react';
import { ConversationsProvider } from './Conversations/context';
import { ConversationsList } from './Conversations/components/ConversationsList';
import { ChatArea } from './Conversations/components/ChatArea';
import { PatientInfo } from './Conversations/components/Sidebar';
import { NavigationSidebar } from './Conversations/components/Navigation';
import { 
  FilesModal, 
  FlagsModal, 
  TemplatesModal, 
  ScheduleModal, 
  FiltersModal 
} from './Conversations/components/Modals';
import { useConversationsContext } from './Conversations/context';

// Componente interno que usa o contexto
const ConversationsContent: React.FC = () => {
  const {
    selectedConversation,
    showContactInfo,
    setShowContactInfo,
    sidebarMinimized,
    setSidebarMinimized
  } = useConversationsContext();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar de Navegação */}
      <NavigationSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimized={() => setSidebarMinimized(!sidebarMinimized)}
      />

      {/* Área do WhatsApp - Ocupa o restante da tela */}
      <div className="flex-1 flex bg-white">
        {/* Lista de Conversas */}
        <ConversationsList />

        {/* Área Principal do Chat */}
        <ChatArea />
      </div>

      {/* Sidebar de Informações do Paciente */}
      {selectedConversation && showContactInfo && (
        <PatientInfo
          conversation={selectedConversation}
          onClose={() => setShowContactInfo(false)}
        />
      )}

      {/* Modais - Renderizados pelos próprios componentes baseado no contexto */}
      <FilesModal />
      <FlagsModal />
      <TemplatesModal />
      <ScheduleModal />
      <FiltersModal />
    </div>
  );
};

// Componente principal exportado com Provider
const Conversations: React.FC = () => {
  return (
    <ConversationsProvider>
      <ConversationsContent />
    </ConversationsProvider>
  );
};

export default Conversations;
