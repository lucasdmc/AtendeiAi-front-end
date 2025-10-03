import React from 'react';
import { ConversationsProvider } from './Conversations/context';
import { ConversationsList } from './Conversations/components/ConversationsList';
import { ChatArea } from './Conversations/components/ChatArea';
import { FilterColumn } from './Conversations/components/FilterDrawer';
import { ContactDrawer } from './Conversations/components/ContactDrawer';
import { TransferDrawer } from './Conversations/components/TransferDrawer';
import { ScheduleMessageDrawer } from './Conversations/components/ScheduleMessageDrawer';
import { FinishConversationDrawer } from './Conversations/components/FinishConversationDrawer';
import { QuickRepliesDrawer } from './Conversations/components/QuickRepliesDrawer';
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
    quickRepliesDrawerOpen,
    setFilterColumnOpen,
    setContactDrawerOpen,
    setQuickRepliesDrawerOpen,
    setSelectedTemplate,
    isAnyDrawerOpen
  } = useConversationsContext();

  return (
    <div className="h-full flex relative" style={{ backgroundColor: '#F5F7FB' }}>
      {/* Overlay escuro quando drawers estão abertos */}
      {isAnyDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          style={{ left: filterColumnOpen ? '320px' : '0' }}
        />
      )}

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

      {/* Transfer Drawer */}
      <TransferDrawer />

      {/* Schedule Message Drawer */}
      <ScheduleMessageDrawer />

      {/* Finish Conversation Drawer */}
      <FinishConversationDrawer />

      {/* Quick Replies Drawer */}
      <QuickRepliesDrawer
        isOpen={quickRepliesDrawerOpen}
        onClose={() => setQuickRepliesDrawerOpen(false)}
        onSelect={(template) => {
          console.log('Template selecionado:', template);
          setSelectedTemplate(template);
          setQuickRepliesDrawerOpen(false);
        }}
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
