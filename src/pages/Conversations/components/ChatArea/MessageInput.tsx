import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { 
  Send, 
  Smile, 
  Mic,
  Plus,
  FileText,
  Calendar,
  Image,
  Camera,
  User,
  BarChart3,
  CalendarDays,
  Globe,
  X
} from 'lucide-react';
import { MessageInputProps, MessageInputRef } from '../../types';
import { useConversationsContext } from '../../context';
import { AudioRecorder } from './AudioRecorder';
import { EmojiPicker } from './EmojiPicker';
import { useSendAudio } from '../../../../hooks/useMessages';

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading
}, ref) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    selectedConversation,
    setTemplatesModalOpen,
    setScheduleModalOpen,
    setFilesModalOpen
  } = useConversationsContext();

  // Hook para enviar áudio
  const { mutate: sendAudio, isPending: isSendingAudio } = useSendAudio();

  // Expor função de foco para o componente pai
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }), []);

  // Itens do menu do botão "+"
  const plusMenuItems = [
    {
      icon: FileText,
      label: 'Documento',
      color: 'text-purple-600',
      action: () => setFilesModalOpen(true)
    },
    {
      icon: Image,
      label: 'Fotos e vídeos',
      color: 'text-blue-600',
      action: () => setFilesModalOpen(true)
    },
    {
      icon: Camera,
      label: 'Câmera',
      color: 'text-pink-600',
      action: () => setFilesModalOpen(true)
    },
    {
      icon: Mic,
      label: 'Áudio',
      color: 'text-orange-600',
      action: () => setShowAudioRecorder(true)
    },
    {
      icon: User,
      label: 'Contato',
      color: 'text-blue-600',
      action: () => {}
    },
    {
      icon: BarChart3,
      label: 'Enquete',
      color: 'text-yellow-600',
      action: () => {}
    },
    {
      icon: CalendarDays,
      label: 'Evento',
      color: 'text-pink-600',
      action: () => {}
    },
    {
      icon: Globe,
      label: 'Nova figurinha',
      color: 'text-green-600',
      action: () => {}
    }
  ];

  // Função para lidar com o envio de áudio
  const handleSendAudio = async (audioBlob: Blob) => {
    if (!selectedConversation) {
      alert('Nenhuma conversa selecionada');
      return;
    }

    try {
      console.log('Enviando áudio:', audioBlob);
      
      sendAudio({
        conversationId: selectedConversation._id,
        audioBlob
      }, {
        onSuccess: (data) => {
          console.log('✅ Áudio enviado com sucesso:', {
            messageId: data._id,
            message_type: data.message_type,
            content: data.content,
            media_url: data.media_url,
            media_filename: data.media_filename,
            media_size: data.media_size,
            media_mime_type: data.media_mime_type
          });
          setShowAudioRecorder(false);
        },
        onError: (error) => {
          console.error('❌ Erro ao enviar áudio:', error);
          alert('Erro ao enviar áudio. Tente novamente.');
        }
      });
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      alert('Erro ao enviar áudio. Tente novamente.');
    }
  };

  // Função para cancelar a gravação
  const handleCancelAudio = () => {
    setShowAudioRecorder(false);
  };

  // Função para inserir emoji no texto
  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + emoji);
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    
    onChange(newValue);
    
    // Restaurar posição do cursor após o emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }, 0);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 relative">
      {/* Menu flutuante do botão "+" */}
      {showPlusMenu && (
        <>
          {/* Overlay para fechar o menu */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPlusMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-48">
            <div className="space-y-1">
              {plusMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setShowPlusMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Interface de gravação de áudio ou campo de texto */}
      {showAudioRecorder ? (
        <div className="flex items-center justify-center">
          <AudioRecorder
            onSendAudio={handleSendAudio}
            onCancel={handleCancelAudio}
            isLoading={isLoading || isSendingAudio}
          />
        </div>
      ) : (
        <div className="relative">
          {/* Botões do lado esquerdo interno */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
            {/* Botão "+" */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className="p-1 text-gray-700 hover:text-gray-900 h-7 w-7"
              title="Mais opções"
            >
              {showPlusMenu ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>

            {/* Resposta rápida */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTemplatesModalOpen(true)}
              className="p-1 text-gray-700 hover:text-gray-900 h-7 w-7"
              title="Resposta rápida"
            >
              <FileText className="h-4 w-4" />
            </Button>

            {/* Agendar resposta */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScheduleModalOpen(true)}
              className="p-1 text-gray-700 hover:text-gray-900 h-7 w-7"
              title="Agendar resposta"
            >
              <Calendar className="h-4 w-4" />
            </Button>

            {/* Emoji */}
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1 h-7 w-7 ${showEmojiPicker ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-gray-900'}`}
              title="Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Campo de texto */}
          <Input
            ref={inputRef}
            placeholder="Digite uma mensagem"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="h-10 pl-36 pr-16 rounded-full border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-base"
            disabled={isLoading}
            style={{ paddingRight: '120px' }}
          />

          {/* Botão do lado direito interno */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center">
            {/* Botão de áudio ou enviar */}
            {value.trim() ? (
              <Button
                onClick={onSend}
                disabled={isLoading}
                className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full h-7 w-7"
                title="Enviar mensagem"
              >
                {isLoading ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAudioRecorder(true)}
                className="p-1 text-gray-700 hover:text-gray-900 h-7 w-7"
                title="Gravar áudio"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* EmojiPicker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        anchorRef={emojiButtonRef}
      />
    </div>
  );
});

MessageInput.displayName = 'MessageInput';
