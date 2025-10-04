# 📋 Listagem de Conversas - Nova Arquitetura

## 🎯 Visão Geral

Com a nova arquitetura de **Conversa vs. Atendimento**, a listagem de conversas vai exibir informações mais ricas e contextuais, diferenciando claramente entre o histórico da conversa e o estado atual do atendimento.

## 📊 O que Vai Aparecer na Listagem

### **Estrutura Atual vs. Nova**

#### **Estrutura Atual (ConversationItem)**
```typescript
interface ConversationItemProps {
  id: string;
  contactName: string;
  contactAvatarUrl?: string;
  lastMessageSnippet?: string;
  lastActiveAt: string | Date;
  sectorLabel: string;
  contactTags?: Array<{label: string; tone?: 'green'|'blue'|'gray'}>;
  conversationTags?: TagItem[];
  isSelected?: boolean;
  isUnread?: boolean;
  isPrivate?: boolean;
  hasScheduledMessage?: boolean;
  agentAvatarUrl?: string;
  source?: 'whatsapp'|'instagram'|'webchat';
  activeTab?: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
}
```

#### **Nova Estrutura (ConversationWithSession)**
```typescript
interface ConversationWithSession {
  conversation: Conversation;
  activeSession?: Session;
  sessionHistory: Session[];
}

interface Conversation {
  id: string;
  clinic_id: string;
  customer_phone: string;
  customer_name?: string;
  customer_profile_pic?: string;
  conversation_type: 'individual' | 'group';
  group_name?: string;
  status: 'active' | 'closed' | 'archived';
  last_message?: MessageSummary;
  unread_count: number;
  total_messages: number;
  total_sessions_count: number;
  flags: Flag[];
  created_at: Date;
  updated_at: Date;
}

interface Session {
  id: string;
  state: SessionState;
  agent_id?: string;
  sector_id?: string;
  bot_id?: string;
  started_at: Date;
  ended_at?: Date;
  last_activity_at: Date;
  messages_count: number;
  resolution_reason?: string;
  satisfaction_score?: number;
}
```

## 🎨 Layout Visual da Listagem

### **Estrutura do Card de Conversa**

```typescript
// Nova estrutura visual
<div className="conversation-card">
  {/* Header - Informações da Conversa */}
  <div className="conversation-header">
    <Avatar customer={conversation.customer} />
    <div className="conversation-info">
      <h3>{conversation.customer_name || conversation.customer_phone}</h3>
      <p className="conversation-meta">
        {conversation.conversation_type === 'group' ? conversation.group_name : conversation.customer_phone}
      </p>
    </div>
    <div className="conversation-status">
      <Badge variant={getConversationStatusVariant(conversation.status)}>
        {getConversationStatusLabel(conversation.status)}
      </Badge>
    </div>
  </div>

  {/* Session Info - Estado do Atendimento Ativo */}
  {activeSession && (
    <div className="session-info">
      <div className="session-state">
        <Badge variant={getSessionStateVariant(activeSession.state)}>
          {getSessionStateLabel(activeSession.state)}
        </Badge>
        <span className="session-agent">
          {activeSession.agent_id ? `Atendente: ${activeSession.agent_id}` : 'Bot'}
        </span>
      </div>
      <div className="session-metrics">
        <span className="session-duration">
          {formatDuration(activeSession.started_at, activeSession.ended_at)}
        </span>
        <span className="session-messages">
          {activeSession.messages_count} mensagens
        </span>
      </div>
    </div>
  )}

  {/* Last Message - Última Mensagem */}
  <div className="last-message">
    <p className="message-snippet">{conversation.last_message?.content}</p>
    <span className="message-time">
      {formatRelativeTime(conversation.last_message?.timestamp)}
    </span>
  </div>

  {/* Tags and Flags */}
  <div className="conversation-tags">
    {conversation.flags.map(flag => (
      <Tag key={flag.id} color={flag.color}>{flag.name}</Tag>
    ))}
  </div>

  {/* Actions - Ações Contextuais */}
  <div className="conversation-actions">
    {activeSession && (
      <>
        <Button size="sm" onClick={() => onAssign(activeSession.id)}>
          Atribuir
        </Button>
        <Button size="sm" variant="outline" onClick={() => onTransfer(activeSession.id)}>
          Transferir
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onClose(activeSession.id)}>
          Encerrar
        </Button>
      </>
    )}
  </div>
</div>
```

## 📋 Campos Exibidos por Aba

### **🤖 Bot/IA Tab**
```typescript
// Filtro: current_session.state = BOT_ACTIVE
const botConversations = conversations.filter(c => 
  c.activeSession?.state === 'BOT_ACTIVE'
);

// Campos exibidos:
- customer_name/customer_phone
- customer_profile_pic
- last_message (da conversa)
- activeSession.state = "Bot Ativo"
- activeSession.bot_id
- activeSession.messages_count
- activeSession.started_at
- unread_count
- flags
```

### **📥 Entrada Tab**
```typescript
// Filtro: current_session.state IN (ROUTING, ASSIGNED) AND current_session.agent_id IS NULL
const entradaConversations = conversations.filter(c => 
  ['ROUTING', 'ASSIGNED'].includes(c.activeSession?.state) && 
  !c.activeSession?.agent_id
);

// Campos exibidos:
- customer_name/customer_phone
- customer_profile_pic
- last_message (da conversa)
- activeSession.state = "Roteando" ou "Atribuído"
- activeSession.sector_id (setor/fila)
- activeSession.started_at
- unread_count
- flags
- Ações: "Atribuir", "Transferir"
```

### **🕓 Aguardando Tab**
```typescript
// Filtro: current_session.state = ASSIGNED AND current_session.agent_id = current_user
const aguardandoConversations = conversations.filter(c => 
  c.activeSession?.state === 'ASSIGNED' && 
  c.activeSession?.agent_id === currentUser.id
);

// Campos exibidos:
- customer_name/customer_phone
- customer_profile_pic
- last_message (da conversa)
- activeSession.state = "Atribuído"
- activeSession.agent_id = "Você"
- activeSession.started_at
- unread_count
- flags
- Ações: "Iniciar Atendimento", "Transferir"
```

### **💬 Em Atendimento Tab**
```typescript
// Filtro: current_session.state IN (IN_PROGRESS, WAITING_CUSTOMER, WAITING_INTERNAL, ON_HOLD)
const emAtendimentoConversations = conversations.filter(c => 
  ['IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ON_HOLD'].includes(c.activeSession?.state)
);

// Campos exibidos:
- customer_name/customer_phone
- customer_profile_pic
- last_message (da conversa)
- activeSession.state = "Em Andamento", "Aguardando Cliente", etc.
- activeSession.agent_id
- activeSession.messages_count
- activeSession.started_at
- activeSession.last_activity_at
- unread_count
- flags
- Ações: "Transferir", "Pausar", "Encerrar"
```

### **✅ Finalizadas Tab**
```typescript
// Filtro: conversation.status = 'closed' OR current_session.state IN (RESOLVED, CLOSED, DROPPED)
const finalizadasConversations = conversations.filter(c => 
  c.conversation.status === 'closed' || 
  ['RESOLVED', 'CLOSED', 'DROPPED'].includes(c.activeSession?.state)
);

// Campos exibidos:
- customer_name/customer_phone
- customer_profile_pic
- last_message (da conversa)
- activeSession.state = "Resolvido", "Encerrado", "Encerrado por Timeout"
- activeSession.resolution_reason
- activeSession.satisfaction_score
- activeSession.ended_at
- activeSession.messages_count
- flags
- Ações: "Reabrir", "Ver Histórico"
```

## 🎨 Componentes Visuais

### **Badges de Estado**
```typescript
// Badges para estados de sessão
const SESSION_STATE_BADGES = {
  'BOT_ACTIVE': { variant: 'secondary', label: 'Bot Ativo', color: 'blue' },
  'ROUTING': { variant: 'outline', label: 'Roteando', color: 'yellow' },
  'ASSIGNED': { variant: 'outline', label: 'Atribuído', color: 'orange' },
  'IN_PROGRESS': { variant: 'default', label: 'Em Andamento', color: 'green' },
  'WAITING_CUSTOMER': { variant: 'secondary', label: 'Aguardando Cliente', color: 'blue' },
  'WAITING_INTERNAL': { variant: 'secondary', label: 'Aguardando Interno', color: 'purple' },
  'ON_HOLD': { variant: 'outline', label: 'Em Pausa', color: 'gray' },
  'RESOLVED': { variant: 'default', label: 'Resolvido', color: 'green' },
  'CLOSED': { variant: 'destructive', label: 'Encerrado', color: 'red' },
  'DROPPED': { variant: 'destructive', label: 'Encerrado por Timeout', color: 'red' }
};
```

### **Ícones de Plataforma**
```typescript
// Ícones para diferentes canais
const PLATFORM_ICONS = {
  'whatsapp': <WhatsAppIcon className="w-4 h-4" />,
  'instagram': <InstagramIcon className="w-4 h-4" />,
  'webchat': <WebChatIcon className="w-4 h-4" />,
  'telegram': <TelegramIcon className="w-4 h-4" />
};
```

### **Métricas Visuais**
```typescript
// Exibição de métricas
const SessionMetrics = ({ session }: { session: Session }) => (
  <div className="session-metrics">
    <div className="metric">
      <ClockIcon className="w-4 h-4" />
      <span>{formatDuration(session.started_at, session.ended_at)}</span>
    </div>
    <div className="metric">
      <MessageIcon className="w-4 h-4" />
      <span>{session.messages_count}</span>
    </div>
    {session.satisfaction_score && (
      <div className="metric">
        <StarIcon className="w-4 h-4" />
        <span>{session.satisfaction_score}/5</span>
      </div>
    )}
  </div>
);
```

## 🔄 Ações Contextuais por Aba

### **Ações Disponíveis**
```typescript
interface ConversationActions {
  // Ações gerais
  onViewDetails: (conversationId: string) => void;
  onViewHistory: (conversationId: string) => void;
  
  // Ações de sessão
  onAssign: (sessionId: string) => void;
  onTransfer: (sessionId: string) => void;
  onStart: (sessionId: string) => void;
  onPause: (sessionId: string) => void;
  onResume: (sessionId: string) => void;
  onClose: (sessionId: string) => void;
  onReopen: (conversationId: string) => void;
  
  // Ações de tags
  onAddTag: (conversationId: string) => void;
  onRemoveTag: (conversationId: string, tagId: string) => void;
  
  // Ações de mensagem
  onSendMessage: (conversationId: string) => void;
  onScheduleMessage: (conversationId: string) => void;
}
```

### **Ações por Aba**
```typescript
const getActionsForTab = (tab: string, session?: Session) => {
  switch (tab) {
    case 'bot':
      return ['Transferir para Humano', 'Ver Detalhes'];
    case 'entrada':
      return ['Atribuir', 'Transferir', 'Ver Detalhes'];
    case 'aguardando':
      return ['Iniciar Atendimento', 'Transferir', 'Ver Detalhes'];
    case 'em_atendimento':
      return ['Transferir', 'Pausar', 'Encerrar', 'Ver Detalhes'];
    case 'finalizadas':
      return ['Reabrir', 'Ver Histórico', 'Ver Detalhes'];
    default:
      return ['Ver Detalhes'];
  }
};
```

## 📊 Métricas e Contadores

### **Contadores por Aba**
```typescript
// Contadores em tempo real
const getTabCounts = (conversations: ConversationWithSession[]) => {
  return {
    bot: conversations.filter(c => c.activeSession?.state === 'BOT_ACTIVE').length,
    entrada: conversations.filter(c => 
      ['ROUTING', 'ASSIGNED'].includes(c.activeSession?.state) && 
      !c.activeSession?.agent_id
    ).length,
    aguardando: conversations.filter(c => 
      c.activeSession?.state === 'ASSIGNED' && 
      c.activeSession?.agent_id === currentUser.id
    ).length,
    em_atendimento: conversations.filter(c => 
      ['IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ON_HOLD'].includes(c.activeSession?.state)
    ).length,
    finalizadas: conversations.filter(c => 
      c.conversation.status === 'closed' || 
      ['RESOLVED', 'CLOSED', 'DROPPED'].includes(c.activeSession?.state)
    ).length
  };
};
```

### **Métricas de Performance**
```typescript
// Métricas agregadas
const getPerformanceMetrics = (conversations: ConversationWithSession[]) => {
  const activeSessions = conversations.filter(c => c.activeSession);
  
  return {
    totalConversations: conversations.length,
    activeSessions: activeSessions.length,
    averageSessionDuration: calculateAverageDuration(activeSessions),
    averageMessagesPerSession: calculateAverageMessages(activeSessions),
    resolutionRate: calculateResolutionRate(conversations),
    satisfactionAverage: calculateSatisfactionAverage(activeSessions)
  };
};
```

## 🎯 Conclusão

A nova listagem de conversas vai exibir:

1. ✅ **Informações da Conversa**: Cliente, última mensagem, status geral
2. ✅ **Estado do Atendimento Ativo**: Estado atual, responsável, métricas
3. ✅ **Contexto Visual**: Badges, ícones, cores diferenciadas
4. ✅ **Ações Contextuais**: Botões específicos para cada aba
5. ✅ **Métricas em Tempo Real**: Contadores e indicadores de performance

A interface será **mais informativa** e **contextual**, permitindo que agentes e gestores tenham uma visão clara tanto do histórico da conversa quanto do estado atual do atendimento! 🎯
