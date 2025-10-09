# Processadores de Nós — Implementação Especializada

**Contexto:** Cada tipo de nó requer processamento específico com validações, transformações e integrações particulares. Os processadores atuais podem estar incompletos ou carecer de funcionalidades avançadas.

**Lacuna identificada:** Processadores com funcionalidades básicas, falta de validações robustas, ausência de fallbacks, e integração limitada com serviços externos.

**Impacto:** Nós não funcionam conforme esperado, validações insuficientes causam erros em runtime, e falta de integração limita funcionalidades avançadas.

**Implementação necessária:**

### 1. Processadores de Nós de Pergunta (Ask Nodes)

**Arquivo:** `src/services/processors/AdvancedAskProcessors.ts` (expandir)

#### AskEmailProcessor
**Validações necessárias:**
- Formato de email (regex avançado)
- Domínios bloqueados/permitidos
- Verificação de MX record (opcional)
- Detecção de emails temporários

**Funcionalidades:**
```typescript
interface EmailValidationConfig {
  allowDisposable: boolean;
  blockedDomains: string[];
  requireMXRecord: boolean;
  customRegex?: string;
}
```

#### AskNumberProcessor
**Validações necessárias:**
- Formato numérico (inteiro/decimal)
- Ranges (min/max values)
- Formatação específica (CPF, telefone, etc.)
- Conversão de unidades

#### AskDateProcessor
**Validações necessárias:**
- Múltiplos formatos de entrada
- Validação de datas válidas
- Ranges de datas permitidas
- Conversão de timezone
- Suporte a datas relativas ("amanhã", "próxima semana")

#### AskFileProcessor
**Funcionalidades críticas:**
- Validação de tipo de arquivo
- Limite de tamanho
- Scan de vírus/malware
- Armazenamento seguro
- Geração de thumbnails (imagens)
- Extração de metadata

### 2. Processadores de Integração

#### WebhookProcessor (expandir)
**Funcionalidades avançadas:**
- **Retry logic:** Tentativas com backoff exponencial
- **Authentication:** Suporte a múltiplos tipos (Bearer, API Key, OAuth)
- **Request transformation:** Mapeamento de dados complexos
- **Response parsing:** Extração de dados da resposta
- **Error handling:** Tratamento específico por código de erro
- **Rate limiting:** Respeitar limites da API externa

**Configuração:**
```typescript
interface WebhookConfig {
  endpoint: string;
  method: HttpMethod;
  authentication: AuthConfig;
  headers: Record<string, string>;
  bodyTemplate: string;
  responseMapping: ResponseMapping[];
  retryConfig: RetryConfig;
  timeoutMs: number;
}
```

### 3. Processadores de Transferência

#### TransferToAgentProcessor
**Funcionalidades:**
- **Agent selection:** Algoritmos de seleção (round-robin, least-busy, skill-based)
- **Queue management:** Gerenciamento de filas de atendimento
- **Escalation rules:** Regras de escalação automática
- **Context transfer:** Transferência completa do contexto da conversa
- **Availability check:** Verificação de disponibilidade do agente

#### TransferToSectorProcessor
**Funcionalidades:**
- **Sector routing:** Roteamento inteligente por setor
- **Business hours:** Respeitar horários de funcionamento
- **Overflow handling:** Redirecionamento quando setor lotado
- **Priority queuing:** Filas com prioridade

### 4. Processadores de Ação

#### SendMessageProcessor (expandir)
**Tipos de mensagem suportados:**
- **Text:** Texto simples com formatação
- **Rich text:** Markdown, HTML limitado
- **Media:** Imagens, vídeos, áudios, documentos
- **Interactive:** Botões, listas, carrosséis
- **Location:** Compartilhamento de localização
- **Contact:** Compartilhamento de contato

**Funcionalidades:**
- **Template variables:** Substituição de variáveis dinâmicas
- **Personalization:** Personalização baseada no perfil do usuário
- **A/B testing:** Testes de diferentes versões de mensagem
- **Scheduling:** Agendamento de mensagens
- **Delivery tracking:** Rastreamento de entrega e leitura

### 5. Processadores de Condição (novos)

#### ConditionalProcessor
**Tipos de condição:**
- **Variable comparison:** Comparação de variáveis
- **Time-based:** Condições baseadas em horário/data
- **User attributes:** Condições baseadas em atributos do usuário
- **External data:** Condições baseadas em dados externos
- **Complex logic:** Condições com AND/OR/NOT

**Implementação:**
```typescript
interface Condition {
  type: 'variable' | 'time' | 'attribute' | 'external' | 'complex';
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'regex';
  leftOperand: string | number | boolean;
  rightOperand: string | number | boolean;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  subConditions?: Condition[];
}
```

### 6. Sistema de Variáveis

**Funcionalidades:**
- **Variable scoping:** Escopo de variáveis (global, flow, conversation)
- **Type system:** Sistema de tipos (string, number, boolean, date, object)
- **Persistence:** Persistência de variáveis entre execuções
- **Encryption:** Criptografia de variáveis sensíveis
- **Validation:** Validação de tipos e valores

**Implementação:**
```typescript
interface Variable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  value: any;
  scope: 'global' | 'flow' | 'conversation';
  encrypted: boolean;
  persistent: boolean;
  ttl?: number;
}
```

### 7. Sistema de Templates

**Funcionalidades:**
- **Message templates:** Templates para mensagens
- **Variable interpolation:** Interpolação de variáveis
- **Conditional content:** Conteúdo condicional
- **Loops:** Iteração sobre arrays
- **Filters:** Filtros para formatação (uppercase, date format, etc.)

**Sintaxe:**
```handlebars
Olá {{user.name}},
{{#if user.premium}}
  Você tem acesso premium!
{{else}}
  Considere fazer upgrade para premium.
{{/if}}

Seus pedidos:
{{#each orders}}
  - {{this.name}}: R$ {{this.price | currency}}
{{/each}}
```

### 8. Testes Automatizados

**Testes por processador:**
- **Unit tests:** Testes isolados de cada processador
- **Integration tests:** Testes de integração com dependências
- **End-to-end tests:** Testes de fluxo completo
- **Performance tests:** Testes de performance e carga
- **Error scenarios:** Testes de cenários de erro

**Framework de teste:**
```typescript
interface ProcessorTest {
  name: string;
  nodeConfig: any;
  input: any;
  expectedOutput: any;
  expectedError?: string;
  timeout?: number;
}
```

**Critério de validação:**
1. Todos os processadores devem ter cobertura de teste > 90%
2. Validações devem capturar 100% dos casos de entrada inválida
3. Integração com APIs externas deve ter fallback funcional
4. Performance deve ser < 500ms para processadores síncronos
5. Processadores assíncronos devem ter timeout configurável
6. Sistema de variáveis deve suportar 1000+ variáveis por conversa
7. Templates devem ser renderizados em < 100ms
8. Retry logic deve funcionar corretamente em cenários de falha

**Prioridade:** ALTA - Essencial para funcionalidade completa dos fluxos
