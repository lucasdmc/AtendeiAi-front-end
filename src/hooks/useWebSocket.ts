import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Interfaces
interface WebSocketConfig {
  url?: string;
  clinicId?: string;
  userId?: string;
  roomId?: string;
  roomType?: 'clinic' | 'conversation' | 'user';
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnected?: Date;
  reconnectAttempts: number;
}

/**
 * Hook para gerenciar conexão WebSocket com Socket.io
 */
export function useWebSocket(config: WebSocketConfig) {
  const {
    url = import.meta.env.VITE_WS_URL || 'http://localhost:3000',
    clinicId,
    userId,
    roomId,
    roomType = 'clinic',
    autoConnect = true,
    reconnectAttempts: maxReconnectAttempts = 5,
    reconnectDelay = 1000
  } = config;
  
  // Estado da conexão
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    error: null,
    reconnectAttempts: 0
  });
  
  // Referência para o socket
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  // Função para conectar
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }
    
    setStatus(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));
    
    try {
      // Criar nova instância do socket
      const socket = io(url, {
        query: {
          clinicId: clinicId || roomId,
          userId: userId || 'anonymous',
          roomType
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      
      // Evento: Conectado
      socket.on('connect', () => {
        console.log('🔌 WebSocket conectado');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          error: null,
          lastConnected: new Date(),
          reconnectAttempts: 0
        }));
        reconnectAttemptsRef.current = 0;
        
        // Join room baseado no tipo
        if (roomId && roomType) {
          const eventName = `join_${roomType}`;
          socket.emit(eventName, roomId);
          console.log(`🔌 Joined ${roomType} room: ${roomId}`);
        }
      });
      
      // Evento: Desconectado
      socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket desconectado:', reason);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          isReconnecting: reason === 'io server disconnect' || reason === 'io client disconnect'
        }));
      });
      
      // Evento: Erro de conexão
      socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão WebSocket:', error);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error.message || 'Erro de conexão'
        }));
        
        // Tentar reconectar se não excedeu o limite
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });
      
      // Evento: Reconexão
      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebSocket reconectado após', attemptNumber, 'tentativas');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isReconnecting: false,
          error: null,
          lastConnected: new Date()
        }));
        reconnectAttemptsRef.current = 0;
      });
      
      // Evento: Tentativa de reconexão
      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Tentativa de reconexão:', attemptNumber);
        setStatus(prev => ({
          ...prev,
          isReconnecting: true,
          reconnectAttempts: attemptNumber
        }));
        reconnectAttemptsRef.current = attemptNumber;
      });
      
      // Evento: Falha na reconexão
      socket.on('reconnect_failed', () => {
        console.error('❌ Falha na reconexão WebSocket');
        setStatus(prev => ({
          ...prev,
          isReconnecting: false,
          error: 'Falha na reconexão'
        }));
      });
      
      // Evento: Ping/Pong para manter conexão viva
      socket.on('ping', () => {
        socket.emit('pong');
      });
      
      // Evento: Pong recebido
      socket.on('pong', (_) => {
        // Conexão está viva
      });
      
      // Evento: Erro genérico
      socket.on('error', (error) => {
        console.error('❌ Erro WebSocket:', error);
        setStatus(prev => ({
          ...prev,
          error: error.message || 'Erro desconhecido'
        }));
      });
      
      socketRef.current = socket;
      
    } catch (error) {
      console.error('❌ Erro ao criar conexão WebSocket:', error);
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, [url, clinicId, userId, maxReconnectAttempts]);
  
  // Função para desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      reconnectAttempts: 0
    }));
    
    reconnectAttemptsRef.current = 0;
  }, []);
  
  // Função para agendar reconexão
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        connect();
      }
    }, delay);
  }, [connect, reconnectDelay, maxReconnectAttempts]);
  
  // Função para emitir evento
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Tentativa de emitir evento sem conexão WebSocket');
    }
  }, []);
  
  // Função para escutar evento
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);
  
  // Função para parar de escutar evento
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);
  
  // Função para reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);
  
  // Conectar automaticamente quando o hook é montado
  useEffect(() => {
    if (autoConnect && clinicId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, clinicId, connect, disconnect]);
  
  // Reconectar quando clinicId ou userId mudarem
  useEffect(() => {
    if (socketRef.current?.connected) {
      reconnect();
    }
  }, [clinicId, userId, reconnect]);
  
  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    // Socket instance
    socket: socketRef.current,
    
    // Status da conexão
    isConnected: status.isConnected,
    isConnecting: status.isConnecting,
    isReconnecting: status.isReconnecting,
    error: status.error,
    lastConnected: status.lastConnected,
    reconnectAttempts: status.reconnectAttempts,
    
    // Ações
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
    
    // Utilitários
    canEmit: status.isConnected,
    connectionStatus: status
  };
}
