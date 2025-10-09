import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Switch } from '../../../../components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
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
  X,
  Clock,
  MessageSquare,
  StickyNote,
  Edit2
} from 'lucide-react';
import { MessageInputProps, MessageInputRef } from '../../types';
import { useConversationsContext } from '../../context';
import { AudioRecorder } from './AudioRecorder';
import { EmojiPicker } from './EmojiPicker';
import { useSendAudio } from '../../../../hooks/useMessages';

interface ScheduleData {
  date: string;
  time: string;
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
    interval?: number;
    unit?: 'days' | 'weeks' | 'months' | 'years';
    daysOfWeek?: string[];
    end?: {
      mode: 'never' | 'date' | 'after';
      date?: string;
      occurrences?: number;
    };
  };
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading = false,
  onSchedule,
  mode = 'message',
  agentName = 'Paulo R.',
  agentAvatarUrl,
  appendAgentSignature = false,
  onToggleAppendSignature,
  onChangeMode,
  disabled = false
}, ref) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    selectedConversation,
    setFilesModalOpen,
    setScheduleModalOpen,
    setQuickRepliesDrawerOpen,
    scheduleData: contextScheduleData,
    setScheduleData: setContextScheduleData
  } = useConversationsContext();

  // Hook para enviar áudio
  const { mutate: sendAudio, isPending: isSendingAudio } = useSendAudio(selectedConversation?._id || '');

  // Monitorar mudanças nos dados de agendamento do contexto
  useEffect(() => {
    if (contextScheduleData) {
      console.log('📅 [MESSAGE INPUT] Recebendo dados de agendamento do contexto:', contextScheduleData);
      setScheduleData(contextScheduleData);
      // Limpar dados do contexto após usar
      setContextScheduleData(null);
    }
  }, [contextScheduleData, setContextScheduleData]);

  // Focar no textarea quando agendamento for definido
  useEffect(() => {
    if (scheduleData) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [scheduleData]);

  // Auto-resize do textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, window.innerHeight * 0.4) + 'px';
    }
  }, [value]);

  // Função para cancelar agendamento
  const handleCancelSchedule = () => {
    setScheduleData(null);
  };

  // Função para enviar mensagem (agendada ou imediata)
  const handleSendMessage = () => {
    console.log('🚀 [MESSAGE INPUT] handleSendMessage chamado. scheduleData:', scheduleData);
    
    if (scheduleData) {
      // Enviar mensagem agendada
      console.log('📅 [MESSAGE INPUT] Enviando mensagem agendada:', {
        message: value,
        schedule: scheduleData
      });
      
      const agendamentoCompleto = {
        message: value,
        ...scheduleData
      };
      
      console.log('📅 [MESSAGE INPUT] Dados completos para agendamento:', agendamentoCompleto);
      
      // Chamar onSchedule com os dados completos
      if (onSchedule) {
        console.log('📅 [MESSAGE INPUT] Chamando onSchedule...');
        onSchedule(agendamentoCompleto);
        
        // Limpar estado após agendar
        setScheduleData(null);
        
        // Limpar input manualmente (não chamar onSend para evitar envio duplo)
        onChange('');
      } else {
        console.log('❌ [MESSAGE INPUT] onSchedule não disponível!');
        // Fallback: limpar estado e chamar onSend
        setScheduleData(null);
        onSend();
      }
    } else {
      // Enviar mensagem imediata
      console.log('📤 [MESSAGE INPUT] Enviando mensagem imediata');
      onSend();
    }
  };

  // Expor funções para o componente pai
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    handleSendMessage: () => {
      handleSendMessage();
    }
  }), [handleSendMessage]);

  // Formatar data/hora para exibição
  const formatScheduleDisplay = (data: ScheduleData): string => {
    const date = new Date(`${data.date}T${data.time}`);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      
      const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type });
      sendAudio(audioFile, {
        onSuccess: (data: any) => {
          console.log('✅ Áudio enviado com sucesso:', {
            messageId: data._id,
            message_type: data.message_type,
            content: data.content,
            media_url: data.media_url,
            media_filename: data.media_filename,
            media_size: data.media_size
          });
          setShowAudioRecorder(false);
        },
        onError: (error: any) => {
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
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + emoji);
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    
    onChange(newValue);
    
    // Restaurar posição do cursor após o emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Lidar com teclas no textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
    
    // Chamar onKeyPress se existir (compatibilidade)
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  // Obter iniciais do nome do agente
  const getAgentInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determinar placeholder baseado no modo
  const getPlaceholder = (): string => {
    if (mode === 'note') {
      return 'Escreva uma nota interna…';
    }
    return 'Digite uma mensagem…';
  };

  // Determinar aria-label baseado no modo
  const getAriaLabel = (): string => {
    if (mode === 'note') {
      return 'Nota interna';
    }
    return `Mensagem para ${selectedConversation?.customer_name || 'contato'}`;
  };

  // Determinar tema baseado no modo
  const getThemeClasses = () => {
    if (mode === 'note') {
      return {
        container: 'bg-[#FFF8E1] border-[#E8D28A]',
        textarea: 'bg-transparent'
      };
    }
    return {
      container: 'bg-white border-[#D6DEEF]',
      textarea: 'bg-transparent'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="p-4 relative">
      {/* Menu flutuante do botão "+" */}
      {showPlusMenu && (
        <>
          {/* Overlay para fechar o menu */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPlusMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-48">
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

      {/* Interface de gravação de áudio ou card principal */}
      {showAudioRecorder ? (
        <div className="flex items-center justify-center">
          <AudioRecorder
            onSendAudio={handleSendAudio}
            onCancel={handleCancelAudio}
            isLoading={isLoading || isSendingAudio}
          />
        </div>
      ) : (
        <div 
          className={`relative w-full min-h-[88px] ${themeClasses.container} border rounded-[20px] shadow-sm grid grid-rows-[auto_1fr_auto] p-4 pb-14`}
          style={{
            // CSS Variables para tema
            '--mi-primary': '#2D61E0',
            '--mi-border': '#D6DEEF',
            '--mi-text': '#2E2E2E',
            '--mi-text-2': '#6F6F6F',
            '--mi-notes-bg': '#FFF8E1',
            '--mi-notes-border': '#E8D28A'
          } as React.CSSProperties}
        >
          {/* Header interno (linha superior) */}
          <div className="flex items-center justify-between mb-3">
            {/* À esquerda: Toggle + Avatar + Nome do atendente - apenas no modo mensagem */}
            <div className="flex items-center gap-3">
              {mode === 'message' && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={appendAgentSignature}
                    onCheckedChange={onToggleAppendSignature}
                    className="data-[state=checked]:bg-[#2D61E0]"
                    disabled={disabled}
                    aria-label="Incluir nome do atendente nas mensagens do WhatsApp"
                  />
                  
                  {/* Avatar do agente */}
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={agentAvatarUrl || "/assets/agent-example.png"} />
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                      {getAgentInitials(agentName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Nome do agente */}
                  <span className="text-sm font-medium text-[#2E2E2E]">
                    {agentName}
                  </span>
                  
                  {/* Ícone de edição */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-[#6F6F6F] hover:text-[#2D61E0]"
                    title="Editar nome do atendente"
                    disabled={disabled}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* À direita: Switch de modo (Mensagem/Notas) - sempre fixo à direita */}
            <div 
              className="flex items-center rounded-full bg-gray-50 p-1"
              role="tablist"
              aria-label="Modo de entrada"
            >
              {/* Mensagem */}
              <button
                role="tab"
                aria-selected={mode === 'message'}
                onClick={() => onChangeMode?.('message')}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'message'
                    ? 'bg-[#2D61E0] text-white shadow-sm'
                    : 'text-[#2E2E2E] hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Mensagem</span>
              </button>

              {/* Notas */}
              <button
                role="tab"
                aria-selected={mode === 'note'}
                onClick={() => onChangeMode?.('note')}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'note'
                    ? 'bg-[#E8B931] text-white shadow-sm'
                    : 'text-[#2E2E2E] hover:bg-gray-100'
                }`}
              >
                <StickyNote className="h-4 w-4" />
                <span>Notas</span>
              </button>
            </div>
          </div>

          {/* Editor (linha central) */}
          <div className="flex-1 pr-16 pb-12">
            <textarea
              ref={textareaRef}
              placeholder={getPlaceholder()}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isLoading}
              aria-label={getAriaLabel()}
              className={`w-full min-h-[48px] max-h-[40vh] resize-none border-none outline-none ${themeClasses.textarea} text-[#2E2E2E] placeholder-[#A3A3A3] leading-6`}
              style={{ 
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Footer interno - posicionado absolutamente na bottom line */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 z-10">
            {/* Botão "+" */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              disabled={disabled}
              className="p-1 text-[#6F6F6F] hover:text-[#2D61E0] hover:bg-black/5 h-8 w-8 rounded-lg"
              title="Mais opções"
            >
              {showPlusMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>

            {/* Resposta rápida */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickRepliesDrawerOpen(true)}
              disabled={disabled}
              className="p-1 text-[#6F6F6F] hover:text-[#2D61E0] hover:bg-black/5 h-8 w-8 rounded-lg"
              title="Resposta rápida"
            >
              <FileText className="h-5 w-5" />
            </Button>

            {/* Agendar resposta - apenas no modo mensagem */}
            {mode === 'message' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScheduleModalOpen(true)}
                disabled={disabled}
                className={`p-1 h-8 w-8 rounded-lg ${
                  scheduleData 
                    ? 'text-[#2D61E0] bg-blue-50' 
                    : 'text-[#6F6F6F] hover:text-[#2D61E0] hover:bg-black/5'
                }`}
                title={scheduleData ? `Agendada para ${formatScheduleDisplay(scheduleData)}` : "Agendar resposta"}
              >
                {scheduleData ? <Clock className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </Button>
            )}

            {/* Emoji */}
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className={`p-1 h-8 w-8 rounded-lg ${
                showEmojiPicker 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-[#6F6F6F] hover:text-[#2D61E0] hover:bg-black/5'
              }`}
              title="Emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {/* Indicador de agendamento - apenas no modo mensagem */}
            {mode === 'message' && scheduleData && (
              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full ml-4">
                <Clock className="h-3 w-3" />
                <span>{formatScheduleDisplay(scheduleData)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSchedule}
                  disabled={disabled}
                  className="p-0 h-4 w-4 text-blue-600 hover:text-blue-800"
                  title="Cancelar agendamento"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* FAB de Áudio (canto inferior-direito) */}
          <div className="absolute bottom-3 right-4 z-10">
            {value.trim() ? (
              /* Botão de envio quando há texto */
              <Button
                onClick={handleSendMessage}
                disabled={disabled || isLoading}
                className={`h-12 w-12 rounded-full shadow-lg ${
                  scheduleData 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : mode === 'note'
                      ? 'bg-[#E8B931] hover:bg-[#D4A728] text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title={scheduleData ? `Agendar para ${formatScheduleDisplay(scheduleData)}` : "Enviar mensagem"}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : scheduleData ? (
                  <Clock className="h-6 w-6" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </Button>
            ) : (
              /* FAB de áudio quando não há texto */
              <Button
                onClick={() => setShowAudioRecorder(true)}
                disabled={disabled}
                className={`h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl text-white ${
                  mode === 'note' 
                    ? 'bg-[#E8B931] hover:bg-[#D4A728]' 
                    : 'bg-[#2D61E0] hover:bg-blue-700'
                }`}
                title="Gravar áudio"
              >
                <Mic className="h-6 w-6" />
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

      {/* TODO: Quando appendAgentSignature === true, concatenar - {agentName} ao final da mensagem APENAS no canal WhatsApp no momento do envio. Não afeta o ChatArea. Implementação futura. */}
    </div>
  );
});

MessageInput.displayName = 'MessageInput';