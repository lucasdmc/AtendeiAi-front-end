import React from 'react';
import { ConversationsProvider } from './Conversations/context';
import { ConversationsList } from './Conversations/components/ConversationsList';
import { ChatArea } from './Conversations/components/ChatArea';
import { FilterColumn } from './Conversations/components/FilterDrawer';
import { ContactDrawer } from './Conversations/components/ContactDrawer';
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
    filterColumnOpen,
    contactDrawerOpen,
    contactDrawerTab,
    setFilterColumnOpen,
    setContactDrawerOpen
  } = useConversationsContext();

  return (
    <div className="h-full flex bg-gray-50">
      {/* Coluna de Filtros */}
      <FilterColumn 
        isOpen={filterColumnOpen}
        onClose={() => setFilterColumnOpen(false)}
      />

      {/* Lista de Conversas */}
      <ConversationsList />

      {/* Área Principal do Chat */}
      <ChatArea />

      {/* Contact Drawer */}
      <ContactDrawer
        isOpen={contactDrawerOpen}
        onClose={() => setContactDrawerOpen(false)}
        conversation={selectedConversation}
        initialTab={contactDrawerTab}
      />

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
