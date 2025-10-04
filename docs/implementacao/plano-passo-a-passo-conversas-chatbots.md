# 🚀 Plano Passo a Passo - Conversas e Chatbots 100% Funcionais

## 📋 Objetivos

1. ✅ **Tela de Conversas** (`http://localhost:8080/conversations`) 100% funcional e integrada com backend
2. ✅ **Tela de Chatbots** (`http://localhost:8080/chatbot`) 100% funcional e integrada com backend  
3. ✅ **Editor de Fluxos** (`http://localhost:8080/settings/chatbots/editor`) 100% funcional e integrado com backend

## 🔍 Análise do Estado Atual

### **✅ O que já está funcionando:**
- **Frontend**: Componentes básicos implementados
- **UI/UX**: Interface visual completa
- **Navegação**: Rotas configuradas
- **Mock Data**: Dados de demonstração funcionando

### **❌ O que precisa ser implementado:**
- **Backend Integration**: APIs reais funcionando
- **Real-time Updates**: WebSocket para atualizações em tempo real
- **Data Persistence**: Salvar/carregar dados do backend
- **Error Handling**: Tratamento robusto de erros
- **Loading States**: Estados de carregamento adequados

## 🗓️ Cronograma de 3 Semanas

### **Semana 1: Backend Foundation**
**Objetivo**: Implementar APIs básicas e integração inicial

#### **Dia 1-2: APIs de Conversas**
- [ ] ✅ Implementar endpoints de conversas no backend
- [ ] ✅ Implementar endpoints de mensagens
- [ ] ✅ Implementar endpoints de sessões/atendimentos
- [ ] ✅ Testar APIs com Postman/Insomnia
- [ ] ✅ Documentar endpoints

#### **Dia 3-4: APIs de Chatbots**
- [ ] ✅ Implementar endpoints de chatbots
- [ ] ✅ Implementar endpoints de fluxos
- [ ] ✅ Implementar endpoints de canais
- [ ] ✅ Testar APIs com Postman/Insomnia
- [ ] ✅ Documentar endpoints

#### **Dia 5: Integração Frontend-Backend**
- [ ] ✅ Atualizar serviços frontend para usar APIs reais
- [ ] ✅ Implementar tratamento de erros
- [ ] ✅ Implementar loading states
- [ ] ✅ Testar integração básica

### **Semana 2: Funcionalidades Core**
**Objetivo**: Implementar funcionalidades principais

#### **Dia 1-2: Conversas - Funcionalidades Básicas**
- [ ] ✅ Listar conversas por aba
- [ ] ✅ Selecionar conversa
- [ ] ✅ Carregar mensagens
- [ ] ✅ Enviar mensagens
- [ ] ✅ Atualizar contadores

#### **Dia 3-4: Conversas - Funcionalidades Avançadas**
- [ ] ✅ Buscar conversas
- [ ] ✅ Filtrar por canal/setor
- [ ] ✅ Ações contextuais (atribuir, transferir, encerrar)
- [ ] ✅ Gerenciar tags/flags
- [ ] ✅ Agendar mensagens

#### **Dia 5: Chatbots - Funcionalidades Básicas**
- [ ] ✅ Listar chatbots
- [ ] ✅ Criar chatbot
- [ ] ✅ Editar chatbot
- [ ] ✅ Ativar/pausar chatbot
- [ ] ✅ Deletar chatbot

### **Semana 3: Editor e Refinamento**
**Objetivo**: Completar editor e polir funcionalidades

#### **Dia 1-2: Editor de Fluxos**
- [ ] ✅ Salvar fluxo no backend
- [ ] ✅ Carregar fluxo do backend
- [ ] ✅ Validar fluxo antes de salvar
- [ ] ✅ Implementar undo/redo persistente
- [ ] ✅ Exportar/importar fluxos

#### **Dia 3-4: Real-time e Otimizações**
- [ ] ✅ Implementar WebSocket para conversas
- [ ] ✅ Implementar WebSocket para chatbots
- [ ] ✅ Otimizar performance
- [ ] ✅ Implementar cache
- [ ] ✅ Testes de integração

#### **Dia 5: Testes e Deploy**
- [ ] ✅ Testes end-to-end
- [ ] ✅ Validação de funcionalidades
- [ ] ✅ Deploy em ambiente de teste
- [ ] ✅ Documentação final
- [ ] ✅ Deploy em produção

## 📋 Plano Detalhado por Funcionalidade

### **1. Tela de Conversas (`/conversations`)**

#### **1.1 APIs Necessárias (Backend)**
```typescript
// Endpoints de Conversas
GET    /api/v1/conversations                    // Listar conversas
GET    /api/v1/conversations/:id                // Detalhes da conversa
PUT    /api/v1/conversations/:id                // Atualizar conversa
DELETE /api/v1/conversations/:id                // Deletar conversa
POST   /api/v1/conversations/:id/close          // Encerrar conversa

// Endpoints de Mensagens
GET    /api/v1/conversations/:id/messages       // Listar mensagens
POST   /api/v1/conversations/:id/messages       // Enviar mensagem
PUT    /api/v1/messages/:id                    // Atualizar mensagem
DELETE /api/v1/messages/:id                    // Deletar mensagem

// Endpoints de Sessões
GET    /api/v1/conversations/:id/sessions       // Histórico de sessões
POST   /api/v1/conversations/:id/sessions       // Criar nova sessão
PUT    /api/v1/sessions/:id/transitions         // Transição de estado
PUT    /api/v1/sessions/:id/assign              // Atribuir sessão
PUT    /api/v1/sessions/:id/transfer            // Transferir sessão
PUT    /api/v1/sessions/:id/close               // Encerrar sessão

// Endpoints de Flags/Tags
GET    /api/v1/flags                           // Listar flags
POST   /api/v1/conversations/:id/flags         // Adicionar flag
DELETE /api/v1/conversations/:id/flags/:flagId // Remover flag
```

#### **1.2 Serviços Frontend**
```typescript
// src/services/conversationsService.ts
export class ConversationsService {
  async getConversations(filters: ConversationFilters): Promise<Conversation[]>
  async getConversation(id: string): Promise<Conversation>
  async updateConversation(id: string, data: UpdateConversationDto): Promise<Conversation>
  async closeConversation(id: string): Promise<void>
  
  async getMessages(conversationId: string, params: MessageParams): Promise<Message[]>
  async sendMessage(conversationId: string, data: SendMessageDto): Promise<Message>
  async updateMessage(id: string, data: UpdateMessageDto): Promise<Message>
  async deleteMessage(id: string): Promise<void>
  
  async getSessions(conversationId: string): Promise<Session[]>
  async createSession(conversationId: string, initialState: SessionState): Promise<Session>
  async transitionSession(sessionId: string, toState: SessionState): Promise<Session>
  async assignSession(sessionId: string, agentId: string): Promise<Session>
  async transferSession(sessionId: string, targetAgentId: string): Promise<Session>
  async closeSession(sessionId: string, reason: string): Promise<Session>
  
  async getFlags(): Promise<Flag[]>
  async addFlag(conversationId: string, flagId: string): Promise<void>
  async removeFlag(conversationId: string, flagId: string): Promise<void>
}
```

#### **1.3 Hooks Customizados**
```typescript
// src/hooks/useConversations.ts
export const useConversations = (filters: ConversationFilters) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ConversationsService.getConversations(filters);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  return { conversations, loading, error, fetchConversations };
};

// src/hooks/useMessages.ts
export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ConversationsService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);
  
  const sendMessage = useCallback(async (content: string) => {
    try {
      const newMessage = await ConversationsService.sendMessage(conversationId, { content });
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    }
  }, [conversationId]);
  
  return { messages, loading, error, fetchMessages, sendMessage };
};
```

#### **1.4 Componentes Atualizados**
```typescript
// src/pages/Conversations/components/ConversationsList/ConversationsList.tsx
export const ConversationsList: React.FC = () => {
  const { activeTab, searchTerm } = useConversationsContext();
  const { conversations, loading, error, fetchConversations } = useConversations({
    tab: activeTab,
    search: searchTerm
  });
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  if (loading) return <ConversationsLoading />;
  if (error) return <ErrorMessage error={error} onRetry={fetchConversations} />;
  
  return (
    <div className="space-y-4">
      {conversations.map(conversation => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onSelect={() => setSelectedConversation(conversation)}
          onAssign={(sessionId) => handleAssign(sessionId)}
          onTransfer={(sessionId) => handleTransfer(sessionId)}
          onClose={(sessionId) => handleClose(sessionId)}
        />
      ))}
    </div>
  );
};
```

### **2. Tela de Chatbots (`/chatbot`)**

#### **2.1 APIs Necessárias (Backend)**
```typescript
// Endpoints de Chatbots
GET    /api/v1/chatbots                         // Listar chatbots
GET    /api/v1/chatbots/:id                    // Detalhes do chatbot
POST   /api/v1/chatbots                        // Criar chatbot
PUT    /api/v1/chatbots/:id                    // Atualizar chatbot
DELETE /api/v1/chatbots/:id                    // Deletar chatbot
PUT    /api/v1/chatbots/:id/activate           // Ativar chatbot
PUT    /api/v1/chatbots/:id/pause              // Pausar chatbot
POST   /api/v1/chatbots/:id/clone              // Clonar chatbot
PUT    /api/v1/chatbots/reorder                // Reordenar chatbots

// Endpoints de Fluxos
GET    /api/v1/chatbots/flows                  // Listar fluxos
GET    /api/v1/chatbots/flows/:id              // Detalhes do fluxo
POST   /api/v1/chatbots/flows                  // Criar fluxo
PUT    /api/v1/chatbots/flows/:id              // Atualizar fluxo
DELETE /api/v1/chatbots/flows/:id              // Deletar fluxo

// Endpoints de Canais
GET    /api/v1/channels                        // Listar canais
```

#### **2.2 Serviços Frontend**
```typescript
// src/services/chatbotsService.ts
export class ChatbotsService {
  async getChatbots(filters: ChatbotFilters): Promise<Chatbot[]>
  async getChatbot(id: string): Promise<Chatbot>
  async createChatbot(data: CreateChatbotDto): Promise<Chatbot>
  async updateChatbot(id: string, data: UpdateChatbotDto): Promise<Chatbot>
  async deleteChatbot(id: string): Promise<void>
  async activateChatbot(id: string): Promise<void>
  async pauseChatbot(id: string): Promise<void>
  async cloneChatbot(id: string): Promise<Chatbot>
  async reorderChatbots(chatbotIds: string[]): Promise<void>
  
  async getFlows(): Promise<Flow[]>
  async getFlow(id: string): Promise<Flow>
  async createFlow(data: CreateFlowDto): Promise<Flow>
  async updateFlow(id: string, data: UpdateFlowDto): Promise<Flow>
  async deleteFlow(id: string): Promise<void>
  
  async getChannels(): Promise<Channel[]>
}
```

#### **2.3 Hooks Customizados**
```typescript
// src/hooks/useChatbots.ts
export const useChatbots = (filters: ChatbotFilters) => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchChatbots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ChatbotsService.getChatbots(filters);
      setChatbots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  const createChatbot = useCallback(async (data: CreateChatbotDto) => {
    try {
      const newChatbot = await ChatbotsService.createChatbot(data);
      setChatbots(prev => [...prev, newChatbot]);
      return newChatbot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar chatbot');
      throw err;
    }
  }, []);
  
  return { chatbots, loading, error, fetchChatbots, createChatbot };
};
```

### **3. Editor de Fluxos (`/settings/chatbots/editor`)**

#### **3.1 APIs Necessárias (Backend)**
```typescript
// Endpoints de Fluxos (Editor)
GET    /api/v1/chatbots/flows/:id              // Carregar fluxo
POST   /api/v1/chatbots/flows                  // Criar fluxo
PUT    /api/v1/chatbots/flows/:id              // Salvar fluxo
DELETE /api/v1/chatbots/flows/:id              // Deletar fluxo
POST   /api/v1/chatbots/flows/:id/validate     // Validar fluxo
POST   /api/v1/chatbots/flows/:id/test         // Testar fluxo
GET    /api/v1/chatbots/flows/:id/export       // Exportar fluxo
POST   /api/v1/chatbots/flows/import           // Importar fluxo
```

#### **3.2 Serviços Frontend**
```typescript
// src/services/flowsService.ts
export class FlowsService {
  async getFlow(id: string): Promise<FlowDTO>
  async createFlow(dto: CreateFlowDto): Promise<{ id: string }>
  async updateFlow(id: string, dto: UpdateFlowDto): Promise<void>
  async deleteFlow(id: string): Promise<void>
  async validateFlow(id: string, dto: FlowDTO): Promise<ValidationResult>
  async testFlow(id: string, testData: any): Promise<TestResult>
  async exportFlow(id: string): Promise<Blob>
  async importFlow(file: File): Promise<FlowDTO>
}
```

#### **3.3 Store Atualizado**
```typescript
// src/stores/editorStore.ts
export const useEditorStore = create<EditorState>((set, get) => ({
  // ... estado existente ...
  
  // Novos métodos para integração com backend
  loadFromBackend: async (flowId: string) => {
    try {
      const flow = await flowsService.getFlow(flowId);
      set({
        id: flow.id,
        name: flow.name,
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
        dirty: false
      });
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error);
      throw error;
    }
  },
  
  saveToBackend: async () => {
    const state = get();
    if (!state.id) {
      // Criar novo fluxo
      const result = await flowsService.createFlow({
        name: state.name,
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport
      });
      set({ id: result.id, dirty: false });
    } else {
      // Atualizar fluxo existente
      await flowsService.updateFlow(state.id, {
        name: state.name,
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport
      });
      set({ dirty: false });
    }
  }
}));
```

## 🔄 Real-time Updates

### **WebSocket Implementation**
```typescript
// src/services/websocketService.ts
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(url: string): void {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket conectado');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket desconectado');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };
  }
  
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'conversation_updated':
        // Atualizar lista de conversas
        break;
      case 'message_received':
        // Adicionar nova mensagem
        break;
      case 'chatbot_updated':
        // Atualizar lista de chatbots
        break;
      case 'flow_updated':
        // Atualizar editor de fluxos
        break;
    }
  }
  
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(this.ws?.url || '');
      }, 1000 * this.reconnectAttempts);
    }
  }
}
```

## 🧪 Testes e Validação

### **Testes de Integração**
```typescript
// src/tests/integration/conversations.test.ts
describe('Conversations Integration', () => {
  test('should list conversations', async () => {
    const conversations = await ConversationsService.getConversations({});
    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });
  
  test('should send message', async () => {
    const message = await ConversationsService.sendMessage('conversation-id', {
      content: 'Test message'
    });
    expect(message).toBeDefined();
    expect(message.content).toBe('Test message');
  });
});

// src/tests/integration/chatbots.test.ts
describe('Chatbots Integration', () => {
  test('should list chatbots', async () => {
    const chatbots = await ChatbotsService.getChatbots({});
    expect(chatbots).toBeDefined();
    expect(Array.isArray(chatbots)).toBe(true);
  });
  
  test('should create chatbot', async () => {
    const chatbot = await ChatbotsService.createChatbot({
      name: 'Test Bot',
      description: 'Test Description'
    });
    expect(chatbot).toBeDefined();
    expect(chatbot.name).toBe('Test Bot');
  });
});
```

## 📊 Métricas de Sucesso

### **Funcionalidades Core**
- [ ] ✅ Listar conversas por aba
- [ ] ✅ Selecionar e visualizar conversa
- [ ] ✅ Enviar e receber mensagens
- [ ] ✅ Ações contextuais funcionais
- [ ] ✅ Listar chatbots
- [ ] ✅ Criar/editar/deletar chatbots
- [ ] ✅ Salvar/carregar fluxos
- [ ] ✅ Validação de fluxos

### **Performance**
- [ ] ✅ Tempo de resposta < 200ms
- [ ] ✅ Carregamento inicial < 2s
- [ ] ✅ Atualizações em tempo real < 100ms
- [ ] ✅ Uso de memória otimizado

### **UX/UI**
- [ ] ✅ Loading states adequados
- [ ] ✅ Error handling robusto
- [ ] ✅ Feedback visual consistente
- [ ] ✅ Responsividade mantida

## 🚀 Próximos Passos Imediatos

### **Semana 1 - Dia 1**
1. **Configurar ambiente de desenvolvimento**
   - [ ] ✅ Verificar se backend está rodando
   - [ ] ✅ Configurar variáveis de ambiente
   - [ ] ✅ Testar conectividade

2. **Implementar APIs básicas de conversas**
   - [ ] ✅ Endpoint GET /conversations
   - [ ] ✅ Endpoint GET /conversations/:id
   - [ ] ✅ Endpoint GET /conversations/:id/messages
   - [ ] ✅ Endpoint POST /conversations/:id/messages

3. **Atualizar serviços frontend**
   - [ ] ✅ ConversationsService.getConversations()
   - [ ] ✅ ConversationsService.getMessages()
   - [ ] ✅ ConversationsService.sendMessage()

4. **Testar integração básica**
   - [ ] ✅ Listar conversas
   - [ ] ✅ Carregar mensagens
   - [ ] ✅ Enviar mensagem

### **Semana 1 - Dia 2**
1. **Implementar APIs de sessões**
   - [ ] ✅ Endpoint GET /conversations/:id/sessions
   - [ ] ✅ Endpoint POST /conversations/:id/sessions
   - [ ] ✅ Endpoint PUT /sessions/:id/transitions

2. **Implementar ações contextuais**
   - [ ] ✅ Atribuir sessão
   - [ ] ✅ Transferir sessão
   - [ ] ✅ Encerrar sessão

3. **Testar funcionalidades**
   - [ ] ✅ Ações contextuais funcionando
   - [ ] ✅ Transições de estado
   - [ ] ✅ Contadores atualizados

## 🎯 Conclusão

Este plano fornece um **roteiro claro e detalhado** para implementar as funcionalidades necessárias em **3 semanas**. O foco é na **integração backend-frontend** e na **funcionalidade completa** das telas.

**Próximo passo**: Iniciar a **Semana 1 - Dia 1** com a implementação das APIs básicas de conversas! 🚀
