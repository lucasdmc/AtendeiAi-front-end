import React from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  Archive, 
  Trash2, 
  Star, 
  Pin, 
  VolumeX 
} from 'lucide-react';
import { Conversation } from '../../../../services/api';
import { ConversationMenuAction } from '../../types';
import { keyboardHandlers } from '../../utils/accessibility';

interface ConversationMenuProps {
  conversation: Conversation;
  isOpen: boolean;
  onAction: (action: string, conversation: Conversation) => void;
}

const menuActions: ConversationMenuAction[] = [
  {
    id: 'archive',
    label: 'Arquivar',
    icon: Archive,
    action: 'archive'
  },
  {
    id: 'star',
    label: 'Favoritar',
    icon: Star,
    action: 'star'
  },
  {
    id: 'pin',
    label: 'Fixar',
    icon: Pin,
    action: 'pin'
  },
  {
    id: 'mute',
    label: 'Silenciar',
    icon: VolumeX,
    action: 'mute'
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    action: 'delete',
    variant: 'danger' as const
  }
];

export const ConversationMenu: React.FC<ConversationMenuProps> = ({
  conversation,
  isOpen,
  onAction
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstButton = menuRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    keyboardHandlers.menu(event, () => {}, (direction) => {
      const buttons = menuRef.current?.querySelectorAll('button');
      if (!buttons) return;

      const currentIndex = Array.from(buttons).findIndex(btn => btn === document.activeElement);
      let nextIndex;

      if (direction === 'down') {
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      }

      buttons[nextIndex].focus();
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="conversation-menu absolute right-2 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-48"
      style={{ zIndex: 9999 }}
      role="menu"
      aria-label={`Menu de ações para conversa com ${conversation.customer_name || conversation.customer_phone}`}
      onKeyDown={handleKeyDown}
    >
      {menuActions.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          size="sm"
          className={`w-full justify-start px-3 py-2 text-sm font-normal hover:bg-gray-100 ${
            action.variant === 'danger' 
              ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
              : 'text-gray-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onAction(action.action, conversation);
          }}
          role="menuitem"
          aria-label={`${action.label} conversa`}
        >
          <action.icon className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};
