// Interface Conversation removida - usando a de services/api.ts

export interface Message {
  _id: string;
  content: string;
  timestamp: string;
  sender_type: 'customer' | 'bot' | 'human' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location';
  conversation_id: string;
  
  // Campos para informações do remetente (grupos)
  sender_id?: string; // ID do remetente (para grupos)
  sender_name?: string; // Nome do remetente (para grupos)
  sender_phone?: string; // Telefone do remetente (para grupos)
  
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  media_mime_type?: string;
  media?: {
    mime_type?: string;
    file_name?: string;
    file_size?: number;
    caption?: string;
  };
}

export interface Flag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface Template {
  _id: string;
  name: string;
  content: string;
  category: string;
  usage_count: number;
  created_at: string;
  clinic_id: string;
}

export interface TemplateCategory {
  value: string;
  label: string;
  color: string;
}

export interface PatientFile {
  id: string;
  type: 'image' | 'document';
  name: string;
  url: string;
  date: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  phone: string;
  insurance: string;
  status: string;
  description: string;
  files: PatientFile[];
}

export interface MenuItem {
  path: string;
  icon: any; // Lucide React icon component
  label: string;
  description: string;
}

export interface MenuPosition {
  top: number;
  right: number;
}

export interface ConversationMenuAction {
  id: string;
  label: string;
  icon: any;
  action: string;
  variant?: 'default' | 'danger';
}

export interface MessageMenuAction {
  id: string;
  label: string;
  icon: any;
  action: string;
  variant?: 'default' | 'danger';
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon?: any;
  count?: number;
}

export interface ConversationsState {
  selectedConversation: import('../../../services/api').Conversation | null;
  searchTerm: string;
  activeFilter: string;
  activeTab: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas'; // Nova estrutura de abas
  showContactInfo: boolean;
  searchInConversation: boolean;
  conversationSearchTerm: string;
}

export interface ConversationsActions {
  setSelectedConversation: (conversation: import('../../../services/api').Conversation | null) => void;
  setSearchTerm: (term: string) => void;
  setActiveFilter: (filter: string) => void;
  setActiveTab: (tab: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas') => void; // Nova estrutura de abas
  setShowContactInfo: (show: boolean) => void;
  setSearchInConversation: (search: boolean) => void;
  setConversationSearchTerm: (term: string) => void;
}

export interface ModalState {
  filesModalOpen: boolean;
  flagsModalOpen: boolean;
  templatesModalOpen: boolean;
  scheduleModalOpen: boolean;
  filterModalOpen: boolean;
}

export interface ModalActions {
  setFilesModalOpen: (open: boolean) => void;
  setFlagsModalOpen: (open: boolean) => void;
  setTemplatesModalOpen: (open: boolean) => void;
  setScheduleModalOpen: (open: boolean) => void;
  setFilterModalOpen: (open: boolean) => void;
  scheduleData: any;
  setScheduleData: (data: any) => void;
}

export interface ScheduleMessageData {
  message: string;
  date: string;
  time: string;
}

export interface ConversationsContextType extends ConversationsState, ConversationsActions, ModalState, ModalActions {
  // Dados da API
  conversations: import('../../../services/api').Conversation[];
  messages: Message[];
  templates: Template[];
  flags: Flag[];
  clinicSettings?: {
    conversations?: {
      show_newsletter?: boolean;
      show_groups?: boolean;
    };
    ui?: {
      sidebar_minimized?: boolean;
      recent_emojis?: string[];
    };
  };
  
  // Estados de loading
  conversationsLoading: boolean;
  messagesLoading: boolean;
  
  // Estados de erro
  conversationsError: Error | null;
  messagesError: Error | null;
  
  // Configurações
  clinicId: string;
  isConnected: boolean;
  
  // Dados mock/estáticos
  patientInfo: PatientInfo;
  templateCategories: TemplateCategory[];
  menuItems: MenuItem[];
  
  // Filter column control
  filterColumnOpen: boolean;
  setFilterColumnOpen: (open: boolean) => void;
  
  // Contact drawer control
  contactDrawerOpen: boolean;
  setContactDrawerOpen: (open: boolean) => void;
  contactDrawerTab: 'contact' | 'conversation';
  setContactDrawerTab: (tab: 'contact' | 'conversation') => void;
  transferDrawerOpen: boolean;
  setTransferDrawerOpen: (open: boolean) => void;
  scheduleMessageDrawerOpen: boolean;
  setScheduleMessageDrawerOpen: (open: boolean) => void;
  finishConversationDrawerOpen: boolean;
  setFinishConversationDrawerOpen: (open: boolean) => void;
  quickRepliesDrawerOpen: boolean;
  setQuickRepliesDrawerOpen: (open: boolean) => void;
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  isAnyDrawerOpen: boolean;
}

// Tipos para hooks
export interface UseConversationMenuReturn {
  openMenuId: string | null;
  handleMenuClick: (conversationId: string) => void;
  handleMenuAction: (action: string, conversation: import('../../../services/api').Conversation) => void;
}

export interface UseMessageMenuReturn {
  openMenuId: string | null;
  menuPosition: MenuPosition;
  handleMenuClick: (messageId: string, event: React.MouseEvent) => void;
  handleMenuAction: (action: string, message: Message) => void;
}

export interface UseConversationFiltersReturn {
  filteredConversations: import('../../../services/api').Conversation[];
  filterOptions: FilterOption[];
  selectedFilterFlags: string[];
  handleFilterClick: (filter: string) => void;
  setSelectedFilterFlags: (flags: string[]) => void;
  applyCustomFilters: () => void;
}

// Tipos para componentes
export interface ConversationItemProps {
  conversation: import('../../../services/api').Conversation;
  isSelected: boolean;
  onSelect: (conversation: import('../../../services/api').Conversation) => void;
  onMenuClick: (conversationId: string) => void;
  showMenu: boolean;
  onMenuAction: (action: string, conversation: import('../../../services/api').Conversation) => void;
}

export interface MessageItemProps {
  message: Message;
  conversation?: import('../../../services/api').Conversation; // Adicionar informação da conversa
  onMenuClick: (messageId: string, event: React.MouseEvent) => void;
  showMenu: boolean;
  onMenuAction: (action: string, message: Message) => void;
}

export interface ChatHeaderProps {
  conversation: import('../../../services/api').Conversation;
  onToggleInfo: () => void;
  onToggleSearch: () => void;
  showContactInfo: boolean;
  searchInConversation: boolean;
}

export type MessageInputMode = 'message' | 'note';

export interface MessageInputProps {
  // Propriedades existentes
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  onSchedule?: (scheduleData: any) => void;

  // Novas propriedades
  mode?: MessageInputMode;                     // 'message' (default) | 'note'
  
  // Botões existentes (mantém handlers atuais)
  onAdd?: () => void;
  onAttachDoc?: () => void;
  onEmoji?: () => void;

  // Áudio
  onStartRecording?: () => void;

  // Header
  agentName?: string;                          // ex.: "Paulo R."
  agentAvatarUrl?: string;                     // ex.: "/assets/agent-example.png"
  appendAgentSignature?: boolean;              // SÓ UI neste PR
  onToggleAppendSignature?: (v: boolean) => void;

  onChangeMode?: (m: MessageInputMode) => void;
  disabled?: boolean;
}

export interface MessageInputRef {
  focus: () => void;
  handleSendMessage: () => void;
}
