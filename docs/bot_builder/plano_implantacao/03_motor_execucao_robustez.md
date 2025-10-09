# Motor de Execução — Robustez e Recuperação de Erros

**Contexto:** O FlowExecutionEngine é responsável por executar fluxos em produção, mas carece de mecanismos robustos de recuperação de erros e tratamento de edge cases.

**Lacuna identificada:** Tratamento insuficiente de cenários de erro, falta de recuperação automática e logging inadequado para debug de problemas em produção.

**Impacto:** Execuções de fluxo falham silenciosamente, usuários ficam presos em estados inconsistentes, e é difícil diagnosticar problemas em produção.

**Implementação necessária:**

### 1. Sistema de Recuperação de Erros

**Arquivo:** `src/services/FlowExecutionEngine.ts` (expandir)

**Cenários de recuperação:**
- **Nó não encontrado:** Tentar encontrar nó alternativo ou finalizar graciosamente
- **Processador falhou:** Retry com backoff exponencial (máx 3 tentativas)
- **Timeout de execução:** Finalizar execução e notificar usuário
- **Dados corrompidos:** Limpar estado e reiniciar do último ponto válido
- **Dependência indisponível:** Usar fallback ou aguardar reconexão

### 2. Estados de Execução Expandidos

**Arquivo:** `src/models/FlowExecution.ts` (atualizar enum)

**Novos estados:**
```typescript
enum ExecutionStatus {
  // Estados existentes
  'running' | 'waiting_input' | 'waiting_delay' | 'completed' | 'failed' | 'cancelled',
  
  // Novos estados
  'recovering',      // Tentando recuperar de erro
  'paused',         // Pausado por intervenção manual
  'timeout',        // Timeout atingido
  'fallback',       // Executando fluxo de fallback
  'degraded'        // Funcionando com funcionalidade reduzida
}
```

### 3. Mecanismo de Fallback

**Implementação:**
- **Fallback por nó:** Cada nó pode definir comportamento alternativo
- **Fallback global:** Fluxo padrão quando execução principal falha
- **Escalação:** Transferir para atendente humano em último caso

**Configuração no fluxo:**
```typescript
interface FlowSettings {
  fallback: {
    enabled: boolean;
    maxRetries: number;
    timeoutSeconds: number;
    fallbackFlowId?: string;
    escalateToHuman: boolean;
  };
}
```

### 4. Logging Estruturado

**Arquivo:** `src/services/FlowExecutionEngine.ts` (adicionar)

**Níveis de log:**
- **DEBUG:** Entrada/saída de cada nó
- **INFO:** Início/fim de execução, mudanças de estado
- **WARN:** Tentativas de retry, degradação de serviço
- **ERROR:** Falhas de execução, dados corrompidos
- **CRITICAL:** Falhas sistêmicas que afetam múltiplas execuções

**Estrutura do log:**
```typescript
interface ExecutionLog {
  timestamp: string;
  level: LogLevel;
  executionId: string;
  nodeId?: string;
  nodeType?: string;
  message: string;
  context: {
    institutionId: string;
    conversationId: string;
    contactId: string;
    duration?: number;
    error?: Error;
    metadata?: Record<string, any>;
  };
}
```

### 5. Monitoramento e Alertas

**Métricas a coletar:**
- Taxa de sucesso por tipo de nó
- Tempo médio de execução por fluxo
- Frequência de erros por instituição
- Utilização de recursos (CPU, memória)
- Filas de execução (tamanho, tempo de espera)

**Alertas automáticos:**
- Taxa de erro > 5% em 5 minutos
- Tempo de execução > 30 segundos
- Fila de execução > 100 itens pendentes
- Memória utilizada > 80%

### 6. Interface de Debug

**Componente:** `ExecutionDebugger.tsx` (novo)

**Funcionalidades:**
- Visualizar execução em tempo real
- Inspecionar estado de variáveis
- Pausar/retomar execução
- Forçar transição para próximo nó
- Visualizar logs da execução

### 7. Testes de Resiliência

**Cenários de teste:**
- Simular falha de processadores
- Injetar latência em operações
- Corromper dados de execução
- Desconectar dependências externas
- Sobrecarregar sistema com execuções simultâneas

**Critério de validação:**
1. Sistema deve se recuperar automaticamente de 90% dos erros temporários
2. Execuções nunca devem ficar em estado inconsistente permanente
3. Logs devem permitir rastreamento completo de problemas
4. Tempo de recuperação deve ser < 30 segundos para erros comuns
5. Taxa de escalação para humanos deve ser < 1% das execuções
6. Sistema deve manter funcionalidade básica mesmo com 50% dos serviços indisponíveis

**Prioridade:** ALTA - Crítico para estabilidade em produção
