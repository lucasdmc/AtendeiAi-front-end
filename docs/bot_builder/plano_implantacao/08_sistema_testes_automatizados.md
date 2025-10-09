# Sistema de Testes Automatizados — Cobertura Completa

**Contexto:** Um sistema complexo como o Bot Builder requer uma suite robusta de testes automatizados para garantir qualidade, prevenir regressões e facilitar refatorações.

**Lacuna identificada:** Ausência de testes automatizados abrangentes, falta de testes de integração entre frontend e backend, e ausência de testes end-to-end que simulem fluxos completos.

**Impacto:** Alto risco de bugs em produção, dificuldade para refatorar código com segurança, e tempo excessivo gasto em testes manuais.

**Implementação necessária:**

### 1. Estrutura de Testes Frontend

**Framework:** Jest + React Testing Library + Cypress

#### Testes Unitários - Componentes
**Diretório:** `src/components/__tests__/`

**Componentes críticos a testar:**
```typescript
// EditorToolbar.test.tsx
describe('EditorToolbar', () => {
  test('should enable save button when flow is dirty');
  test('should disable undo when no history');
  test('should show correct flow name');
  test('should handle save operation');
});

// FlowCanvas.test.tsx
describe('FlowCanvas', () => {
  test('should render nodes correctly');
  test('should handle node drag and drop');
  test('should create connections between nodes');
  test('should validate node connections');
});

// BlockLibraryPanel.test.tsx
describe('BlockLibraryPanel', () => {
  test('should filter blocks by search term');
  test('should handle block drag start');
  test('should categorize blocks correctly');
});
```

#### Testes de Integração - Stores
**Diretório:** `src/stores/__tests__/`

```typescript
// editorStore.test.ts
describe('EditorStore', () => {
  test('should load flow data correctly');
  test('should maintain undo/redo history');
  test('should validate flow before save');
  test('should handle concurrent operations');
});
```

#### Testes de Serviços
**Diretório:** `src/services/__tests__/`

```typescript
// flowsService.test.ts
describe('FlowsService', () => {
  test('should create flow with valid data');
  test('should handle API errors gracefully');
  test('should retry failed requests');
  test('should validate response data');
});
```

### 2. Estrutura de Testes Backend

**Framework:** Jest + Supertest + MongoDB Memory Server

#### Testes Unitários - Processadores
**Diretório:** `src/services/processors/__tests__/`

```typescript
// SendMessageProcessor.test.ts
describe('SendMessageProcessor', () => {
  test('should process text message correctly');
  test('should handle media messages');
  test('should validate message data');
  test('should handle template variables');
});

// AskEmailProcessor.test.ts
describe('AskEmailProcessor', () => {
  test('should validate email format');
  test('should reject invalid emails');
  test('should handle domain restrictions');
  test('should set waiting state correctly');
});
```

#### Testes de Integração - Controllers
**Diretório:** `src/controllers/__tests__/`

```typescript
// flows.test.ts
describe('FlowController', () => {
  describe('POST /flows', () => {
    test('should create flow with valid data');
    test('should reject invalid flow structure');
    test('should require authentication');
    test('should validate institution ownership');
  });
  
  describe('POST /flows/:id/activate', () => {
    test('should activate valid flow');
    test('should reject flow with validation errors');
    test('should update flow status');
  });
});
```

#### Testes do Motor de Execução
**Diretório:** `src/services/__tests__/`

```typescript
// FlowExecutionEngine.test.ts
describe('FlowExecutionEngine', () => {
  test('should execute simple linear flow');
  test('should handle conditional branches');
  test('should manage waiting states');
  test('should recover from errors');
  test('should timeout long executions');
  test('should handle concurrent executions');
});
```

### 3. Testes End-to-End

**Framework:** Cypress

#### Cenários Críticos
**Diretório:** `cypress/e2e/`

```typescript
// flow-creation.cy.ts
describe('Flow Creation', () => {
  it('should create complete flow from scratch', () => {
    // Login
    cy.login('admin@test.com', 'password');
    
    // Navigate to editor
    cy.visit('/settings/chatbots/editor');
    
    // Add start node
    cy.get('[data-test="add-block-button"]').click();
    cy.get('[data-test="action-card-start-channel"]').click();
    
    // Configure start node
    cy.get('[data-test="channel-select"]').select('WhatsApp');
    
    // Add message node
    cy.get('[data-test="add-block-button"]').click();
    cy.get('[data-test="action-card-action-message"]').click();
    
    // Connect nodes
    cy.connectNodes('start-channel-1', 'action-message-1');
    
    // Save flow
    cy.get('[data-test="save-button"]').click();
    cy.get('[data-test="flow-name-input"]').type('Test Flow');
    cy.get('[data-test="confirm-save"]').click();
    
    // Verify save
    cy.contains('Fluxo salvo com sucesso');
  });
});

// flow-execution.cy.ts
describe('Flow Execution', () => {
  it('should execute flow correctly', () => {
    // Create and activate flow
    cy.createTestFlow();
    cy.activateFlow();
    
    // Simulate WhatsApp message
    cy.simulateWhatsAppMessage('+5511999999999', 'Olá');
    
    // Verify response
    cy.verifyWhatsAppResponse('Bem-vindo ao nosso atendimento!');
  });
});
```

### 4. Testes de Performance

**Framework:** k6 + Artillery

#### Load Testing
**Arquivo:** `tests/performance/load-test.js`

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  // Test flow creation
  let response = http.post('/api/v1/flows', {
    name: 'Load Test Flow',
    nodes: generateTestNodes(),
    edges: generateTestEdges(),
  });
  
  check(response, {
    'flow created': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

#### Stress Testing
```javascript
// Test flow execution under load
export default function() {
  let response = http.post('/api/v1/flows/test-flow-id/execute', {
    input: 'Test message',
    context: generateTestContext(),
  });
  
  check(response, {
    'execution successful': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}
```

### 5. Testes de Integração WhatsApp

**Mock Server:** Wiremock

```typescript
// whatsapp-integration.test.ts
describe('WhatsApp Integration', () => {
  beforeEach(() => {
    // Setup WhatsApp API mock
    setupWhatsAppMock();
  });
  
  test('should send text message', async () => {
    const message = await whatsappService.sendMessage({
      to: '+5511999999999',
      text: 'Hello World',
    });
    
    expect(message.status).toBe('sent');
    expect(mockWhatsAppAPI.getLastRequest()).toMatchObject({
      messaging_product: 'whatsapp',
      to: '+5511999999999',
      text: { body: 'Hello World' },
    });
  });
  
  test('should handle webhook correctly', async () => {
    const webhook = generateWebhookPayload();
    
    const response = await request(app)
      .post('/webhooks/whatsapp')
      .send(webhook)
      .expect(200);
    
    // Verify flow execution was triggered
    const execution = await FlowExecution.findOne({
      conversation_id: webhook.entry[0].changes[0].value.messages[0].id
    });
    
    expect(execution).toBeTruthy();
    expect(execution.status).toBe('running');
  });
});
```

### 6. Testes de Banco de Dados

**Framework:** MongoDB Memory Server

```typescript
// database.test.ts
describe('Database Operations', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  test('should maintain referential integrity', async () => {
    const flow = await Flow.create(testFlowData);
    const chatbot = await Chatbot.create({
      ...testChatbotData,
      flow_id: flow._id,
    });
    
    // Try to delete flow with associated chatbot
    await expect(Flow.findByIdAndDelete(flow._id))
      .rejects.toThrow('Cannot delete flow with associated chatbots');
  });
  
  test('should handle concurrent updates', async () => {
    const flow = await Flow.create(testFlowData);
    
    // Simulate concurrent updates
    const update1 = Flow.findByIdAndUpdate(flow._id, { name: 'Name 1' });
    const update2 = Flow.findByIdAndUpdate(flow._id, { name: 'Name 2' });
    
    await Promise.all([update1, update2]);
    
    const updatedFlow = await Flow.findById(flow._id);
    expect(['Name 1', 'Name 2']).toContain(updatedFlow.name);
  });
});
```

### 7. Testes de Segurança

```typescript
// security.test.ts
describe('Security', () => {
  test('should require authentication for protected routes', async () => {
    await request(app)
      .get('/api/v1/flows')
      .expect(401);
  });
  
  test('should validate institution ownership', async () => {
    const user1Token = await generateUserToken(user1);
    const user2Flow = await createFlowForUser(user2);
    
    await request(app)
      .get(`/api/v1/flows/${user2Flow._id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(403);
  });
  
  test('should sanitize input data', async () => {
    const maliciousData = {
      name: '<script>alert("xss")</script>',
      nodes: [{ data: { message: '${process.env.SECRET}' } }],
    };
    
    const response = await request(app)
      .post('/api/v1/flows')
      .set('Authorization', `Bearer ${validToken}`)
      .send(maliciousData)
      .expect(400);
    
    expect(response.body.message).toContain('Invalid input');
  });
});
```

### 8. CI/CD Pipeline

**Arquivo:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      
      - name: Run unit tests
        run: npm test -- --coverage
        working-directory: ./frontend
      
      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./frontend

  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
      redis:
        image: redis:6
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run tests
        run: npm test -- --coverage
        working-directory: ./backend
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379

  integration-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - name: Run integration tests
        run: npm run test:integration
```

### 9. Métricas de Qualidade

**Critérios mínimos:**
- **Cobertura de código:** > 80% para frontend e backend
- **Testes E2E:** Cobertura de todos os fluxos críticos
- **Performance:** Todos os testes devem executar em < 10 minutos
- **Estabilidade:** Taxa de falha < 1% em testes não relacionados a mudanças

**Ferramentas de monitoramento:**
- SonarQube para análise de código
- Codecov para cobertura
- Lighthouse para performance frontend
- Artillery para testes de carga

**Critério de validação:**
1. Suite de testes deve executar em < 10 minutos
2. Cobertura de código deve ser > 80% em todos os módulos críticos
3. Testes E2E devem cobrir 100% dos fluxos principais
4. Testes de performance devem validar SLAs definidos
5. Pipeline CI/CD deve bloquear deploys com testes falhando
6. Testes devem ser executados automaticamente em PRs
7. Relatórios de cobertura devem ser gerados automaticamente
8. Testes de segurança devem ser executados regularmente

**Prioridade:** ALTA - Essencial para manter qualidade e confiabilidade do sistema
