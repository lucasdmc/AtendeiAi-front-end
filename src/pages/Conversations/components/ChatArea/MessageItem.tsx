import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { Check, CheckCheck, ChevronDown, UserCheck } from 'lucide-react';
import { MessageItemProps } from '../../types';
import { formatTime, formatGroupSender } from '../../utils';
import { AudioPlayer } from './AudioPlayer';
import { ScheduledMessageBadge } from './ScheduledMessageBadge';
import { useAuth } from '../../../../contexts/AuthContext';

export const MessageItem: React.FC<MessageItemProps> = React.memo(({
  message,
  conversation,
  onMenuClick
}) => {
  const { attendant } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isInbound = message.sender_type === 'customer'; // Mensagem recebida (lado esquerdo)
  const isOutbound = message.sender_type === 'bot' || message.sender_type === 'human'; // Mensagem enviada (lado direito)
  const isSystemMessage = message.sender_type === 'system'; // Mensagem do sistema
  
  // ID do usuário logado
  const currentUserId = attendant?.id || 'current-user';
  
  // Verifica se a mensagem foi enviada pelo usuário logado
  const isFromCurrentUser = message.sender_id === currentUserId;
  
  // Mock de dados dos atendentes - em produção viria da API
  const getAgentInfo = (senderId?: string) => {
    const agents = {
      'agent-1': { name: 'João Silva', avatar: null },
      'agent-2': { name: 'Maria Santos', avatar: '/avatars/maria.jpg' },
      'agent-3': { name: 'Pedro Costa', avatar: '/avatars/pedro.jpg' },
      'marcos-id': { name: 'Marcos', avatar: null },
      'paulo-id': { name: 'PauloRobertoBJunior', avatar: null },
    };
    
    return senderId ? agents[senderId as keyof typeof agents] : null;
  };
  
  // Gera iniciais do nome para o avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0).toUpperCase())
      .join('');
  };

  // Renderiza status da mensagem (apenas para mensagens enviadas)
  const renderMessageStatus = () => {
    if (!isOutbound) return null;

    return (
      <div className="group-hover:hidden">
        {message.status === 'read' ? (
          <CheckCheck className="h-3 w-3 text-blue-200" />
        ) : message.status === 'delivered' ? (
          <CheckCheck className="h-3 w-3 text-gray-400" />
        ) : (
          <Check className="h-3 w-3 text-gray-400" />
        )}
      </div>
    );
  };

  // Renderiza botão do menu (para mensagens enviadas e recebidas)
  const renderMenuButton = () => {
    return (
      <Button
        className={`hidden group-hover:block p-0.5 rounded transition-colors ${
          isOutbound 
            ? 'hover:bg-pink-600' 
            : 'hover:bg-gray-200'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(message._id, e);
        }}
        data-message-menu-trigger
        variant="ghost"
        size="sm"
      >
        <ChevronDown className={`h-3 w-3 ${
          isOutbound ? 'text-white' : 'text-gray-600'
        }`} />
      </Button>
    );
  };

  // Renderiza avatar (para mensagens recebidas e enviadas por outros atendentes)
  const renderAvatar = () => {
    if (isInbound) {
      // Avatar do cliente (mensagens recebidas)
      return (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={`text-white text-xs bg-blue-500`}>
            <UserCheck className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      );
    } else if (isOutbound && !isFromCurrentUser && message.sender_type === 'human') {
      // Avatar do atendente (mensagens enviadas por outros atendentes)
      const agentInfo = getAgentInfo(message.sender_id);
      
      if (!agentInfo) return null;
      
      return (
        <div className="relative">
          <Avatar 
            className="h-8 w-8 flex-shrink-0 cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {agentInfo.avatar ? (
              <AvatarImage src={agentInfo.avatar} alt={agentInfo.name} />
            ) : null}
            <AvatarFallback className="text-white text-xs bg-green-500">
              {getInitials(agentInfo.name)}
            </AvatarFallback>
          </Avatar>
          
          {/* Tooltip com nome do atendente */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
              {agentInfo.name}
              <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className={`flex ${isSystemMessage ? 'justify-center' : isOutbound ? 'justify-end' : 'justify-start'} mb-4`}
      data-message-id={message._id}
    >
      {isSystemMessage ? (
        // Mensagem do sistema (centralizada)
        <div className="px-3 py-2 rounded-lg shadow-sm max-w-[80%]" style={{ backgroundColor: '#FFF8E1' }}>
          <p className="text-sm text-center" style={{ color: '#2E2E2E' }}>
            {message.content}
          </p>
          <div className="flex justify-center mt-1">
            <span className="text-xs" style={{ color: '#A3A3A3' }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      ) : (
        <div className={`flex items-end space-x-2 max-w-[70%] group relative ${isInbound ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Avatar para mensagens recebidas e enviadas por outros atendentes */}
          {(isInbound || (isOutbound && !isFromCurrentUser && message.sender_type === 'human')) && renderAvatar()}

          {/* Conteúdo da mensagem */}
          <div className={`px-3 py-2 rounded-lg shadow-sm relative ${
            isOutbound
              ? 'rounded-br-none text-white' 
              : 'rounded-bl-none border'
          }`}
          style={{
            backgroundColor: isOutbound ? '#F4FDE6' : '#FFFFFF',
            color: '#2E2E2E'
          }}>
          {/* Informações do remetente para grupos (apenas mensagens recebidas) */}
          {isInbound && conversation?.conversation_type === 'group' && (
            <div className="mb-2 pb-1 border-b border-gray-200">
              <span className="text-xs font-medium text-blue-600">
                {formatGroupSender(message.sender_name, message.sender_phone)}
              </span>
            </div>
          )}

              {/* Debug: Log do tipo de mensagem */}
              {(() => {
                console.log('🔍 MessageItem Debug:', {
                  messageId: message._id,
                  message_type: message.message_type,
                  content: message.content?.substring(0, 50),
                  hasMediaUrl: !!message.media_url,
                  media_url: message.media_url,
                  media_mime_type: message.media_mime_type,
                  sender_type: message.sender_type,
                  isInbound: message.sender_type === 'customer',
                  isOutbound: message.sender_type === 'bot' || message.sender_type === 'human',
                  whatsapp_message: (message as any).whatsapp_message,
                  // Debug para grupos
                  isGroup: conversation?.conversation_type === 'group',
                  senderName: message.sender_name,
                  senderPhone: message.sender_phone,
                  formattedSender: formatGroupSender(message.sender_name, message.sender_phone)
                });

                // Debug específico para mensagens outbound
                if (message.sender_type === 'human') {
                  console.log('🔵 DEBUG MENSAGEM OUTBOUND (HUMAN):', {
                    messageId: message._id,
                    sender_type: message.sender_type,
                    content: message.content,
                    isOutbound: isOutbound,
                    willRender: true
                  });
                }

                // Debug específico para vídeo
                if (message.message_type === 'video') {
                  console.log('🎥 Debug específico para vídeo:', {
                    messageId: message._id,
                    media_url: message.media_url,
                    directUrl: message.media_url ? `${message.media_url}?t=${Date.now()}` : null,
                    media_mime_type: message.media_mime_type,
                    willRenderVideo: message.message_type === 'video' && message.media_url
                  });
                }

                return null;
              })()}

          {/* Renderizar imagem se for mensagem de imagem */}
          {message.message_type === 'image' && message.media_url ? (
            <div className="space-y-2">
              {(() => {
                // Usar URL direta da imagem pois o Vite proxy roteia /media para o backend
                const directImageUrl = `${message.media_url}?t=${Date.now()}`;

                return (
                  <img
                    src={directImageUrl}
                    alt={message.media_filename || 'Imagem recebida'}
                    className="max-w-full rounded-lg shadow-sm"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                    onLoad={() => console.log('✅ Imagem carregada com sucesso:', directImageUrl)}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem:', {
                        url: directImageUrl,
                        media_url: message.media_url,
                        target: e.target,
                        currentTarget: e.currentTarget
                      });
                      // Fallback para mostrar texto se imagem não carregar
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLElement).nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'block';
                    }}
                  />
                );
              })()}
              {/* Fallback text (inicialmente hidden) */}
              <p className="text-sm whitespace-pre-wrap break-words hidden">
                📷 Imagem
              </p>
            </div>
          ) : message.message_type === 'video' && message.media_url ? (
            <div className="space-y-2">
              {(() => {
                // Usar URL direta da mídia pois o Vite proxy roteia /media para o backend
                const directVideoUrl = `${message.media_url}?t=${Date.now()}`;

                console.log('🎬 Renderizando vídeo:', {
                  messageId: message._id,
                  directVideoUrl,
                  media_mime_type: message.media_mime_type
                });

                return (
                  <video
                    controls
                    className="max-w-full rounded-lg shadow-sm"
                    style={{ maxHeight: '300px' }}
                    onLoadStart={() => console.log('⏳ Vídeo começou a carregar:', directVideoUrl)}
                    onLoadedData={() => console.log('✅ Vídeo carregado com sucesso:', directVideoUrl)}
                    onLoadedMetadata={() => console.log('📊 Metadados do vídeo carregados:', directVideoUrl)}
                    onCanPlay={() => console.log('▶️ Vídeo pronto para reprodução:', directVideoUrl)}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar vídeo:', {
                        url: directVideoUrl,
                        media_url: message.media_url,
                        media_mime_type: message.media_mime_type,
                        error: (e.target as HTMLVideoElement)?.error,
                        networkState: (e.target as HTMLVideoElement)?.networkState,
                        readyState: (e.target as HTMLVideoElement)?.readyState,
                        target: e.target,
                        currentTarget: e.currentTarget
                      });
                      // Fallback para mostrar texto se vídeo não carregar
                      (e.target as HTMLVideoElement).style.display = 'none';
                      const fallback = (e.target as HTMLElement).nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'block';
                    }}
                  >
                    <source src={directVideoUrl} type={message.media_mime_type || 'video/mp4'} />
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                );
              })()}
              {/* Fallback text (inicialmente hidden) */}
              <p className="text-sm whitespace-pre-wrap break-words hidden">
                🎥 Vídeo
              </p>
            </div>
          ) : message.message_type === 'audio' && message.media_url ? (
            <div className="space-y-2">
              {(() => {
                // Usar URL direta da mídia pois o Vite proxy roteia /media para o backend
                const directAudioUrl = `${message.media_url}?t=${Date.now()}`;

                return (
                  <AudioPlayer
                    audioUrl={directAudioUrl}
                    isOutbound={isOutbound}
                    messageId={message._id}
                    conversation={conversation}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar áudio:', {
                        url: directAudioUrl,
                        media_url: message.media_url,
                        media_mime_type: message.media_mime_type,
                        error: e
                      });
                    }}
                  />
                );
              })()}
              {/* Fallback text (inicialmente hidden) */}
              <p className="text-sm whitespace-pre-wrap break-words hidden">
                🎵 Áudio
              </p>
            </div>
          ) : message.message_type === 'document' && message.media_url ? (
            <div className="space-y-2">
              {(() => {
                // Usar URL direta da mídia pois o Vite proxy roteia /media para o backend
                const directDocumentUrl = `${message.media_url}?t=${Date.now()}`;

                return (
                  <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {message.media_filename || 'Documento'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {message.media_mime_type || 'Arquivo'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <a
                          href={directDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                          onClick={() => console.log('📥 Documento baixado:', directDocumentUrl)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Baixar
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Conteúdo da mensagem de texto */
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          )}

          {/* Mostrar legenda se existir */}
          {message.media && message.media.caption && (
            <p className="text-sm whitespace-pre-wrap break-words mt-2 pt-2 border-t border-gray-200">
              {message.media.caption}
            </p>
          )}

          {/* Badge de mensagem agendada */}
          {(message as any).scheduled_at && (message as any).status === 'scheduled' && (
            <div className="mt-2">
              <ScheduledMessageBadge
                scheduleDate={(message as any).scheduled_date || new Date((message as any).scheduled_at).toISOString().split('T')[0]}
                scheduleTime={(message as any).scheduled_time || new Date((message as any).scheduled_at).toTimeString().slice(0, 5)}
                recurrence={(message as any).recurrence}
                onEdit={() => {
                  console.log('Editar agendamento da mensagem:', message._id);
                  // TODO: Implementar edição de agendamento
                }}
                onCancel={() => {
                  console.log('Cancelar agendamento da mensagem:', message._id);
                  // TODO: Implementar cancelamento de agendamento
                }}
              />
            </div>
          )}

          {/* Footer com horário e status/menu */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-70" style={{ color: '#A3A3A3' }}>
              {formatTime(message.timestamp)}
            </span>
            
            {/* Status da mensagem ou botão do menu */}
            {isOutbound ? (
              <>
                {renderMessageStatus()}
                {renderMenuButton()}
              </>
            ) : (
              /* Botão do menu para mensagens recebidas */
              renderMenuButton()
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
});
