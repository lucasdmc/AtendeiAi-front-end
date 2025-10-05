import React, { useState, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { useConversationsContext } from '../../context';
import { useSendMessage } from '../../../../hooks/useMessages';
import { MessageInputRef, MessageInputMode } from '../../types';
import { DEFAULT_AGENT_ID } from '../../../../constants/auth';

export const ChatArea: React.FC = () => {
  const {
    selectedConversation,
    showContactInfo,
    searchInConversation,
    selectedTemplate,
    setSelectedTemplate,
    setShowContactInfo,
    setSearchInConversation
  } = useConversationsContext();

  // Estado local para o input de mensagem
  const [messageText, setMessageText] = useState('');
  const [messageMode, setMessageMode] = useState<MessageInputMode>('message');
  const [appendAgentSignature, setAppendAgentSignature] = useState(false);
  
  // Ref para o input de mensagem
  const messageInputRef = useRef<MessageInputRef>(null);

  // Hook para enviar mensagens
  const { mutate: sendMessage, isPending: isSending, reset: resetSendMessage } = useSendMessage(selectedConversation?._id || '');

  // Determinar se o input deve estar desabilitado baseado no estado da conversa
  const isInputDisabled = React.useMemo(() => {
    if (!selectedConversation) return true;
    
    const conversationState = (selectedConversation as any).state;
    const assignedUserId = selectedConversation.assigned_user_id;
    
    // TODO: Pegar o ID do usuário logado do contexto de autenticação
    const currentUserId = DEFAULT_AGENT_ID; // Atendente padrão temporário
    
    // Desabilitar se:
    // 1. Conversa não está ASSIGNED ao usuário atual
    // 2. Conversa não está em IN_PROGRESS ou WAITING_CUSTOMER
    if (conversationState === 'NEW' || conversationState === 'ROUTING') {
      return true; // Conversa ainda não foi assumida
    }
    
    if (conversationState === 'ASSIGNED' && assignedUserId !== currentUserId) {
      return true; // Conversa foi assumida por outro agente
    }
    
    if (conversationState === 'RESOLVED' || conversationState === 'CLOSED' || conversationState === 'DROPPED') {
      return true; // Conversa já foi finalizada
    }
    
    // Permitir apenas se a conversa está ASSIGNED, IN_PROGRESS ou WAITING_CUSTOMER para o usuário atual
    return !(assignedUserId === currentUserId && ['ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER'].includes(conversationState));
  }, [selectedConversation]);

  // Efeito para inserir template selecionado no campo de texto
  React.useEffect(() => {
    if (selectedTemplate) {
      setMessageText(selectedTemplate.content);
      setSelectedTemplate(null); // Limpar após usar
    }
  }, [selectedTemplate, setSelectedTemplate]);

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
      // Chamar o handleSendMessage do MessageInput via ref
      if (messageInputRef.current && (messageInputRef.current as any).handleSendMessage) {
        (messageInputRef.current as any).handleSendMessage();
      } else {
        // Fallback para o método antigo
        handleSendMessage();
      }
    }
  };

  // Handler para agendamento
  const handleSchedule = (data: any) => {
    // Verificar se os dados são válidos
    if (!data || !data.date || !data.time || !data.message) {
      console.error('❌ Dados de agendamento inválidos:', data);
      return;
    }

    if (!selectedConversation) {
      console.error('❌ Nenhuma conversa selecionada para agendamento');
      return;
    }

    console.log('📅 Processando agendamento no ChatArea:', data);

    // TODO: Implementar lógica de agendamento
    // const scheduledAt = new Date(`${data.date}T${data.time}`);

    // Enviar mensagem agendada
    sendMessage({
      content: data.message
      // TODO: Implementar agendamento
      // scheduled_at: scheduledAt.toISOString(),
      // recurrence: data.recurrence
    }, {
      onSuccess: (response) => {
        console.log('✅ Mensagem agendada com sucesso:', response);
        // Focar no input após agendamento
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
        // Reset da mutação
        setTimeout(() => resetSendMessage(), 100);
      },
      onError: (error) => {
        console.error('❌ Erro ao agendar mensagem:', error);
        // Aqui poderia mostrar um toast de erro
      }
    });
  };

  // Se não há conversa selecionada
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#F5F7FB' }}>
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
          <h3 className="text-lg font-medium mb-2" style={{ color: '#2E2E2E' }}>
            Selecione uma conversa
          </h3>
          <p style={{ color: '#6F6F6F' }}>
            Escolha uma conversa da lista para começar a visualizar as mensagens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ backgroundColor: '#F5F7FB' }}>
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
        onSend={() => {
          // Este onSend é chamado pelo MessageInput para envio imediato
          handleSendMessage();
        }}
        onKeyPress={handleKeyPress}
        isLoading={isSending}
        onSchedule={handleSchedule}
        mode={messageMode}
        onChangeMode={setMessageMode}
        agentName="Paulo R."
        agentAvatarUrl="/assets/agent-example.png"
        appendAgentSignature={appendAgentSignature}
        onToggleAppendSignature={setAppendAgentSignature}
        disabled={isInputDisabled}
      />
    </div>
  );
};
