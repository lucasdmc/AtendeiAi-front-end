import { io, Socket } from 'socket.io-client';

// Interfaces
interface WebSocketConfig {
  url?: string;
  institutionId: string;
  userId?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface WebSocketEvents {
  // Eventos de conexão
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect_failed': () => void;
  
  // Eventos de conversa
  'conversation_created': (data: { conversation: any }) => void;
  'conversation_updated': (data: { conversationId: string; updates: any }) => void;
  'conversation_assigned': (data: { conversationId: string; agentId: string; agentName: string }) => void;
  'conversation_transferred': (data: { conversationId: string; fromAgentId: string; toAgentId: string; reason?: string }) => void;
  'conversation_closed': (data: { conversationId: string; closedBy: string; reason?: string }) => void;
  'conversation_archived': (data: { conversationId: string; archivedBy: string }) => void;
  'conversation_flagged': (data: { conversationId: string; flagId: string; appliedBy: string }) => void;
  'conversation_unflagged': (data: { conversationId: string; flagId: string; removedBy: string }) => void;
  
  // Eventos de mensagem
  'message_received': (data: { conversationId: string; message: any }) => void;
  'message_sent': (data: { conversationId: string; message: any }) => void;
  'message_updated': (data: { conversationId: string; messageId: string; updates: any }) => void;
  'message_deleted': (data: { conversationId: string; messageId: string }) => void;
  
  // Eventos de status
  'typing_start': (data: { conversationId: string; userId: string; userName: string }) => void;
  'typing_stop': (data: { conversationId: string; userId: string }) => void;
  'online_status': (data: { userId: string; isOnline: boolean; lastSeen?: Date }) => void;
  
  // Eventos de sessão
  'session_started': (data: { conversationId: string; sessionId: string; agentId: string }) => void;
  'session_ended': (data: { conversationId: string; sessionId: string; agentId: string; reason?: string }) => void;
  'phoneConflict': (data: { 
    sessionId: string; 
    phoneNumber: string; 
    error: string;
    existingSession?: any;
    existingChannel?: any;
    existingInstitution?: any;
  }) => void;
  
  // Eventos de notificação
  'notification': (data: { type: 'info' | 'success' | 'warning' | 'error'; title: string; message: string }) => void;
  'counters_updated': (data: { counters: any }) => void;
  
  // Eventos de usuário
  'user_joined': (data: { userId: string; institutionId: string; timestamp: Date }) => void;
  'user_left': (data: { userId: string; institutionId: string; timestamp: Date }) => void;
  'user_disconnected': (data: { userId: string; institutionId: string; timestamp: Date }) => void;
  
  // Eventos de sistema
  'ping': () => void;
  'pong': (data: { timestamp: Date }) => void;
  'error': (error: Error) => void;
}

/**
 * Serviço para gerenciar conexão WebSocket
 */
export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private connectionStatus: {
    isConnected: boolean;
    isConnecting: boolean;
    isReconnecting: boolean;
    error: string | null;
    lastConnected?: Date;
    reconnectAttempts: number;
  } = {
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    error: null,
    reconnectAttempts: 0
  };
  
  constructor(config: WebSocketConfig) {
    this.config = {
      url: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
      autoConnect: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      ...config
    };
    
    if (this.config.autoConnect) {
      this.connect();
    }
  }
  
  /**
   * Conectar ao WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }
    
    this.connectionStatus.isConnecting = true;
    this.connectionStatus.error = null;
    
    try {
      this.socket = io(this.config.url!, {
        query: {
          institutionId: this.config.institutionId,
          userId: this.config.userId || 'anonymous'
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.error = error instanceof Error ? error.message : 'Erro desconhecido';
    }
  }
  
  /**
   * Desconectar do WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionStatus = {
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      error: null,
      reconnectAttempts: 0
    };
    
    this.eventListeners.clear();
  }
  
  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Evento: Conectado
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      this.connectionStatus.isConnected = true;
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.isReconnecting = false;
      this.connectionStatus.error = null;
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.reconnectAttempts = 0;
      
      this.emit('connect');
    });
    
    // Evento: Desconectado
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.isReconnecting = reason === 'io server disconnect' || reason === 'io client disconnect';
      
      this.emit('disconnect', reason);
    });
    
    // Evento: Erro de conexão
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.error = error.message || 'Erro de conexão';
      
      this.emit('connect_error', error);
    });
    
    // Evento: Reconexão
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconectado após', attemptNumber, 'tentativas');
      this.connectionStatus.isConnected = true;
      this.connectionStatus.isReconnecting = false;
      this.connectionStatus.error = null;
      this.connectionStatus.lastConnected = new Date();
      
      this.emit('reconnect', attemptNumber);
    });
    
    // Evento: Tentativa de reconexão
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Tentativa de reconexão:', attemptNumber);
      this.connectionStatus.isReconnecting = true;
      this.connectionStatus.reconnectAttempts = attemptNumber;
      
      this.emit('reconnect_attempt', attemptNumber);
    });
    
    // Evento: Falha na reconexão
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Falha na reconexão WebSocket');
      this.connectionStatus.isReconnecting = false;
      this.connectionStatus.error = 'Falha na reconexão';
      
      this.emit('reconnect_failed');
    });
    
    // Evento: Ping/Pong para manter conexão viva
    this.socket.on('ping', () => {
      this.socket?.emit('pong');
    });
    
    this.socket.on('pong', (data) => {
      this.emit('pong', data);
    });
    
    // Evento: Erro genérico
    this.socket.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
      this.connectionStatus.error = error.message || 'Erro desconhecido';
      
      this.emit('error', error);
    });
    
    // Eventos de conversa
    this.socket.on('conversation_created', (data) => this.emit('conversation_created', data));
    this.socket.on('conversation_updated', (data) => this.emit('conversation_updated', data));
    this.socket.on('conversation_assigned', (data) => this.emit('conversation_assigned', data));
    this.socket.on('conversation_transferred', (data) => this.emit('conversation_transferred', data));
    this.socket.on('conversation_closed', (data) => this.emit('conversation_closed', data));
    this.socket.on('conversation_archived', (data) => this.emit('conversation_archived', data));
    this.socket.on('conversation_flagged', (data) => this.emit('conversation_flagged', data));
    this.socket.on('conversation_unflagged', (data) => this.emit('conversation_unflagged', data));
    
    // Eventos de mensagem
    this.socket.on('message_received', (data) => this.emit('message_received', data));
    this.socket.on('message_sent', (data) => this.emit('message_sent', data));
    this.socket.on('message_updated', (data) => this.emit('message_updated', data));
    this.socket.on('message_deleted', (data) => this.emit('message_deleted', data));
    
    // Eventos de status
    this.socket.on('typing_start', (data) => this.emit('typing_start', data));
    this.socket.on('typing_stop', (data) => this.emit('typing_stop', data));
    this.socket.on('online_status', (data) => this.emit('online_status', data));
    
    // Eventos de sessão
    this.socket.on('session_started', (data) => this.emit('session_started', data));
    this.socket.on('session_ended', (data) => this.emit('session_ended', data));
    this.socket.on('phoneConflict', (data) => this.emit('phoneConflict', data));
    
    // Eventos de notificação
    this.socket.on('notification', (data) => this.emit('notification', data));
    this.socket.on('counters_updated', (data) => this.emit('counters_updated', data));
    
    // Eventos de usuário
    this.socket.on('user_joined', (data) => this.emit('user_joined', data));
    this.socket.on('user_left', (data) => this.emit('user_left', data));
    this.socket.on('user_disconnected', (data) => this.emit('user_disconnected', data));
  }
  
  /**
   * Emitir evento
   */
  emit<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Erro ao executar listener para evento ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Escutar evento
   */
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }
  
  /**
   * Parar de escutar evento
   */
  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      if (callback) {
        listeners.delete(callback);
      } else {
        listeners.clear();
      }
    }
  }
  
  /**
   * Enviar evento para o servidor
   */
  send<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>): void {
    if (this.socket?.connected) {
      this.socket.emit(event as string, ...args);
    } else {
      console.warn('⚠️ Tentativa de enviar evento sem conexão WebSocket');
    }
  }
  
  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
  
  /**
   * Obter status da conexão
   */
  getConnectionStatus() {
    return { ...this.connectionStatus };
  }
  
  /**
   * Verificar se está conectado
   */
  isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }
  
  /**
   * Obter instância do socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }
  
  /**
   * Atualizar configuração
   */
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reconectar se institutionId ou userId mudaram
    if (newConfig.institutionId || newConfig.userId) {
      this.reconnect();
    }
  }
}

// Instância singleton do serviço
let webSocketServiceInstance: WebSocketService | null = null;

export function createWebSocketService(config: WebSocketConfig): WebSocketService {
  if (webSocketServiceInstance) {
    webSocketServiceInstance.updateConfig(config);
    return webSocketServiceInstance;
  }
  
  webSocketServiceInstance = new WebSocketService(config);
  return webSocketServiceInstance;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketServiceInstance;
}

export function destroyWebSocketService(): void {
  if (webSocketServiceInstance) {
    webSocketServiceInstance.disconnect();
    webSocketServiceInstance = null;
  }
}
