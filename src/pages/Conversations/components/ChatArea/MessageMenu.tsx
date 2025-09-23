import React from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  Info, 
  Reply, 
  Copy, 
  Forward, 
  Star, 
  Ban 
} from 'lucide-react';
import { Message, MessageMenuAction, MenuPosition } from '../../types';

interface MessageMenuProps {
  message: Message;
  isOpen: boolean;
  position: MenuPosition;
  onAction: (action: string, message: Message) => void;
}

const menuActions: MessageMenuAction[] = [
  {
    id: 'info',
    label: 'Informações',
    icon: Info,
    action: 'info'
  },
  {
    id: 'reply',
    label: 'Responder',
    icon: Reply,
    action: 'reply'
  },
  {
    id: 'copy',
    label: 'Copiar',
    icon: Copy,
    action: 'copy'
  },
  {
    id: 'forward',
    label: 'Encaminhar',
    icon: Forward,
    action: 'forward'
  },
  {
    id: 'star',
    label: 'Favoritar',
    icon: Star,
    action: 'star'
  },
  {
    id: 'ban',
    label: 'Banir usuário',
    icon: Ban,
    action: 'ban',
    variant: 'danger' as const
  }
];

export const MessageMenu: React.FC<MessageMenuProps> = ({
  message,
  isOpen,
  position,
  onAction
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="message-menu fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-48"
      style={{ 
        zIndex: 999999,
        top: `${position.top}px`,
        right: `${position.right}px`
      }}
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
            onAction(action.action, message);
          }}
        >
          <action.icon className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

