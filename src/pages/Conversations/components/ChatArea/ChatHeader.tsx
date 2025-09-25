import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Search, 
  Info
} from 'lucide-react';
import { ChatHeaderProps } from '../../types';
import { getInitials, getStandardFlag } from '../../utils';

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onToggleInfo,
  onToggleSearch,
  showContactInfo,
  searchInConversation
}) => {
  const standardFlag = getStandardFlag(conversation);
  const displayName = conversation.customer_name || conversation.customer_phone;

  return (
    <div 
      className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onToggleInfo}
      title="Clique para ver informações do contato"
    >
      {/* Informações do contato */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage 
            src={conversation.customer_profile_pic || conversation.avatar} 
            alt={displayName} 
          />
          <AvatarFallback className="bg-gray-200 text-gray-600">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Nome e status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-gray-900 truncate">
              {displayName}
            </h2>
            
            {/* Badge do tipo de atendimento - apenas para conversas manuais */}
            {standardFlag && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 flex items-center gap-1 flex-shrink-0"
                style={{ 
                  backgroundColor: `${standardFlag.color}20`,
                  color: standardFlag.color,
                  borderColor: `${standardFlag.color}40`
                }}
              >
                <standardFlag.icon className="h-3 w-3" />
                {standardFlag.name}
              </Badge>
            )}
          </div>

          {/* Status online/offline */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
            
            {/* Contador de mensagens não lidas */}
            {conversation.unread_count && conversation.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs">
                {conversation.unread_count} não lida{conversation.unread_count > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Ações do header */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Buscar na conversa */}
        <Button
          variant={searchInConversation ? "default" : "ghost"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Evita que o clique no botão acione o onClick do header
            onToggleSearch();
          }}
          className="p-2"
          title="Buscar nesta conversa"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Informações do contato */}
        <Button
          variant={showContactInfo ? "default" : "ghost"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Evita que o clique no botão acione o onClick do header
            onToggleInfo();
          }}
          className="p-2"
          title="Informações do contato"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
