import React, { useState, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { useConversationsContext } from '../../context';
import { useSendMessage } from '../../../../hooks/useMessages';
import { MessageInputRef } from '../../types';

export const ChatArea: React.FC = () => {
  const {
    selectedConversation,
    showContactInfo,
    searchInConversation,
    setShowContactInfo,
    setSearchInConversation
  } = useConversationsContext();

  // Estado local para o input de mensagem
  const [messageText, setMessageText] = useState('');
  
  // Ref para o input de mensagem
  const messageInputRef = useRef<MessageInputRef>(null);

  // Hook para enviar mensagens
  const { mutate: sendMessage, isPending: isSending, reset: resetSendMessage } = useSendMessage();

  // Handler para enviar mensagem
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || isSending) {
      console.log('❌ Não pode enviar mensagem:', {
        hasText: !!messageText.trim(),
        hasConversation: !!selectedConversation,
        isSending
      });
      return;
    }

    console.log('📤 Enviando mensagem:', {
      conversationId: selectedConversation._id,
      content: messageText.trim(),
      customer: selectedConversation.customer_name || selectedConversation.customer_phone
    });

    sendMessage({
      conversationId: selectedConversation._id,
      content: messageText.trim()
    }, {
      onSuccess: (data) => {
        console.log('✅ Mensagem enviada com sucesso:', data);
        setMessageText('');
        // Focar no input após envio
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
        // Reset da mutação para permitir novos envios
        setTimeout(() => resetSendMessage(), 100);
      },
      onError: (error) => {
        console.error('❌ Erro ao enviar mensagem:', error);
        // Aqui poderia mostrar um toast de erro
      }
    });
  };

  // Handler para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Se não há conversa selecionada
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha uma conversa da lista para começar a visualizar as mensagens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header do chat */}
      <ChatHeader
        conversation={selectedConversation}
        onToggleInfo={() => setShowContactInfo(!showContactInfo)}
        onToggleSearch={() => setSearchInConversation(!searchInConversation)}
        showContactInfo={showContactInfo}
        searchInConversation={searchInConversation}
      />

      {/* Lista de mensagens - altura fixa com scroll */}
      <div className="flex-1 overflow-hidden">
        <MessagesList />
      </div>

      {/* Input de mensagem */}
      <MessageInput
        ref={messageInputRef}
        value={messageText}
        onChange={setMessageText}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isSending}
      />
    </div>
  );
};
