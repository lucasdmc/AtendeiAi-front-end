import React from 'react';
import { ConversationsProvider } from './Conversations/context';
import { ConversationsList } from './Conversations/components/ConversationsList';
import { ChatArea } from './Conversations/components/ChatArea';
import { PatientInfo } from './Conversations/components/Sidebar';
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
    setShowContactInfo
  } = useConversationsContext();

  return (
    <div className="h-full flex bg-gray-50">
      {/* Lista de Conversas */}
      <ConversationsList />

      {/* Área Principal do Chat */}
      <ChatArea />

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
