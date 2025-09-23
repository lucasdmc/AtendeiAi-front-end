export interface Conversation {
  _id: string;
  id?: string;
  customer_name?: string;
  customer_phone: string;
  customer_profile_pic?: string;
  
  // ✅ Campos para suporte a grupos
  conversation_type: 'individual' | 'group';
  group_id?: string;
  group_name?: string;
  last_participant_id?: string;
  last_participant_name?: string;
  
  last_message?: {
    content: string;
    timestamp: string;
    sender_type: 'customer' | 'bot' | 'human';
    sender_id?: string; // ID do remetente (para grupos)
    sender_name?: string; // Nome do remetente (para grupos)
  };
  unread_count?: number;
  assigned_user_id?: string | null;
  updated_at: string;
  created_at: string;
  status: 'active' | 'archived' | 'closed';
  avatar?: string;
}

export interface Message {
  _id: string;
  content: string;
  timestamp: string;
  sender_type: 'customer' | 'bot' | 'human';
  status?: 'sent' | 'delivered' | 'read';
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  conversation_id: string;
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
  selectedConversation: Conversation | null;
  searchTerm: string;
  activeFilter: string;
  showContactInfo: boolean;
  sidebarMinimized: boolean;
  searchInConversation: boolean;
  conversationSearchTerm: string;
}

export interface ConversationsActions {
  setSelectedConversation: (conversation: Conversation | null) => void;
  setSearchTerm: (term: string) => void;
  setActiveFilter: (filter: string) => void;
  setShowContactInfo: (show: boolean) => void;
  setSidebarMinimized: (minimized: boolean) => void;
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
}

export interface ScheduleMessageData {
  message: string;
  date: string;
  time: string;
}

export interface ConversationsContextType extends ConversationsState, ConversationsActions, ModalState, ModalActions {
  // Dados da API
  conversations: Conversation[];
  messages: Message[];
  templates: Template[];
  flags: Flag[];
  
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
}

// Tipos para hooks
export interface UseConversationMenuReturn {
  openMenuId: string | null;
  handleMenuClick: (conversationId: string) => void;
  handleMenuAction: (action: string, conversation: Conversation) => void;
}

export interface UseMessageMenuReturn {
  openMenuId: string | null;
  menuPosition: MenuPosition;
  handleMenuClick: (messageId: string, event: React.MouseEvent) => void;
  handleMenuAction: (action: string, message: Message) => void;
}

export interface UseConversationFiltersReturn {
  filteredConversations: Conversation[];
  filterOptions: FilterOption[];
  selectedFilterFlags: string[];
  handleFilterClick: (filter: string) => void;
  setSelectedFilterFlags: (flags: string[]) => void;
  applyCustomFilters: () => void;
}

// Tipos para componentes
export interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  onMenuClick: (conversationId: string) => void;
  showMenu: boolean;
  onMenuAction: (action: string, conversation: Conversation) => void;
}

export interface MessageItemProps {
  message: Message;
  onMenuClick: (messageId: string, event: React.MouseEvent) => void;
  showMenu: boolean;
  onMenuAction: (action: string, message: Message) => void;
}

export interface ChatHeaderProps {
  conversation: Conversation;
  onToggleInfo: () => void;
  onToggleSearch: () => void;
  showContactInfo: boolean;
  searchInConversation: boolean;
}

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}
