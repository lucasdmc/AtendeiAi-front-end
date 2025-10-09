import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// import { messageKeys } from './useMessages'; // Removido pois não está sendo usado
import { useToast } from '@/components/ui/use-toast';

// Interface removida pois não está sendo usada
// interface RealtimeEvent {
//   event: string;
//   data: any;
//   timestamp: string;
// }

export const useRealtime = (institutionId: string, options?: {
  onMessageReceived?: (message: any, conversation: any) => void;
}) => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!institutionId) return;

    const connectSSE = () => {
      // Evitar múltiplas conexões simultâneas
      if (isConnectingRef.current) {
        console.log('🔌 Já conectando, ignorando nova tentativa');
        return;
      }

      isConnectingRef.current = true;

      // Fechar conexão anterior se existir
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      console.log('🔌 Conectando ao SSE para instituição:', institutionId);
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';
      const sseUrl = `${backendUrl}/api/v1/events/subscribe?institution_id=${institutionId}`;
      console.log('🔗 URL SSE:', sseUrl);
      console.log('🔗 Backend URL:', backendUrl);

      // Criar nova conexão SSE
      const eventSource = new EventSource(sseUrl);

      eventSourceRef.current = eventSource;

      console.log('📡 EventSource criado. ReadyState:', eventSource.readyState);
      console.log('📡 EventSource URL:', eventSource.url);

      // Listener genérico para todos os eventos
      eventSource.addEventListener('open', () => {
        console.log('🚪 SSE connection opened');
        console.log('🚪 EventSource state after open:', {
          readyState: eventSource.readyState,
          url: eventSource.url,
          withCredentials: eventSource.withCredentials
        });
        setIsConnected(true);
        setReconnectAttempts(0); // Reset tentativas quando conectar com sucesso
        isConnectingRef.current = false; // Reset flag de conexão
      });

      eventSource.addEventListener('message', (event) => {
        console.log('📨 SSE generic message received:', event.data);
      });

      // Evento de conexão estabelecida
      eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse((event as any).data);
        console.log('✅ SSE conectado:', data);
        toast({
          title: 'Conectado',
          description: 'Notificações em tempo real ativadas',
        });
      });

      // Evento de nova mensagem
      eventSource.addEventListener('messageReceived', (event) => {
        console.log('🎯 SSE Evento messageReceived recebido!');
        console.log('🎯 Dados brutos do evento:', (event as any).data);

        try {
          const eventData = JSON.parse((event as any).data);
          console.log('📨 Nova mensagem recebida via SSE - parsed:', eventData);

          // ✅ CORREÇÃO: O backend envia { event, data: { message, conversation } }
          const { message, conversation } = eventData.data || {};
          console.log('📨 Detalhes da mensagem:', { message, conversation });

          // Verificar se message existe antes de acessar suas propriedades
          if (!message) {
            console.log('⚠️ SSE: Mensagem não encontrada no evento, ignorando');
            return;
          }

          // ✅ CORREÇÃO: Permitir todas as mensagens para atualizar lista de conversas
          // Mensagens outbound agora têm a conversa correta e devem atualizar a lista
          console.log('✅ SSE: Processando mensagem:', {
            content: message.content?.substring(0, 30),
            sender_type: message.sender_type,
            direction: message.direction,
            conversationId: conversation._id
          });

          // Log do sender_type para debug
          console.log('🔍 SSE: Processando mensagem com sender_type:', message.sender_type);

          // Log específico para mensagens de texto
          if (message.message_type === 'text') {
            console.log('💬 SSE: Mensagem de TEXTO recebida no frontend:', {
              content: message.content,
              messageId: message.message_id,
              sender_type: message.sender_type
            });
          }

          // Verificar se conversation existe antes de chamar callback
          if (!conversation) {
            console.log('⚠️ SSE: Conversa não encontrada no evento, ignorando');
            return;
          }

          // Chamar callback opcional para atualização direta
          if (options?.onMessageReceived) {
            console.log('🔄 Chamando callback onMessageReceived');
            options.onMessageReceived(message, conversation);
          }

          // Se for evento de conversa atualizada, também invalidar cache
          if (event.type === 'conversationUpdated') {
            console.log('🔄 Recebido evento conversationUpdated, invalidando cache...');
          }

          // ✅ CORREÇÃO: Atualizar cache diretamente em vez de apenas invalidar
          console.log('🔄 Atualizando cache de conversas diretamente...');
          
          // Atualizar cache da lista de conversas diretamente
          queryClient.setQueriesData(
            { queryKey: ['conversations'] },
            (oldData: any) => {
              // Para useInfiniteQuery, os dados estão em pages
              if (!oldData?.pages) {
                console.log('⚠️ Dados antigos de conversas não encontrados (infinite query)');
                return oldData;
              }
              
              console.log('🔄 Atualizando conversa na lista (infinite query):', {
                conversationId: conversation._id,
                totalPages: oldData.pages.length,
                messageTimestamp: message.timestamp
              });
              
              // Procurar a conversa em todas as páginas
              let updated = false;
              const updatedPages = oldData.pages.map((page: any) => {
                if (!page.conversations) return page;
                
                const conversationIndex = page.conversations.findIndex((conv: any) => conv._id === conversation._id);
                
                if (conversationIndex >= 0) {
                  const existingConv = page.conversations[conversationIndex];
                  
                  // ✅ CORREÇÃO: Verificar se a mensagem é mais recente
                  const existingTimestamp = new Date(existingConv.last_message?.timestamp || existingConv.updated_at || 0);
                  const newTimestamp = new Date(message.timestamp);
                  
                  if (newTimestamp <= existingTimestamp) {
                    console.log('⏭️ Mensagem mais antiga que a existente, ignorando atualização:', {
                      existing: existingTimestamp.toISOString(),
                      new: newTimestamp.toISOString()
                    });
                    return page;
                  }
                  
                  // Atualizar conversa existente
                  const updatedConversations = [...page.conversations];
                  updatedConversations[conversationIndex] = {
                    ...updatedConversations[conversationIndex],
                    last_message: {
                      content: message.content,
                      timestamp: message.timestamp,
                      sender_type: message.sender_type,
                    },
                    updated_at: message.timestamp,
                    unread_count: message.sender_type === 'customer' 
                      ? (updatedConversations[conversationIndex].unread_count || 0) + 1 
                      : updatedConversations[conversationIndex].unread_count
                  };
                  
                  console.log('✅ Conversa atualizada na página:', conversationIndex, {
                    newContent: message.content,
                    newTimestamp: message.timestamp
                  });
                  
                  updated = true;
                  return {
                    ...page,
                    conversations: updatedConversations
                  };
                }
                
                return page;
              });
              
              if (!updated) {
                console.log('⚠️ Conversa não encontrada nas páginas para atualização');
                // Se não encontrou, adicionar na primeira página
                if (oldData.pages[0]?.conversations) {
                  const firstPage = {
                    ...oldData.pages[0],
                    conversations: [conversation, ...oldData.pages[0].conversations]
                  };
                  return {
                    ...oldData,
                    pages: [firstPage, ...oldData.pages.slice(1)]
                  };
                }
              }
              
              return {
                ...oldData,
                pages: updatedPages
              };
            }
          );
          
          // Também invalidar para garantir consistência
          console.log('🔄 Invalidando cache como backup...');
          queryClient.invalidateQueries({
            queryKey: ['conversations'], // Invalidar todas as queries de conversas
          });

          // Mostrar toast de nova mensagem
          console.log('🔔 Mostrando toast de nova mensagem');
          toast({
            title: 'Nova mensagem',
            description: `${message.from}: ${message.content?.substring(0, 50)}${message.content?.length > 50 ? '...' : ''}`,
          });

          console.log('✅ Processamento SSE concluído');

        } catch (error) {
          console.error('❌ Erro ao processar evento SSE:', error);
          console.error('❌ Dados que causaram erro:', (event as any).data);
        }
      });

      // Evento de mensagem agendada enviada
      eventSource.addEventListener('scheduledMessageSent', (event) => {
        console.log('📅 SSE Evento scheduledMessageSent recebido!');
        try {
          const eventData = JSON.parse(event.data);
          console.log('📅 Dados do evento scheduledMessageSent:', eventData);

          if (eventData.conversationId) {
            console.log('🔄 Invalidando cache de mensagens agendadas...');
            queryClient.invalidateQueries({ 
              queryKey: ['scheduled-messages', eventData.conversationId] 
            });
            
            console.log('🔄 Invalidando cache de mensagens normais...');
            queryClient.invalidateQueries({ 
              queryKey: ['messages', eventData.conversationId] 
            });
            
            console.log('✅ Mensagem agendada processada - caches invalidados');
          }
        } catch (error) {
          console.error('❌ Erro ao processar evento scheduledMessageSent:', error);
        }
      });

      // Evento de erro
      eventSource.addEventListener('error', (event) => {
        console.error('❌ Erro na conexão SSE:', event);
        console.error('❌ EventSource readyState:', eventSource.readyState);
        console.error('❌ EventSource URL:', eventSource.url);
        
        isConnectingRef.current = false; // Reset flag de conexão
        setIsConnected(false);
        console.error('❌ Event details:', {
          type: event.type,
          target: event.target,
          currentTarget: event.currentTarget,
          timeStamp: event.timeStamp
        });

        // ✅ ADICIONAR: Log detalhado do estado da conexão
        console.error('❌ Detalhes da desconexão SSE:', {
          readyState: eventSource.readyState,
          readyStateText: eventSource.readyState === 0 ? 'CONNECTING' : 
                         eventSource.readyState === 1 ? 'OPEN' : 
                         eventSource.readyState === 2 ? 'CLOSED' : 'UNKNOWN',
          url: eventSource.url,
          withCredentials: eventSource.withCredentials
        });

        // Verificar se é um erro de rede ou se a conexão foi fechada
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔌 SSE connection closed, attempting reconnect...');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('🔌 SSE connecting...');
        }

        // Tentar reconectar após delay progressivo (evitar loop infinito)
        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 30000); // Max 30s
        reconnectTimeoutRef.current = setTimeout(() => {
          if (reconnectAttempts < 5) { // Máximo 5 tentativas
            console.log(`🔄 Tentando reconectar ao SSE... (tentativa ${reconnectAttempts + 1}/5)`);
            setReconnectAttempts(prev => prev + 1);
            connectSSE();
          } else {
            console.log('❌ Máximo de tentativas de reconexão atingido. Parando reconexão automática.');
            setIsConnected(false);
          }
        }, delay);
      });

      // Evento de desconexão
      eventSource.addEventListener('close', () => {
        console.log('📡 SSE desconectado');
      });
    };

    connectSSE();

    // Cleanup function
    return () => {
      console.log('🔌 Limpando conexão SSE...');
      isConnectingRef.current = false; // Reset flag de conexão
      
      if (eventSourceRef.current) {
        console.log('🔌 Estado antes de fechar:', {
          readyState: eventSourceRef.current.readyState,
          url: eventSourceRef.current.url,
          institutionId: institutionId
        });
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('🔌 Conexão SSE fechada');
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [institutionId]); // Removendo queryClient e toast das dependências para evitar loop

  return {
    isConnected,
    reconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setReconnectAttempts(0); // Reset tentativas para reconexão manual
    },
    reconnectAttempts
  };
};
