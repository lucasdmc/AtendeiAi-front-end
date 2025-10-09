# Integração WhatsApp — Funcionalidades Completas

**Contexto:** A integração com WhatsApp é crítica para o funcionamento do bot, mas pode estar limitada a funcionalidades básicas de texto, sem suporte completo a recursos avançados do WhatsApp Business API.

**Lacuna identificada:** Suporte limitado a tipos de mensagem avançados, falta de webhook handlers robustos, ausência de funcionalidades como status de entrega, e integração incompleta com recursos do WhatsApp Business.

**Impacto:** Bots limitados a interações básicas, impossibilidade de criar experiências ricas, e falta de insights sobre engajamento dos usuários.

**Implementação necessária:**

### 1. Suporte Completo a Tipos de Mensagem

**Arquivo:** `src/services/whatsapp/WhatsAppMessageHandler.ts` (expandir)

#### Mensagens de Texto Avançadas
```typescript
interface TextMessage {
  text: string;
  preview_url?: boolean;      // Preview de links
  formatting?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    monospace: boolean;
  };
}
```

#### Mensagens de Mídia
```typescript
interface MediaMessage {
  type: 'image' | 'video' | 'audio' | 'document';
  media_id?: string;          // ID da mídia já enviada
  link?: string;              // URL da mídia
  caption?: string;           // Legenda
  filename?: string;          // Nome do arquivo
}
```

#### Mensagens Interativas
```typescript
interface InteractiveMessage {
  type: 'button' | 'list' | 'product' | 'product_list';
  header?: MessageHeader;
  body: MessageBody;
  footer?: MessageFooter;
  action: ButtonAction | ListAction | ProductAction;
}

interface ButtonAction {
  buttons: Array<{
    id: string;
    title: string;
    type: 'reply';
  }>;
}

interface ListAction {
  button: string;
  sections: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}
```

#### Mensagens de Template
```typescript
interface TemplateMessage {
  name: string;
  language: {
    code: string;
    policy: 'deterministic' | 'fallback';
  };
  components?: TemplateComponent[];
}
```

### 2. Webhook Handlers Robustos

**Arquivo:** `src/services/whatsapp/handlers/` (expandir estrutura)

#### MessageWebhookHandler
```typescript
class MessageWebhookHandler {
  async handleIncomingMessage(webhook: WhatsAppWebhook): Promise<void> {
    // Validar assinatura do webhook
    // Processar diferentes tipos de mensagem
    // Integrar com FlowExecutionEngine
    // Tratar erros e retry
  }
  
  async handleMessageStatus(status: MessageStatus): Promise<void> {
    // Processar status: sent, delivered, read, failed
    // Atualizar métricas de entrega
    // Notificar sistema de analytics
  }
}
```

#### SystemWebhookHandler
```typescript
class SystemWebhookHandler {
  async handleAccountUpdate(update: AccountUpdate): Promise<void> {
    // Mudanças na conta do WhatsApp Business
  }
  
  async handlePhoneNumberUpdate(update: PhoneNumberUpdate): Promise<void> {
    // Mudanças no número de telefone
  }
}
```

### 3. Gerenciamento de Sessões Avançado

**Arquivo:** `src/services/whatsapp/WhatsAppSessionManager.ts` (expandir)

**Funcionalidades:**
```typescript
interface WhatsAppSession {
  phone_number: string;
  contact_id: string;
  conversation_id: string;
  
  // Estado da conversa
  status: 'active' | 'waiting' | 'transferred' | 'closed';
  last_activity: Date;
  
  // Contexto da sessão
  variables: Record<string, any>;
  flow_execution_id?: string;
  current_node_id?: string;
  
  // Métricas
  message_count: number;
  session_duration_ms: number;
  
  // Configurações
  language: string;
  timezone: string;
  preferences: UserPreferences;
}
```

### 4. Sistema de Templates WhatsApp

**Funcionalidades:**
- **Template management:** CRUD de templates
- **Approval workflow:** Fluxo de aprovação com Meta
- **Variable mapping:** Mapeamento de variáveis do fluxo
- **Localization:** Suporte a múltiplos idiomas
- **Performance tracking:** Métricas de performance dos templates

**Implementação:**
```typescript
interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'authentication' | 'marketing' | 'utility';
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  components: TemplateComponent[];
  
  // Métricas
  sent_count: number;
  delivered_count: number;
  read_count: number;
  clicked_count: number;
}
```

### 5. Gestão de Contatos e Perfis

**Arquivo:** `src/services/whatsapp/ContactManager.ts` (novo)

**Funcionalidades:**
```typescript
interface WhatsAppContact {
  phone_number: string;
  profile: {
    name?: string;
    profile_pic_url?: string;
    status?: string;
  };
  
  // Dados enriquecidos
  tags: string[];
  custom_fields: Record<string, any>;
  preferences: ContactPreferences;
  
  // Histórico
  first_interaction: Date;
  last_interaction: Date;
  total_conversations: number;
  
  // Segmentação
  segments: string[];
  lifecycle_stage: 'new' | 'engaged' | 'customer' | 'churned';
}
```

### 6. Sistema de Métricas e Analytics

**Métricas a coletar:**
```typescript
interface WhatsAppMetrics {
  // Mensagens
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  messages_failed: number;
  
  // Conversas
  conversations_started: number;
  conversations_completed: number;
  avg_conversation_duration: number;
  
  // Templates
  template_delivery_rate: number;
  template_read_rate: number;
  template_click_rate: number;
  
  // Engajamento
  response_rate: number;
  avg_response_time: number;
  user_satisfaction_score: number;
}
```

### 7. Tratamento de Erros Específicos

**Códigos de erro WhatsApp:**
```typescript
enum WhatsAppErrorCode {
  RATE_LIMIT_HIT = 80007,
  MESSAGE_UNDELIVERABLE = 131000,
  RECIPIENT_NOT_AVAILABLE = 131005,
  TEMPLATE_NOT_FOUND = 132000,
  TEMPLATE_PAUSED = 132001,
  INVALID_PARAMETER = 100,
  INSUFFICIENT_CREDIT = 2,
}

interface ErrorHandler {
  handleError(error: WhatsAppError): Promise<ErrorResponse>;
  shouldRetry(error: WhatsAppError): boolean;
  getRetryDelay(error: WhatsAppError, attempt: number): number;
}
```

### 8. Compliance e Regulamentações

**Funcionalidades de compliance:**
- **Opt-in/Opt-out:** Gerenciamento de consentimento
- **24h window:** Respeitar janela de 24h para mensagens
- **Template requirements:** Uso obrigatório de templates fora da janela
- **Content filtering:** Filtros de conteúdo para evitar spam
- **Rate limiting:** Respeitar limites de envio

### 9. Integração com WhatsApp Business API

**Funcionalidades avançadas:**
```typescript
interface BusinessProfile {
  about: string;
  address: string;
  description: string;
  email: string;
  profile_picture_url: string;
  websites: string[];
  vertical: string;
}

interface CommerceSettings {
  is_catalog_visible: boolean;
  catalog_id?: string;
}
```

### 10. Testes de Integração

**Cenários de teste:**
- Envio de todos os tipos de mensagem
- Recebimento e processamento de webhooks
- Tratamento de erros de API
- Limite de taxa e retry logic
- Fluxo completo de conversa
- Templates e aprovações
- Métricas e analytics

**Ambiente de teste:**
```typescript
interface TestEnvironment {
  test_phone_numbers: string[];
  webhook_simulator: WebhookSimulator;
  api_mocker: WhatsAppAPIMocker;
  metrics_collector: TestMetricsCollector;
}
```

**Critério de validação:**
1. Suporte a 100% dos tipos de mensagem do WhatsApp Business API
2. Webhooks devem ser processados em < 2 segundos
3. Taxa de entrega de mensagens > 95%
4. Sistema deve respeitar todos os limites de rate da API
5. Templates devem ser aprovados automaticamente quando possível
6. Métricas devem estar disponíveis em tempo real
7. Compliance deve ser 100% com regulamentações WhatsApp
8. Testes automatizados devem cobrir todos os cenários críticos

**Prioridade:** CRÍTICA - Essencial para funcionamento básico do sistema
