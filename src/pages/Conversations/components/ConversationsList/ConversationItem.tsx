import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { ChevronDown, Users, User } from 'lucide-react';
import { Conversation } from '../../../../services/api';
import { getInitials, formatTime, getStandardFlag } from '../../utils';

// Props interface local
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  onMenuClick: (conversationId: string) => void;
  showMenu: boolean;
  onMenuAction: (action: string, conversation: Conversation) => void;
}

// Função para truncar texto com ellipsis
const truncateText = (text: string, maxLength: number = 80): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const ConversationItem: React.FC<ConversationItemProps> = React.memo(({
  conversation,
  isSelected,
  onSelect,
  onMenuClick
}) => {
  const standardFlag = getStandardFlag(conversation);
  const lastMessageTime = conversation.last_message?.timestamp || conversation.updated_at;

  // ✅ Função para obter o nome de exibição correto
  const getDisplayName = () => {
    if (conversation.conversation_type === 'group') {
      return conversation.group_name || `Grupo ${conversation.group_id?.split('@')[0] || 'Desconhecido'}`;
    } else {
      return conversation.customer_name && conversation.customer_name.trim() !== ''
        ? conversation.customer_name
        : conversation.customer_phone;
    }
  };

  // ✅ Função para obter as iniciais corretas
  const getDisplayInitials = () => {
    const displayName = getDisplayName();
    return getInitials(displayName);
  };

  const displayName = getDisplayName();

  return (
    <div
      key={conversation._id}
      data-conversation-id={conversation._id}
      className={`
        flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative group
        ${isSelected ? 'bg-gray-100 border-r-4 border-orange-500' : ''}
      `}
      onClick={() => onSelect(conversation)}
    >
      <div className="relative mr-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.customer_profile_pic} />
          <AvatarFallback className={`text-gray-700 ${
            conversation.conversation_type === 'group' 
              ? 'bg-blue-100' 
              : 'bg-gray-300'
          }`}>
            {getDisplayInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* ✅ Ícone indicador de tipo de conversa */}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
          {conversation.conversation_type === 'group' ? (
            <Users className="h-3 w-3 text-blue-500" />
          ) : (
            <User className="h-3 w-3 text-gray-500" />
          )}
        </div>
        
        {/* Indicador de mensagens não lidas */}
        {(conversation.unread_count || 0) > 0 && (
          <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 flex-1 min-w-0 flex items-center">
            <span className="block truncate">
              {displayName}
            </span>
            {/* ✅ Badge indicador de tipo (opcional, mais discreto) */}
            {conversation.conversation_type === 'group' && (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200">
                Grupo
              </Badge>
            )}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatTime(lastMessageTime)}
          </span>
        </div>


        <div className="mt-1">
          <p className="text-sm text-gray-600">
            {/* ✅ Para grupos, mostrar quem enviou a última mensagem */}
            {conversation.conversation_type === 'group' && conversation.last_message?.sender_name && (
              <span className="font-medium text-blue-600">
                {conversation.last_message.sender_name}: 
              </span>
            )}
            {truncateText(conversation.last_message?.content || 'Sem mensagens', 65)}
          </p>
        </div>
        
        {/* Flag padrão sempre presente */}
        <div className="mt-1">
          {(() => {
            const IconComponent = standardFlag.icon;
            return (
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: `${standardFlag.color}20`,
                  borderColor: standardFlag.color,
                  color: standardFlag.color
                }}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {standardFlag.name}
              </Badge>
            );
          })()}
        </div>
      </div>

      {/* Chevron do menu - aparece apenas no hover */}
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded-full hover:bg-gray-200"
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(conversation._id);
        }}
      >
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
});
