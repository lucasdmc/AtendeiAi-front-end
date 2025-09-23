import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { conversationKeys } from './useConversations';
import { messageKeys } from './useMessages';
import { useToast } from '@/components/ui/use-toast';

interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
}

export const useRealtime = (clinicId: string, options?: {
  onMessageReceived?: (message: any, conversation: any) => void;
}) => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!clinicId) return;

    const connectSSE = () => {
      // Fechar conexão anterior se existir
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('🔌 Conectando ao SSE para clínica:', clinicId);
      const sseUrl = `/api/v1/events/subscribe?clinic_id=${clinicId}`;
      console.log('🔗 URL SSE:', sseUrl);

      // Criar nova conexão SSE
      const eventSource = new EventSource(sseUrl);

      eventSourceRef.current = eventSource;

      console.log('📡 EventSource criado. ReadyState:', eventSource.readyState);
      console.log('📡 EventSource URL:', eventSource.url);

      // Listener genérico para todos os eventos
      eventSource.addEventListener('open', () => {
        console.log('🚪 SSE connection opened');
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
          const eventData: RealtimeEvent = JSON.parse((event as any).data);
          console.log('📨 Nova mensagem recebida via SSE - parsed:', eventData);

          const { message, conversation } = eventData.data;
          console.log('📨 Detalhes da mensagem:', { message, conversation });

          // Verificar se é uma mensagem enviada pelo próprio usuário (evitar duplicação)
          if (message.sender_type === 'human' || message.sender_type === 'bot') {
            console.log('⏭️ SSE: Ignorando mensagem enviada pelo próprio sistema para evitar duplicação:', {
              content: message.content,
              sender_type: message.sender_type
            });
            return;
          }

          // Log específico para mensagens de texto
          if (message.message_type === 'text') {
            console.log('💬 SSE: Mensagem de TEXTO recebida no frontend:', {
              content: message.content,
              messageId: message.message_id,
              sender_type: message.sender_type
            });
          }

          // Chamar callback opcional para atualização direta
          if (options?.onMessageReceived) {
            console.log('🔄 Chamando callback onMessageReceived');
            options.onMessageReceived(message, conversation);
          }

          // Se for evento de conversa atualizada, também invalidar cache
          if (event.event === 'conversationUpdated') {
            console.log('🔄 Recebido evento conversationUpdated, invalidando cache...');
          }

          // Invalidar cache de conversas
          console.log('🔄 Invalidando cache de conversas...');
          const conversationsInvalidated = queryClient.invalidateQueries({
            queryKey: conversationKeys.lists(),
          });
          console.log('✅ Cache de conversas invalidado:', conversationsInvalidated);

          // Invalidar cache da conversa específica
          if (conversation?._id) {
            console.log('🔄 Invalidando cache da conversa específica:', conversation._id);
            const detailInvalidated = queryClient.invalidateQueries({
              queryKey: conversationKeys.detail(conversation._id),
            });
            console.log('✅ Cache da conversa específica invalidado:', detailInvalidated);
          }

          // Invalidar cache de mensagens da conversa
          if (conversation?._id) {
            console.log('🔄 Invalidando cache de mensagens da conversa:', conversation._id);
            const messagesInvalidated = queryClient.invalidateQueries({
              queryKey: messageKeys.list(conversation._id),
            });
            console.log('✅ Cache de mensagens invalidado:', messagesInvalidated);
          }

          // Forçar refetch das queries
          console.log('🔄 Forçando refetch das queries...');
          if (conversation?._id) {
            queryClient.refetchQueries({
              queryKey: conversationKeys.lists(),
            });
            queryClient.refetchQueries({
              queryKey: conversationKeys.detail(conversation._id),
            });
            queryClient.refetchQueries({
              queryKey: messageKeys.list(conversation._id),
            });
          }

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
        console.error('❌ Event details:', {
          type: event.type,
          target: event.target,
          currentTarget: event.currentTarget,
          timeStamp: event.timeStamp
        });

        // Verificar se é um erro de rede ou se a conexão foi fechada
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔌 SSE connection closed, attempting reconnect...');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('🔌 SSE connecting...');
        }

        // Tentar reconectar após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Tentando reconectar ao SSE...');
          connectSSE();
        }, 5000);
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
      if (eventSourceRef.current) {
        console.log('🔌 Estado antes de fechar:', {
          readyState: eventSourceRef.current.readyState,
          url: eventSourceRef.current.url,
          clinicId: clinicId
        });
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('🔌 Conexão SSE fechada');
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [clinicId, queryClient, toast]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  };
};
