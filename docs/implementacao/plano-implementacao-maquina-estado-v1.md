# 🚀 Plano de Implementação - Máquina de Estado V1

## 📋 Visão Geral

Este documento detalha o plano de implementação da **Máquina de Estado V1** para conversas, integrando o frontend atual com o backend através de uma abordagem **incremental** e **compatível** com o código existente.

## 🎯 Objetivos

1. **Implementar estados granulares** para conversas
2. **Integrar frontend com backend** através de APIs específicas
3. **Manter compatibilidade** com funcionalidades existentes
4. **Implementar sistema de transições** controladas
5. **Adicionar campos de auditoria** para rastreabilidade

## 📅 Cronograma de Implementação

### **Fase 1: Backend - Fundação (Semana 1-2)**
- [ ] Migração do modelo de dados
- [ ] Implementação de estados básicos
- [ ] Criação de campos de auditoria
- [ ] Sistema de transições básico

### **Fase 2: API - Endpoints Específicos (Semana 3)**
- [ ] Endpoints por aba (`/api/conversations?view=bot`)
- [ ] Sistema de transições (`POST /api/conversations/:id/transitions`)
- [ ] Filtros avançados por estado
- [ ] Contadores em tempo real

### **Fase 3: Frontend - Integração (Semana 4)**
- [ ] Integração com novos endpoints
- [ ] Implementação de lógica de estados
- [ ] Atualização de componentes de filtragem
- [ ] Sistema de notificações por estado

### **Fase 4: Funcionalidades Avançadas (Semana 5-6)**
- [ ] Sistema de snooze/timeout
- [ ] Métricas e relatórios
- [ ] Otimizações de performance
- [ ] Testes e validação

## 🔧 Implementação Detalhada

### **Fase 1: Backend - Fundação**

#### 1.1 Migração do Modelo de Dados

**Arquivo:** `src/models/Conversation.ts`

```typescript
// Adicionar novos campos ao modelo existente
export interface IConversation extends Document {
  // ... campos existentes ...
  
  // Novos campos para máquina de estado
  state: ConversationState;
  sector_id?: string;
  bot_id?: string;
  assigned_at?: Date;
  started_at?: Date;
  resolved_at?: Date;
  last_customer_message_at?: Date;
  last_agent_message_at?: Date;
  snooze_until?: Date;
  drop_reason?: string;
  audit_log: Array<{
    from: ConversationState;
    to: ConversationState;
    event: string;
    actor: string;
    timestamp: Date;
  }>;
}

// Enum de estados
export enum ConversationState {
  NEW = 'NEW',
  ROUTING = 'ROUTING',
  BOT_ACTIVE = 'BOT_ACTIVE',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  WAITING_INTERNAL = 'WAITING_INTERNAL',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  DROPPED = 'DROPPED'
}
```

#### 1.2 Sistema de Transições

**Arquivo:** `src/services/ConversationStateMachine.ts`

```typescript
export class ConversationStateMachine {
  private static readonly TRANSITIONS = {
    [ConversationState.NEW]: [ConversationState.ROUTING, ConversationState.BOT_ACTIVE],
    [ConversationState.ROUTING]: [ConversationState.ASSIGNED, ConversationState.BOT_ACTIVE],
    [ConversationState.BOT_ACTIVE]: [ConversationState.ROUTING, ConversationState.RESOLVED],
    [ConversationState.ASSIGNED]: [ConversationState.IN_PROGRESS, ConversationState.ROUTING],
    [ConversationState.IN_PROGRESS]: [ConversationState.WAITING_CUSTOMER, ConversationState.RESOLVED],
    [ConversationState.WAITING_CUSTOMER]: [ConversationState.IN_PROGRESS, ConversationState.DROPPED],
    [ConversationState.RESOLVED]: [ConversationState.CLOSED, ConversationState.ROUTING],
    [ConversationState.CLOSED]: [ConversationState.ROUTING], // Reabertura
    [ConversationState.DROPPED]: [] // Estado terminal
  };

  static canTransition(from: ConversationState, to: ConversationState): boolean {
    return this.TRANSITIONS[from]?.includes(to) || false;
  }

  static async transition(
    conversationId: string,
    to: ConversationState,
    event: string,
    actor: string,
    metadata?: any
  ): Promise<IConversation> {
    // Implementar lógica de transição com validação
  }
}
```

#### 1.3 Migração de Dados Existentes

**Arquivo:** `src/migrations/ConversationStateMigration.ts`

```typescript
export class ConversationStateMigration {
  static async migrateExistingConversations(): Promise<void> {
    const conversations = await Conversation.find({});
    
    for (const conv of conversations) {
      const newState = this.mapLegacyStatusToState(conv.status, conv.assigned_user_id);
      
      await Conversation.findByIdAndUpdate(conv._id, {
        state: newState,
        assigned_at: conv.assigned_user_id ? conv.updated_at : undefined,
        audit_log: [{
          from: ConversationState.NEW,
          to: newState,
          event: 'migration',
          actor: 'system',
          timestamp: new Date()
        }]
      });
    }
  }

  private static mapLegacyStatusToState(status: string, assignedUserId: string | null): ConversationState {
    if (status === 'closed') return ConversationState.CLOSED;
    if (status === 'archived') return ConversationState.CLOSED;
    
    if (assignedUserId === null) return ConversationState.BOT_ACTIVE;
    if (assignedUserId) return ConversationState.ASSIGNED;
    
    return ConversationState.ROUTING;
  }
}
```

### **Fase 2: API - Endpoints Específicos**

#### 2.1 Endpoints por Aba

**Arquivo:** `src/controllers/conversations/ConversationViewController.ts`

```typescript
export class ConversationViewController {
  // GET /api/conversations?view=bot
  static async getBotConversations(req: Request, res: Response): Promise<void> {
    const conversations = await Conversation.find({
      clinic_id: req.query.clinic_id,
      state: ConversationState.BOT_ACTIVE
    });
    res.json({ success: true, data: conversations });
  }

  // GET /api/conversations?view=entrada
  static async getEntradaConversations(req: Request, res: Response): Promise<void> {
    const conversations = await Conversation.find({
      clinic_id: req.query.clinic_id,
      state: { $in: [ConversationState.ROUTING, ConversationState.ASSIGNED] },
      assigned_user_id: null
    });
    res.json({ success: true, data: conversations });
  }

  // GET /api/conversations?view=aguardando
  static async getAguardandoConversations(req: Request, res: Response): Promise<void> {
    const conversations = await Conversation.find({
      clinic_id: req.query.clinic_id,
      state: ConversationState.ASSIGNED,
      assigned_user_id: req.user.id,
      started_at: null
    });
    res.json({ success: true, data: conversations });
  }

  // GET /api/conversations?view=em_atendimento
  static async getEmAtendimentoConversations(req: Request, res: Response): Promise<void> {
    const conversations = await Conversation.find({
      clinic_id: req.query.clinic_id,
      state: { 
        $in: [
          ConversationState.IN_PROGRESS,
          ConversationState.WAITING_CUSTOMER,
          ConversationState.WAITING_INTERNAL,
          ConversationState.ON_HOLD
        ]
      },
      assigned_user_id: req.user.id
    });
    res.json({ success: true, data: conversations });
  }

  // GET /api/conversations?view=finalizadas
  static async getFinalizadasConversations(req: Request, res: Response): Promise<void> {
    const conversations = await Conversation.find({
      clinic_id: req.query.clinic_id,
      state: { 
        $in: [
          ConversationState.RESOLVED,
          ConversationState.CLOSED,
          ConversationState.DROPPED
        ]
      }
    });
    res.json({ success: true, data: conversations });
  }
}
```

#### 2.2 Sistema de Transições

**Arquivo:** `src/controllers/conversations/ConversationTransitionController.ts`

```typescript
export class ConversationTransitionController {
  // POST /api/conversations/:id/transitions
  static async transitionConversation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { to, event, metadata } = req.body;
    const actor = req.user.id;

    try {
      const conversation = await ConversationStateMachine.transition(
        id,
        to,
        event,
        actor,
        metadata
      );

      res.json({ success: true, data: conversation });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // POST /api/conversations/:id/assume
  static async assumeConversation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const actor = req.user.id;

    const conversation = await ConversationStateMachine.transition(
      id,
      ConversationState.IN_PROGRESS,
      'assume',
      actor
    );

    res.json({ success: true, data: conversation });
  }

  // POST /api/conversations/:id/resolve
  static async resolveConversation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const actor = req.user.id;

    const conversation = await ConversationStateMachine.transition(
      id,
      ConversationState.RESOLVED,
      'resolve',
      actor,
      { reason }
    );

    res.json({ success: true, data: conversation });
  }
}
```

### **Fase 3: Frontend - Integração**

#### 3.1 Serviço de API Atualizado

**Arquivo:** `src/services/conversationsService.ts`

```typescript
export class ConversationsService {
  // Buscar conversas por aba
  static async getConversationsByTab(
    tab: TabKey,
    clinicId: string,
    params?: {
      limit?: number;
      offset?: number;
      search?: string;
    }
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const queryParams = new URLSearchParams({
      clinic_id: clinicId,
      view: tab,
      ...params
    });

    const response = await fetch(`/api/conversations?${queryParams}`);
    const data = await response.json();
    
    return {
      conversations: data.data.conversations,
      total: data.data.total
    };
  }

  // Transição de estado
  static async transitionConversation(
    conversationId: string,
    to: ConversationState,
    event: string,
    metadata?: any
  ): Promise<Conversation> {
    const response = await fetch(`/api/conversations/${conversationId}/transitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, event, metadata })
    });

    const data = await response.json();
    return data.data;
  }

  // Assumir conversa
  static async assumeConversation(conversationId: string): Promise<Conversation> {
    const response = await fetch(`/api/conversations/${conversationId}/assume`, {
      method: 'POST'
    });

    const data = await response.json();
    return data.data;
  }

  // Resolver conversa
  static async resolveConversation(
    conversationId: string,
    reason?: string
  ): Promise<Conversation> {
    const response = await fetch(`/api/conversations/${conversationId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });

    const data = await response.json();
    return data.data;
  }
}
```

#### 3.2 Hook Atualizado para Conversas

**Arquivo:** `src/hooks/useConversations.ts`

```typescript
export const useConversations = (clinicId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('entrada');

  // Buscar conversas por aba
  const fetchConversations = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const data = await ConversationsService.getConversationsByTab(tab, clinicId);
      setConversations(data.conversations);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  // Assumir conversa
  const assumeConversation = useCallback(async (conversationId: string) => {
    try {
      const updatedConversation = await ConversationsService.assumeConversation(conversationId);
      
      // Atualizar lista local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
      // Mover para aba "Em atendimento"
      setActiveTab('em_atendimento');
    } catch (error) {
      console.error('Erro ao assumir conversa:', error);
    }
  }, []);

  // Resolver conversa
  const resolveConversation = useCallback(async (conversationId: string, reason?: string) => {
    try {
      const updatedConversation = await ConversationsService.resolveConversation(conversationId, reason);
      
      // Atualizar lista local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
      // Mover para aba "Finalizadas"
      setActiveTab('finalizadas');
    } catch (error) {
      console.error('Erro ao resolver conversa:', error);
    }
  }, []);

  // Efeito para buscar conversas quando aba muda
  useEffect(() => {
    fetchConversations(activeTab);
  }, [activeTab, fetchConversations]);

  return {
    conversations,
    loading,
    activeTab,
    setActiveTab,
    assumeConversation,
    resolveConversation,
    fetchConversations
  };
};
```

#### 3.3 Componente de Ações Atualizado

**Arquivo:** `src/pages/Conversations/components/ConversationsList/ConversationActions.tsx`

```typescript
export const ConversationActions: React.FC<ConversationActionsProps> = ({
  conversation,
  activeTab,
  onAction
}) => {
  const { assumeConversation, resolveConversation } = useConversations();

  const handleAssume = async () => {
    await assumeConversation(conversation.id);
    onAction('assumed', conversation);
  };

  const handleResolve = async () => {
    await resolveConversation(conversation.id);
    onAction('resolved', conversation);
  };

  const renderActions = () => {
    switch (activeTab) {
      case 'bot':
        return (
          <Button onClick={handleAssume} size="sm" variant="outline">
            <User className="h-3 w-3 mr-1" />
            Assumir
          </Button>
        );

      case 'entrada':
        return (
          <Button onClick={handleAssume} size="sm" variant="outline">
            <User className="h-3 w-3 mr-1" />
            Assumir
          </Button>
        );

      case 'aguardando':
        return (
          <Button onClick={handleAssume} size="sm" variant="outline">
            <Play className="h-3 w-3 mr-1" />
            Iniciar
          </Button>
        );

      case 'em_atendimento':
        return (
          <div className="flex gap-1">
            <Button onClick={handleResolve} size="sm" variant="outline">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolver
            </Button>
            <Button onClick={() => onAction('escalar', conversation)} size="sm" variant="outline">
              <ArrowUp className="h-3 w-3 mr-1" />
              Escalar
            </Button>
          </div>
        );

      case 'finalizadas':
        return null;

      default:
        return null;
    }
  };

  return <div className="flex gap-1">{renderActions()}</div>;
};
```

### **Fase 4: Funcionalidades Avançadas**

#### 4.1 Sistema de Snooze/Timeout

**Arquivo:** `src/services/ConversationSnoozeService.ts`

```typescript
export class ConversationSnoozeService {
  // Colocar conversa em pausa
  static async snoozeConversation(
    conversationId: string,
    until: Date,
    reason?: string
  ): Promise<Conversation> {
    return await ConversationsService.transitionConversation(
      conversationId,
      ConversationState.ON_HOLD,
      'snooze',
      { until, reason }
    );
  }

  // Retomar conversa pausada
  static async unsnoozeConversation(conversationId: string): Promise<Conversation> {
    return await ConversationsService.transitionConversation(
      conversationId,
      ConversationState.IN_PROGRESS,
      'unsnooze'
    );
  }

  // Verificar conversas que devem sair do snooze
  static async checkSnoozeExpiration(): Promise<void> {
    const expiredConversations = await Conversation.find({
      state: ConversationState.ON_HOLD,
      snooze_until: { $lte: new Date() }
    });

    for (const conv of expiredConversations) {
      await this.unsnoozeConversation(conv.id);
    }
  }
}
```

#### 4.2 Sistema de Notificações

**Arquivo:** `src/services/ConversationNotificationService.ts`

```typescript
export class ConversationNotificationService {
  // Notificar mudança de estado
  static async notifyStateChange(
    conversation: Conversation,
    from: ConversationState,
    to: ConversationState,
    actor: string
  ): Promise<void> {
    // Implementar notificações em tempo real
    // WebSocket, Server-Sent Events, etc.
  }

  // Notificar SLA crítico
  static async notifySLAWarning(conversation: Conversation): Promise<void> {
    // Implementar alertas de SLA
  }
}
```

## 🧪 Estratégia de Testes

### **Testes Unitários**
- [ ] Testes para máquina de estado
- [ ] Testes para transições válidas/inválidas
- [ ] Testes para filtros por aba
- [ ] Testes para serviços de API

### **Testes de Integração**
- [ ] Testes end-to-end para fluxo completo
- [ ] Testes de performance para filtros
- [ ] Testes de concorrência para transições
- [ ] Testes de migração de dados

### **Testes de Interface**
- [ ] Testes de componentes de aba
- [ ] Testes de ações de conversa
- [ ] Testes de responsividade
- [ ] Testes de acessibilidade

## 📊 Métricas e Monitoramento

### **Métricas de Performance**
- Tempo de resposta por aba
- Tempo de transição de estado
- Taxa de erro em transições
- Performance de filtros

### **Métricas de Negócio**
- Tempo médio por estado
- Taxa de conversão por aba
- SLA de atendimento
- Satisfação do cliente

## 🚀 Deploy e Rollout

### **Estratégia de Deploy**
1. **Deploy Backend** - Novos campos e APIs
2. **Migração de Dados** - Converter conversas existentes
3. **Deploy Frontend** - Interface atualizada
4. **Monitoramento** - Acompanhar métricas
5. **Rollback Plan** - Plano de contingência

### **Validação Pós-Deploy**
- [ ] Verificar integridade dos dados
- [ ] Validar performance das APIs
- [ ] Confirmar funcionamento das abas
- [ ] Testar transições de estado
- [ ] Validar notificações em tempo real

## ✅ Critérios de Sucesso

### **Funcionais**
- [ ] Todas as 5 abas funcionando corretamente
- [ ] Transições de estado controladas
- [ ] Filtros por aba operacionais
- [ ] Sistema de auditoria completo
- [ ] Notificações em tempo real

### **Não-Funcionais**
- [ ] Performance mantida ou melhorada
- [ ] Compatibilidade com código existente
- [ ] Escalabilidade para crescimento
- [ ] Manutenibilidade do código
- [ ] Documentação completa

## 📝 Próximos Passos

1. **Aprovação do Plano** - Revisar e aprovar este documento
2. **Setup do Ambiente** - Preparar ambiente de desenvolvimento
3. **Início da Fase 1** - Começar implementação do backend
4. **Revisões Periódicas** - Acompanhar progresso semanalmente
5. **Testes Contínuos** - Implementar testes durante desenvolvimento

---

**Documento criado em:** {{ new Date().toISOString().split('T')[0] }}  
**Versão:** 1.0  
**Status:** Aguardando Aprovação
