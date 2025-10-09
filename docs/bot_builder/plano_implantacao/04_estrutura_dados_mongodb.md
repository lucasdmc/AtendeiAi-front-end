# Estrutura de Dados MongoDB — Otimização e Integridade

**Contexto:** O MongoDB armazena fluxos, execuções e dados relacionados, mas a estrutura atual pode não estar otimizada para queries frequentes e pode carecer de índices apropriados.

**Lacuna identificada:** Falta de índices otimizados, estrutura de dados não normalizada adequadamente, e ausência de constraints de integridade referencial.

**Impacto:** Performance degradada em queries complexas, possibilidade de dados inconsistentes, e dificuldade de manutenção de integridade referencial.

**Implementação necessária:**

### 1. Otimização da Collection `flows`

**Estrutura atual a revisar:**
```typescript
interface IFlow {
  _id: ObjectId;
  name: string;
  institution_id: string;
  chatbot_id?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  settings: FlowSettings;
  is_active: boolean;
  is_template: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}
```

**Melhorias necessárias:**
- **Versionamento:** Adicionar `version` para controle de mudanças
- **Metadata:** Adicionar `tags`, `category`, `description`
- **Analytics:** Adicionar contadores de execução e estatísticas
- **Backup:** Adicionar `backup_data` para recuperação

**Índices obrigatórios:**
```javascript
// Queries por instituição (mais comum)
db.flows.createIndex({ "institution_id": 1, "is_active": 1 })

// Queries por chatbot
db.flows.createIndex({ "chatbot_id": 1 })

// Busca textual
db.flows.createIndex({ 
  "name": "text", 
  "description": "text", 
  "tags": "text" 
})

// Ordenação por data
db.flows.createIndex({ "updated_at": -1 })

// Templates
db.flows.createIndex({ "is_template": 1, "category": 1 })
```

### 2. Otimização da Collection `flowexecutions`

**Estrutura a implementar:**
```typescript
interface IFlowExecution {
  _id: ObjectId;
  flow_id: ObjectId;
  institution_id: string;        // Desnormalizado para queries
  conversation_id: string;
  contact_id: string;
  chatbot_id: string;
  
  // Estado da execução
  status: ExecutionStatus;
  current_node_id?: string;
  started_at: Date;
  completed_at?: Date;
  
  // Dados da execução
  variables: Record<string, any>;
  waiting_state?: WaitingState;
  
  // Histórico
  steps: ExecutionStep[];
  
  // Métricas
  total_duration_ms?: number;
  nodes_executed: number;
  errors_count: number;
  
  // TTL para limpeza automática
  expires_at: Date;
}
```

**Índices críticos:**
```javascript
// Execuções ativas por conversa
db.flowexecutions.createIndex({ 
  "conversation_id": 1, 
  "status": 1 
})

// Cleanup de execuções antigas
db.flowexecutions.createIndex({ 
  "expires_at": 1 
}, { expireAfterSeconds: 0 })

// Analytics por instituição
db.flowexecutions.createIndex({ 
  "institution_id": 1, 
  "started_at": -1 
})

// Execuções por fluxo
db.flowexecutions.createIndex({ 
  "flow_id": 1, 
  "status": 1 
})
```

### 3. Collection `flow_analytics` (nova)

**Propósito:** Armazenar métricas agregadas para dashboards e relatórios

**Estrutura:**
```typescript
interface FlowAnalytics {
  _id: ObjectId;
  flow_id: ObjectId;
  institution_id: string;
  date: Date;                    // Agregação diária
  
  // Métricas de execução
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_ms: number;
  
  // Métricas por nó
  node_metrics: {
    node_id: string;
    node_type: string;
    executions: number;
    avg_duration_ms: number;
    error_rate: number;
  }[];
  
  // Pontos de saída
  exit_points: {
    node_id: string;
    count: number;
    reason: 'completed' | 'failed' | 'transferred' | 'timeout';
  }[];
}
```

### 4. Constraints e Validações

**Arquivo:** `src/models/Flow.ts` (expandir validações)

**Validações de schema:**
- **Referential integrity:** Verificar se `chatbot_id` existe
- **Node consistency:** Validar que edges referenciam nós existentes
- **Data validation:** Validar estrutura específica de cada tipo de nó
- **Business rules:** Aplicar regras de negócio (ex: máx 100 nós por fluxo)

**Middleware de validação:**
```typescript
FlowSchema.pre('save', async function() {
  // Validar integridade referencial
  if (this.chatbot_id) {
    const chatbot = await Chatbot.findById(this.chatbot_id);
    if (!chatbot) throw new Error('Chatbot not found');
  }
  
  // Validar estrutura do grafo
  const validation = validateFlowStructure(this.nodes, this.edges);
  if (!validation.valid) {
    throw new Error(`Flow validation failed: ${validation.errors.join(', ')}`);
  }
});
```

### 5. Migrations e Versionamento

**Sistema de migração:**
- **Schema versioning:** Controlar versão da estrutura de dados
- **Data migration:** Scripts para migrar dados existentes
- **Rollback capability:** Possibilidade de reverter migrações
- **Zero-downtime:** Migrações que não interrompem o serviço

**Estrutura de migração:**
```typescript
interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  validate: () => Promise<boolean>;
}
```

### 6. Backup e Recuperação

**Estratégia de backup:**
- **Point-in-time recovery:** Backup contínuo com oplog
- **Selective backup:** Backup por instituição
- **Compressed storage:** Compressão de dados históricos
- **Cross-region replication:** Réplicas em múltiplas regiões

### 7. Monitoramento de Performance

**Métricas a monitorar:**
- Tempo de resposta das queries principais
- Utilização de índices
- Tamanho das collections
- Fragmentação dos dados
- Cache hit ratio

**Alertas:**
- Query lenta (> 100ms)
- Índice não utilizado
- Collection muito grande (> 1GB)
- Replicação atrasada (> 1s)

**Critério de validação:**
1. Todas as queries principais devem executar em < 100ms
2. Índices devem cobrir 95% das queries
3. Integridade referencial deve ser mantida em 100% dos casos
4. Migrações devem executar sem perda de dados
5. Backup/restore deve funcionar em < 30 minutos
6. Analytics devem estar disponíveis em tempo real (< 5 minutos de delay)

**Prioridade:** MÉDIA-ALTA - Importante para performance e integridade dos dados
