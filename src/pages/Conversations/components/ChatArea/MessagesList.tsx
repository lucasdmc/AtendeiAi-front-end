import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Input } from '../../../../components/ui/input';
import { Search, X, MessageSquare } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { MessageMenu } from './MessageMenu';
import { MessagesLoading, EmptyState } from '../ui';
import { useConversationsContext } from '../../context';
import { useMessageMenu } from '../../hooks';
import { filterMessagesBySearch } from '../../utils';

export const MessagesList: React.FC = () => {
  const {
    messages,
    messagesLoading,
    searchInConversation,
    conversationSearchTerm,
    setConversationSearchTerm,
    setSearchInConversation
  } = useConversationsContext();

  // Hook para gerenciar menu das mensagens
  const { openMenuId, menuPosition, handleMenuClick, handleMenuAction } = useMessageMenu();

  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Filtrar mensagens baseado na busca
  const filteredMessages = filterMessagesBySearch(messages, conversationSearchTerm);

  // Scroll automático para o final quando novas mensagens chegam
  useEffect(() => {
    if (messagesEndRef.current && !searchInConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, searchInConversation]);

  // Scroll para o final ao abrir uma conversa
  useEffect(() => {
    if (messages.length > 0 && !searchInConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [messages.length, searchInConversation]);

  return (
    <div className="h-full flex flex-col">
      {/* Barra de busca na conversa (condicional) */}
      {searchInConversation && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar nesta conversa..."
              value={conversationSearchTerm}
              onChange={(e) => setConversationSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            <button
              onClick={() => {
                setSearchInConversation(false);
                setConversationSearchTerm('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Resultados da busca */}
          {conversationSearchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredMessages.length} mensagem(ns) encontrada(s)
            </div>
          )}
        </div>
      )}

      {/* Lista de mensagens */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4">
        {messagesLoading ? (
          <MessagesLoading />
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-full h-full" />}
            title={conversationSearchTerm ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda'}
            description={conversationSearchTerm ? 'Tente usar outros termos de busca' : 'As mensagens aparecerão aqui quando enviadas'}
          />
        ) : (
          <div className="space-y-1">
            {(() => {
              // Procurar especificamente pela mensagem "33333333333tuuuuuu"
              const targetMessage = filteredMessages.find(msg => msg.content === '33333333333tuuuuuu');
              
              console.log('🔍 MessagesList Debug:', {
                totalMessages: filteredMessages.length,
                targetMessage: targetMessage ? {
                  id: targetMessage._id,
                  sender_type: targetMessage.sender_type,
                  content: targetMessage.content,
                  message_type: targetMessage.message_type,
                  whatsapp_message: (targetMessage as any).whatsapp_message,
                  isOutbound: targetMessage.sender_type === 'bot' || targetMessage.sender_type === 'human',
                  isInbound: targetMessage.sender_type === 'customer'
                } : 'NÃO ENCONTRADA',
                lastFewMessages: filteredMessages.slice(0, 5).map(msg => ({
                  id: msg._id,
                  sender_type: msg.sender_type,
                  content: msg.content?.substring(0, 30),
                  message_type: msg.message_type
                }))
              });
              return null;
            })()}
            
            {filteredMessages.map((message: any) => (
              <MessageItem
                key={message._id}
                message={message}
                onMenuClick={handleMenuClick}
                showMenu={openMenuId === message._id}
                onMenuAction={handleMenuAction}
              />
            ))}
            
            {/* Elemento para scroll automático */}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </ScrollArea>

      {/* Menu de mensagem (renderizado fora da lista para z-index) */}
      {openMenuId && (() => {
        const selectedMessage = filteredMessages.find((msg: any) => msg._id === openMenuId);
        return selectedMessage ? (
          <MessageMenu
            message={selectedMessage}
            isOpen={true}
            position={menuPosition}
            onAction={handleMenuAction}
          />
        ) : null;
      })()}
    </div>
  );
};
