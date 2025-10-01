import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuickReplyPicker } from '@/hooks';
import QuickReplyPicker from './QuickReplyPicker';

/**
 * Exemplo de integração do QuickReplyPicker no chat
 * 
 * Este componente demonstra como integrar as respostas rápidas
 * no sistema de chat existente usando o comando "/"
 */

interface ChatIntegrationExampleProps {
  onSendMessage?: (message: string) => void;
  placeholder?: string;
}

const ChatIntegrationExample: React.FC<ChatIntegrationExampleProps> = ({
  onSendMessage,
  placeholder = 'Digite sua mensagem... (use / para respostas rápidas)',
}) => {
  const [message, setMessage] = useState('');

  // Hook para gerenciar o picker de respostas rápidas
  const {
    isOpen,
    query,
    position,
    closePicker,
    handleTextareaKeyDown,
    handleTextareaInput,
    handleSelect,
  } = useQuickReplyPicker({
    onSelect: (content, quickReplyId) => {
      console.log('Resposta rápida selecionada:', { content, quickReplyId });
      // Aqui você pode adicionar telemetria ou outras ações
    },
  });

  // Handler para enviar mensagem
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message.trim());
      setMessage('');
    }
  };

  // Handler para tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Primeiro, deixar o picker lidar com a navegação
    const pickerHandled = handleTextareaKeyDown(e);
    
    if (pickerHandled) {
      // Se o picker está lidando com o evento, não fazer mais nada
      return;
    }

    // Enviar com Enter (sem Shift)
    if (e.key === 'Enter' && !e.shiftKey && !isOpen) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    setMessage(textarea.value);
    
    // Notificar o picker sobre mudanças
    handleTextareaInput(e);
  };

  return (
    <div className="relative">
      {/* Área de input do chat */}
      <div className="flex items-end gap-2 p-4 border-t bg-white">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[40px] max-h-32 resize-none pr-12"
            rows={1}
          />
          
          {/* Botões de ação no input */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Smile className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Picker de respostas rápidas */}
      <QuickReplyPicker
        isOpen={isOpen}
        onClose={closePicker}
        onSelect={handleSelect}
        initialQuery={query}
        placeholder="Buscar respostas rápidas..."
      />

      {/* Dica de uso (pode ser removida em produção) */}
      {!isOpen && (
        <div className="absolute bottom-full left-4 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Digite "/" para abrir respostas rápidas
        </div>
      )}
    </div>
  );
};

export default ChatIntegrationExample;
