import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Search, 
  Info,
  Tag,
  MessageSquare,
  ArrowRightLeft,
  Lock,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';
import { ChatHeaderProps } from '../../types';
import { getInitials, getStandardFlag } from '../../utils';
import { TagsMenu } from './TagsMenu';
import { useConversationsContext } from '../../context';

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onToggleInfo,
  onToggleSearch,
  searchInConversation
}) => {
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<any[]>([
    { id: '1', name: 'Vendido', color: '#10B981', type: 'conversation' },
    { id: '3', name: 'Pendente', color: '#F59E0B', type: 'conversation' }
  ]);

  // Usar contexto para controlar o drawer
  const { 
    setContactDrawerOpen, 
    setContactDrawerTab 
  } = useConversationsContext();

  const standardFlag = getStandardFlag(conversation);
  const displayName = conversation.customer_name || conversation.customer_phone;

  // Mock department - em produção viria da conversa
  const department = 'Comercial';

  const handleTagToggle = (tag: any) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleCreateTag = (name: string, color: string, type: 'contact' | 'conversation') => {
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
      type
    };
    // Em produção, aqui faria a chamada para API
    console.log('Criar nova tag:', newTag);
  };

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
            src={conversation.customer_profile_pic} 
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

          {/* Etiquetas e departamento */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Etiquetas aplicadas */}
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                className="text-xs px-2 py-0.5 flex items-center gap-1"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: `${tag.color}40`
                }}
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </Badge>
            ))}
            
            {/* Botão de etiquetas - inline com as etiquetas */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setTagsMenuOpen(!tagsMenuOpen);
                }}
                className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Editar etiquetas"
              >
                <Tag className="h-3 w-3" />
              </Button>
              
              <TagsMenu
                isOpen={tagsMenuOpen}
                onClose={() => setTagsMenuOpen(false)}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onCreateTag={handleCreateTag}
              />
            </div>
            
            {/* Departamento */}
            {department && (
              <span className="text-xs text-gray-500">
                {department}
              </span>
            )}
            
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
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* 1. Buscar na conversa */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSearch();
          }}
          className={`h-8 w-8 ${
            searchInConversation 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Buscar nesta conversa"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* 2. Detalhes do contato */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setContactDrawerTab('contact');
            setContactDrawerOpen(true);
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Informações do contato"
        >
          <Info className="h-4 w-4" />
        </Button>

        {/* 3. Detalhes da conversa */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setContactDrawerTab('conversation');
            setContactDrawerOpen(true);
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Detalhes da conversa"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* 4. Transferir conversa */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar transferência de conversa
            console.log('Transferir conversa');
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Transferir conversa"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        {/* 5. Privar atendimento */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar privar atendimento
            console.log('Privar atendimento');
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Privar atendimento"
        >
          <Lock className="h-4 w-4" />
        </Button>

        {/* 6. Agendar envio de mensagem */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar agendamento de mensagem
            console.log('Agendar mensagem');
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Agendar envio de mensagem"
        >
          <Calendar className="h-4 w-4" />
        </Button>

        {/* 7. Finalizar conversa */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar finalização de conversa
            console.log('Finalizar conversa');
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Finalizar conversa"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>

        {/* 8. Ocultar essa janela */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar ocultar janela
            console.log('Ocultar janela');
          }}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          title="Ocultar essa janela"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
