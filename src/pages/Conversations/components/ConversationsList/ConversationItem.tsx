import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  ChevronDown, 
  Clock, 
  Lock, 
  Tag,
  Mail,
  UserX,
  CheckCircle,
  UserMinus,
  Pin,
  Search,
  User,
  MessageCircle,
  X
} from 'lucide-react';
import { ConversationActions } from './ConversationActions';

// Interface para tags
interface TagItem {
  id: string;
  name: string;
  color: string;
  type: 'contact' | 'conversation';
}
type ConversationItemProps = {
  id: string;
  contactName: string;
  contactAvatarUrl?: string;
  lastMessageSnippet?: string;
  lastActiveAt: string | Date;
  sectorLabel: string;
  contactTags?: Array<{label: string; tone?: 'green'|'blue'|'gray'}>;
  conversationTags?: TagItem[]; // Tags específicas da conversa
  isSelected?: boolean;
  isUnread?: boolean;
  isPrivate?: boolean;
  hasScheduledMessage?: boolean;
  agentAvatarUrl?: string;
  source?: 'whatsapp'|'instagram'|'webchat';
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onTagsChange?: (tags: TagItem[]) => void; // Callback para mudanças nas tags
  // Novas props para ações contextuais
  activeTab?: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
  onAction?: (action: string, conversationId: string) => void;
};

// Cores predefinidas para tags
const PREDEFINED_COLORS = [
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

// Sample tags - em produção viria da API
const SAMPLE_TAGS: TagItem[] = [
  { id: '1', name: 'Vendido', color: '#10B981', type: 'conversation' },
  { id: '2', name: 'Recusado', color: '#EF4444', type: 'conversation' },
  { id: '3', name: 'Pendente', color: '#F59E0B', type: 'conversation' },
  { id: '4', name: 'VIP', color: '#8B5CF6', type: 'contact' },
  { id: '5', name: 'Urgente', color: '#EF4444', type: 'contact' },
];

// Componente TagsMenu integrado
const TagsMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedTags: TagItem[];
  onTagToggle: (tag: TagItem) => void;
  onCreateTag: (name: string, color: string, type: 'contact' | 'conversation') => void;
  position: { top: number; left: number };
}> = ({ isOpen, onClose, selectedTags, onTagToggle, onCreateTag, position }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'contact' | 'conversation'>('conversation');
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PREDEFINED_COLORS[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const filteredTags = SAMPLE_TAGS.filter(tag => 
    tag.type === activeTab && 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), newTagColor, activeTab);
      setNewTagName('');
      setIsCreating(false);
    }
  };

  const isTagSelected = (tag: TagItem) => {
    return selectedTags.some(selected => selected.id === tag.id);
  };

  if (!isOpen) return null;

  // Ajustar posição para não sair da viewport
  const adjustedPosition = {
    top: Math.min(position.top, window.innerHeight - 400),
    left: Math.min(position.left, window.innerWidth - 320)
  };

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] w-80"
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Etiquetas</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="text-blue-600 hover:text-blue-700"
          >
            Criar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        </div>
        
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'contact'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contact')}
        >
          <User className="h-4 w-4" />
          Contato ({SAMPLE_TAGS.filter(t => t.type === 'contact').length})
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'conversation'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('conversation')}
        >
          <MessageCircle className="h-4 w-4" />
          Conversa ({SAMPLE_TAGS.filter(t => t.type === 'conversation').length})
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        </div>

      {/* Create Tag Form */}
      {isCreating && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Nome da etiqueta"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="h-9"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cor:</span>
              <div className="flex gap-1">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newTagColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                Criar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="max-h-60 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhuma etiqueta encontrada
          </div>
        ) : (
          <div className="p-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => onTagToggle(tag)}
              >
                <input
                  type="checkbox"
                  checked={isTagSelected(tag)}
                  onChange={() => onTagToggle(tag)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <Badge
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: `${tag.color}40`
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Modal de confirmação para remoção de tag
const RemoveTagModal: React.FC<{
  isOpen: boolean;
  tag: TagItem | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, tag, onConfirm, onCancel }) => {
  if (!isOpen || !tag) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Remover etiqueta</h3>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tem certeza de que deseja remover a etiqueta{' '}
            <span className="font-semibold" style={{ color: tag.color }}>
              {tag.name}
            </span>{' '}
            da conversa?
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Componente para badge da plataforma
const PlatformBadge: React.FC<{ platform?: string; className?: string }> = ({ platform, className = '' }) => {
  if (!platform || platform === 'whatsapp') {
    return (
      <div className={`w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center ${className}`}>
        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    );
  }
  return null;
};

// Componente para badge de cadeado
const LockBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-[18px] h-[18px] rounded-full bg-gray-600 flex items-center justify-center ${className}`}>
    <Lock className="w-2.5 h-2.5 text-white" />
  </div>
);

// Componente para tags
const TagsRow: React.FC<{ items?: Array<{label: string; tone?: 'green'|'blue'|'gray'}>; className?: string }> = ({ 
  items, 
  className = '' 
}) => {
  if (!items || items.length === 0) return null;

  const getToneColors = (tone?: string) => {
    switch (tone) {
      case 'green':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center gap-2 overflow-hidden ${className}`}>
      {items.map((tag, index) => (
        <Badge
          key={index}
          className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${getToneColors(tag.tone)}`}
        >
          {tag.label}
        </Badge>
      ))}
    </div>
  );
};

// Componente para badge do setor
const SectorBadge: React.FC<{ label: string }> = ({ label }) => (
  <Badge className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 border-gray-200 whitespace-nowrap">
    {label}
  </Badge>
);

// Menu de contexto
const ContextMenu: React.FC<{
  isOpen: boolean;
  position: { top: number; left: number };
  onClose: () => void;
  onAction: (action: string) => void;
  isUnread?: boolean;
}> = ({ isOpen, position, onClose, onAction, isUnread }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const menuItems = [
    { id: 'assume', label: 'Assumir a conversa', icon: User },
    { id: 'tag', label: 'Adicionar etiqueta', icon: Tag },
    { id: 'unread', label: 'Marcar como não lida', icon: Mail, checked: isUnread },
    { id: 'block', label: 'Bloquear contato', icon: UserX },
    { id: 'finish', label: 'Finalizar conversa', icon: CheckCircle },
    { id: 'remove-waiting', label: 'Retirar dos esperando', icon: UserMinus },
    { id: 'pin', label: 'Fixar conversa', icon: Pin },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % menuItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? menuItems.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onAction(menuItems[focusedIndex].id);
          onClose();
        }
        break;
    }
  }, [isOpen, focusedIndex, menuItems.length, onAction, onClose]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleKeyDown, handleClickOutside]);

  if (!isOpen) return null;

  // Ajustar posição para não sair da viewport
  const adjustedPosition = {
    top: Math.min(position.top, window.innerHeight - 300),
    left: Math.min(position.left, window.innerWidth - 280)
  };

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[260px] z-[1000]"
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left - 260, // Alinhar à direita do chevron
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
      <button
            key={item.id}
            role="menuitem"
            className={`w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 ${
              focusedIndex === index ? 'bg-gray-50' : ''
            }`}
            onClick={() => {
              onAction(item.id);
              onClose();
            }}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="flex-1">{item.label}</span>
            {item.checked && (
              <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>,
    document.body
  );
};

// Função para formatar tempo relativo
const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Agora';
  if (diffInHours < 24) return `${diffInHours} horas atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 dia atrás';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  
  return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

// Função para obter iniciais
const getInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('');
};

export const ConversationItem: React.FC<ConversationItemProps> = ({
  id,
  contactName,
  contactAvatarUrl,
  lastMessageSnippet,
  lastActiveAt,
  sectorLabel,
  contactTags,
  conversationTags = [],
  isSelected = false,
  isUnread = false,
  isPrivate = false,
  hasScheduledMessage = false,
  agentAvatarUrl,
  source = 'whatsapp',
  activeTab,
  onClick,
  onContextMenu,
  onTagsChange,
  onAction
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [tagsMenuPosition, setTagsMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedTags, setSelectedTags] = useState<TagItem[]>(conversationTags);
  const [removeTagModal, setRemoveTagModal] = useState<{ isOpen: boolean; tag: TagItem | null }>({ isOpen: false, tag: null });
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const tagIconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (chevronRef.current) {
      const rect = chevronRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right
      });
    }
    
    setMenuOpen(true);
  };

  const handleTagIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tagIconRef.current) {
      const rect = tagIconRef.current.getBoundingClientRect();
      setTagsMenuPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
    
    setTagsMenuOpen(true);
  };

  const handleTagToggle = (tag: TagItem) => {
    const newTags = selectedTags.some(selected => selected.id === tag.id)
      ? selectedTags.filter(selected => selected.id !== tag.id)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleCreateTag = (name: string, color: string, type: 'contact' | 'conversation') => {
    const newTag: TagItem = {
      id: Date.now().toString(),
      name,
      color,
      type
    };
    
    // Em produção, aqui faria a chamada para API
    console.log('Criar nova tag:', newTag);
    
    // Adicionar automaticamente à conversa se for do tipo conversation
    if (type === 'conversation') {
      const newTags = [...selectedTags, newTag];
      setSelectedTags(newTags);
      if (onTagsChange) {
        onTagsChange(newTags);
      }
    }
  };

  const handleRemoveTag = (tag: TagItem, e: React.MouseEvent) => {
          e.stopPropagation();
    setRemoveTagModal({ isOpen: true, tag });
  };

  const confirmRemoveTag = () => {
    if (removeTagModal.tag) {
      const newTags = selectedTags.filter(tag => tag.id !== removeTagModal.tag!.id);
      setSelectedTags(newTags);
      if (onTagsChange) {
        onTagsChange(newTags);
      }
    }
    setRemoveTagModal({ isOpen: false, tag: null });
  };

  const cancelRemoveTag = () => {
    setRemoveTagModal({ isOpen: false, tag: null });
  };

  const handleMenuAction = (action: string) => {
    console.log(`Action: ${action} for conversation: ${id}`);
    // Aqui você implementaria as ações específicas
  };

  const ariaLabel = `${contactName}, ${sectorLabel}, ${formatRelativeTime(lastActiveAt)}${isPrivate ? ', conversa privada' : ''}${hasScheduledMessage ? ', mensagem agendada' : ''}`;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        aria-label={ariaLabel}
        className={`group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 border-b border-gray-100 min-h-[88px] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
          isSelected 
            ? 'bg-[#E9F0FF] border-l-4 border-l-[#2D61E0]' 
            : 'bg-white hover:bg-[#F5F7FB]'
        }`}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        {/* Coluna 1 - Avatar */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contactAvatarUrl} alt={contactName} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
              {getInitials(contactName)}
            </AvatarFallback>
          </Avatar>
          
          {/* Badge da plataforma */}
          <PlatformBadge platform={source} className="absolute -bottom-1 -left-1" />
          
          {/* Badge de privacidade */}
          {isPrivate && <LockBadge className="absolute -bottom-1 -right-1" />}
        </div>

        {/* Coluna 2 - Texto */}
        <div className="min-w-0 flex flex-col gap-1">
          {/* Nome */}
          <div className={`text-[15px] ${isUnread ? 'font-bold' : 'font-semibold'} text-[#2E2E2E] truncate`}>
            {contactName}
          </div>
          
          {/* Tags */}
          {contactTags && contactTags.length > 0 && (
            <div className="overflow-hidden">
              <TagsRow items={contactTags} className="truncate" />
            </div>
          )}
          
          {/* Snippet da última mensagem */}
          {lastMessageSnippet && (
            <div className="text-[13px] text-[#6F6F6F] truncate">
              {lastMessageSnippet}
            </div>
          )}
          
          {/* Etiquetas da conversa */}
          <div className="flex items-center gap-2 mt-1">
            {selectedTags.length > 0 ? (
              // Mostrar etiquetas existentes
              <>
                {/* Primeira etiqueta com hover para remoção */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setHoveredTag(selectedTags[0].id)}
                  onMouseLeave={() => setHoveredTag(null)}
                >
                  <Badge
                    key={selectedTags[0].id}
                    className="text-xs px-2 py-0.5 rounded-full border pr-6 transition-all duration-200"
                    style={{
                      backgroundColor: `${selectedTags[0].color}20`,
                      color: selectedTags[0].color,
                      borderColor: `${selectedTags[0].color}40`
                    }}
                  >
                    {selectedTags[0].name}
                  </Badge>
                  {/* X para remover (aparece no hover) */}
                  {hoveredTag === selectedTags[0].id && (
                    <button
                      onClick={(e) => handleRemoveTag(selectedTags[0], e)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                      title="Remover etiqueta"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Badge +N se houver mais etiquetas */}
                {selectedTags.length > 1 && (
                  <div className="relative">
                    <Badge
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 cursor-help"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      +{selectedTags.length - 1}
                    </Badge>
                    
                    {/* Tooltip com etiquetas ocultas */}
                    {showTooltip && (
                      <div
                        ref={tooltipRef}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-[100] whitespace-nowrap"
                      >
                        <div className="space-y-1">
                          {selectedTags.slice(1).map((tag) => (
                            <div key={tag.id} className="flex items-center gap-1">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </div>
                          ))}
                        </div>
                        {/* Seta do tooltip */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </div>
                )}

                {/* Ícone para adicionar mais etiquetas */}
                <button
                  ref={tagIconRef}
                  onClick={handleTagIconClick}
                  className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  title="Adicionar etiqueta"
                >
                  <Tag className="w-3 h-3 text-gray-500" />
                </button>
              </>
            ) : (
              // Mostrar apenas o ícone quando não há etiquetas
              <button
                ref={tagIconRef}
                onClick={handleTagIconClick}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Adicionar etiqueta"
              >
                <Tag className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Coluna 3 - Meta */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Hora */}
          <div className="text-[12px] text-[#A3A3A3] whitespace-nowrap">
            {formatRelativeTime(lastActiveAt)}
          </div>
          
          {/* Linha inferior com badges e chevron */}
          <div className="flex items-center gap-2">
            {/* Badge do setor */}
            <SectorBadge label={sectorLabel} />
            
            {/* Avatar do agente */}
            {agentAvatarUrl && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={agentAvatarUrl} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  A
                </AvatarFallback>
              </Avatar>
            )}
            
            {/* Ícone de mensagem agendada */}
            {hasScheduledMessage && (
              <div title="Mensagem agendada">
                <Clock className="w-4 h-4 text-[#2D61E0]" />
              </div>
            )}
            
            {/* Ações contextuais baseadas na aba */}
            {activeTab && onAction && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ConversationActions
                  conversation={{
                    _id: id,
                    customer_name: contactName,
                    customer_phone: contactName,
                    conversation_type: 'individual',
                    status: 'active',
                    assigned_to: null,
                    state: 'ACTIVE',
                    bot_active: false,
                    started_at: null,
                    last_message: lastMessageSnippet ? { content: lastMessageSnippet, timestamp: lastActiveAt.toString() } : null
                  } as any}
                  activeTab={activeTab}
                  onAction={(action) => onAction(action, id)}
                />
              </div>
            )}
            
            {/* Chevron */}
            <button
              ref={chevronRef}
              aria-label="Mais opções"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="relative w-8 h-8 grid place-items-center rounded-md hover:bg-black/5 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none transition-opacity"
              onClick={handleChevronClick}
            >
              <ChevronDown className="w-4 h-4 text-[#6F6F6F]" />
      </button>
    </div>
        </div>
      </div>

      {/* Menu de contexto */}
      <ContextMenu
        isOpen={menuOpen}
        position={menuPosition}
        onClose={() => setMenuOpen(false)}
        onAction={handleMenuAction}
        isUnread={isUnread}
      />

      {/* Menu de etiquetas */}
      <TagsMenu
        isOpen={tagsMenuOpen}
        onClose={() => setTagsMenuOpen(false)}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onCreateTag={handleCreateTag}
        position={tagsMenuPosition}
      />

      {/* Modal de confirmação de remoção */}
      <RemoveTagModal
        isOpen={removeTagModal.isOpen}
        tag={removeTagModal.tag}
        onConfirm={confirmRemoveTag}
        onCancel={cancelRemoveTag}
      />
    </>
  );
};