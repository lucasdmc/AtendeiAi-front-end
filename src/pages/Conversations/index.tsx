import React from 'react';
import { ConversationsProvider } from './context';
import { ConversationsList } from './components/ConversationsList';
import { ChatArea } from './components/ChatArea';
import { PatientInfo } from './components/Sidebar';
import { NavigationSidebar } from './components/Navigation';
import { 
  FilesModal, 
  FlagsModal, 
  TemplatesModal, 
  ScheduleModal, 
  FiltersModal 
} from './components/Modals';
import { useConversationsContext } from './context';

// Componente interno que usa o contexto
const ConversationsContent: React.FC = () => {
  const {
    selectedConversation,
    showContactInfo,
    sidebarMinimized,
    setSidebarMinimized,
    filesModalOpen,
    flagsModalOpen,
    templatesModalOpen,
    scheduleModalOpen,
    filterModalOpen
  } = useConversationsContext();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar de Navegação */}
      <NavigationSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimized={() => setSidebarMinimized(!sidebarMinimized)}
      />

      {/* Lista de Conversas */}
      <ConversationsList />

      {/* Área Principal do Chat */}
      <ChatArea />

      {/* Sidebar de Informações do Paciente */}
      {selectedConversation && showContactInfo && (
        <PatientInfo
          conversation={selectedConversation}
          onClose={() => {
            const { setShowContactInfo } = useConversationsContext();
            setShowContactInfo(false);
          }}
        />
      )}

      {/* Modais */}
      {filesModalOpen && <FilesModal />}
      {flagsModalOpen && <FlagsModal />}
      {templatesModalOpen && <TemplatesModal />}
      {scheduleModalOpen && <ScheduleModal />}
      {filterModalOpen && <FiltersModal />}
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

