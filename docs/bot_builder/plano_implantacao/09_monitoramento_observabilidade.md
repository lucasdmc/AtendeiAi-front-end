# Monitoramento e Observabilidade — Sistema Completo

**Contexto:** Um sistema de Bot Builder em produção requer monitoramento abrangente para detectar problemas, otimizar performance e garantir SLA adequado.

**Lacuna identificada:** Ausência de sistema de monitoramento estruturado, logs não padronizados, falta de métricas de negócio e alertas proativos.

**Impacto:** Dificuldade para detectar problemas em produção, tempo de resolução elevado, e falta de visibilidade sobre performance e uso do sistema.

**Implementação necessária:**

### 1. Sistema de Logging Estruturado

**Framework:** Winston + ELK Stack (Elasticsearch, Logstash, Kibana)

#### Configuração de Logs Backend
**Arquivo:** `src/config/logger.ts` (novo)

```typescript
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

interface LogContext {
  institutionId?: string;
  userId?: string;
  conversationId?: string;
  flowId?: string;
  executionId?: string;
  nodeId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'atendeai-logs'
    })
  ]
});

export const createContextLogger = (context: LogContext) => {
  return {
    debug: (message: string, meta?: any) => 
      logger.debug(message, { ...context, ...meta }),
    info: (message: string, meta?: any) => 
      logger.info(message, { ...context, ...meta }),
    warn: (message: string, meta?: any) => 
      logger.warn(message, { ...context, ...meta }),
    error: (message: string, error?: Error, meta?: any) => 
      logger.error(message, { ...context, error: error?.stack, ...meta })
  };
};
```

#### Middleware de Request Logging
**Arquivo:** `src/middlewares/requestLogger.ts` (novo)

```typescript
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  req.requestId = requestId;
  req.logger = createContextLogger({
    requestId,
    userId: req.user?.id,
    institutionId: req.query.institution_id as string,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  req.logger.info('Request started', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: sanitizeLogData(req.body)
  });
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
};
```

### 2. Métricas de Sistema

**Framework:** Prometheus + Grafana

#### Métricas de Aplicação
**Arquivo:** `src/middlewares/metrics.ts` (novo)

```typescript
import client from 'prom-client';

// Métricas HTTP
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Métricas de Fluxo
const flowExecutionDuration = new client.Histogram({
  name: 'flow_execution_duration_seconds',
  help: 'Duration of flow executions',
  labelNames: ['flow_id', 'status', 'institution_id'],
  buckets: [1, 5, 10, 30, 60, 300]
});

const flowExecutionTotal = new client.Counter({
  name: 'flow_executions_total',
  help: 'Total number of flow executions',
  labelNames: ['flow_id', 'status', 'institution_id']
});

const activeExecutions = new client.Gauge({
  name: 'active_flow_executions',
  help: 'Number of currently active flow executions',
  labelNames: ['institution_id']
});

// Métricas de Nós
const nodeProcessingDuration = new client.Histogram({
  name: 'node_processing_duration_seconds',
  help: 'Duration of node processing',
  labelNames: ['node_type', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const nodeProcessingErrors = new client.Counter({
  name: 'node_processing_errors_total',
  help: 'Total number of node processing errors',
  labelNames: ['node_type', 'error_type']
});
```

#### Métricas de WhatsApp
```typescript
const whatsappMessagesSent = new client.Counter({
  name: 'whatsapp_messages_sent_total',
  help: 'Total WhatsApp messages sent',
  labelNames: ['message_type', 'institution_id']
});

const whatsappMessagesDelivered = new client.Counter({
  name: 'whatsapp_messages_delivered_total',
  help: 'Total WhatsApp messages delivered',
  labelNames: ['institution_id']
});

const whatsappApiErrors = new client.Counter({
  name: 'whatsapp_api_errors_total',
  help: 'Total WhatsApp API errors',
  labelNames: ['error_code', 'institution_id']
});
```

### 3. Health Checks

**Arquivo:** `src/routes/health.ts` (novo)

```typescript
interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

class HealthChecker {
  async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      return {
        name: 'database',
        status: 'healthy',
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  async checkRedis(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await redisClient.ping();
      return {
        name: 'redis',
        status: 'healthy',
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        name: 'redis',
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  async checkWhatsAppAPI(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      const response = await whatsappService.checkHealth();
      return {
        name: 'whatsapp_api',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        details: { rateLimitRemaining: response.rateLimitRemaining }
      };
    } catch (error) {
      return {
        name: 'whatsapp_api',
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

router.get('/health', async (req, res) => {
  const checker = new HealthChecker();
  const checks = await Promise.all([
    checker.checkDatabase(),
    checker.checkRedis(),
    checker.checkWhatsAppAPI()
  ]);
  
  const overall = checks.every(c => c.status === 'healthy') 
    ? 'healthy' 
    : checks.some(c => c.status === 'unhealthy') 
      ? 'unhealthy' 
      : 'degraded';
  
  const statusCode = overall === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json({
    status: overall,
    timestamp: new Date().toISOString(),
    checks
  });
});
```

### 4. Alertas e Notificações

**Framework:** AlertManager + Slack/Email

#### Configuração de Alertas
**Arquivo:** `monitoring/alerts.yml`

```yaml
groups:
  - name: atendeai_alerts
    rules:
      # Alta taxa de erro
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% for the last 5 minutes"
      
      # Execuções de fluxo falhando
      - alert: FlowExecutionFailures
        expr: rate(flow_executions_total{status="failed"}[5m]) > 0.1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High flow execution failure rate"
          description: "Flow execution failure rate is {{ $value }}% for institution {{ $labels.institution_id }}"
      
      # WhatsApp API com problemas
      - alert: WhatsAppAPIDown
        expr: up{job="whatsapp_health_check"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "WhatsApp API is down"
          description: "WhatsApp API health check is failing"
      
      # Banco de dados lento
      - alert: DatabaseSlowQueries
        expr: mongodb_op_latencies_histogram{quantile="0.95"} > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database queries are slow"
          description: "95th percentile query time is {{ $value }}ms"
      
      # Memória alta
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB"
```

### 5. Dashboards

#### Dashboard Principal - Grafana
**Arquivo:** `monitoring/dashboards/main.json`

**Painéis principais:**
1. **System Overview**
   - Request rate, error rate, response time
   - Active users, active executions
   - System resources (CPU, memory, disk)

2. **Flow Performance**
   - Executions per minute
   - Success/failure rates by flow
   - Average execution time
   - Most used flows

3. **Node Performance**
   - Processing time by node type
   - Error rates by node type
   - Most problematic nodes

4. **WhatsApp Integration**
   - Messages sent/delivered/read
   - API response times
   - Error rates by error code
   - Template performance

5. **Business Metrics**
   - Conversations started
   - Conversion rates
   - User satisfaction scores
   - Revenue attribution

### 6. Distributed Tracing

**Framework:** Jaeger + OpenTelemetry

```typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

class TracedFlowExecutionEngine {
  async executeNode(execution: IFlowExecution, node: FlowNode): Promise<any> {
    const tracer = trace.getTracer('flow-execution-engine');
    
    return tracer.startActiveSpan(`execute-node-${node.type}`, async (span) => {
      span.setAttributes({
        'flow.id': execution.flow_id.toString(),
        'execution.id': execution._id.toString(),
        'node.id': node.id,
        'node.type': node.type,
        'institution.id': execution.institution_id
      });
      
      try {
        const result = await this.nodeProcessor.processNode(node, execution);
        
        span.setAttributes({
          'node.success': result.success,
          'node.duration': result.duration || 0
        });
        
        if (!result.success) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: result.error || 'Node processing failed'
          });
        }
        
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
```

### 7. Análise de Performance

#### APM (Application Performance Monitoring)
**Framework:** New Relic / DataDog

**Métricas a monitorar:**
- **Apdex Score:** Satisfação do usuário
- **Throughput:** Requisições por minuto
- **Response Time:** Tempo de resposta percentis
- **Error Rate:** Taxa de erro por endpoint
- **Database Performance:** Queries lentas, conexões
- **External Services:** Latência de APIs externas

#### Profiling
```typescript
import { performance } from 'perf_hooks';

class PerformanceProfiler {
  private profiles: Map<string, number[]> = new Map();
  
  startProfile(name: string): string {
    const profileId = `${name}-${Date.now()}`;
    const start = performance.now();
    this.profiles.set(profileId, [start]);
    return profileId;
  }
  
  endProfile(profileId: string): number {
    const profile = this.profiles.get(profileId);
    if (!profile) return 0;
    
    const end = performance.now();
    const duration = end - profile[0];
    
    // Log performance metrics
    performanceLogger.info('Performance profile', {
      profileId,
      duration,
      operation: profileId.split('-')[0]
    });
    
    this.profiles.delete(profileId);
    return duration;
  }
}
```

### 8. Monitoramento de Frontend

#### Real User Monitoring (RUM)
```typescript
// Frontend monitoring
class FrontendMonitoring {
  trackPageLoad(page: string) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    analytics.track('page_load', {
      page,
      loadTime,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }
  
  trackUserAction(action: string, data?: any) {
    analytics.track('user_action', {
      action,
      timestamp: Date.now(),
      data
    });
  }
  
  trackError(error: Error, context?: any) {
    analytics.track('frontend_error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }
}
```

### 9. SLA e SLO

#### Service Level Objectives
```yaml
slos:
  - name: "API Availability"
    target: 99.9%
    window: "30d"
    metric: "up"
  
  - name: "Response Time"
    target: "95% < 500ms"
    window: "24h"
    metric: "http_request_duration_seconds"
  
  - name: "Flow Execution Success Rate"
    target: 99%
    window: "24h"
    metric: "flow_executions_total"
  
  - name: "WhatsApp Message Delivery"
    target: 98%
    window: "24h"
    metric: "whatsapp_messages_delivered_total"
```

**Critério de validação:**
1. Logs estruturados devem estar disponíveis em tempo real
2. Métricas principais devem ser coletadas com < 1 minuto de delay
3. Alertas críticos devem ser enviados em < 30 segundos
4. Dashboards devem carregar em < 3 segundos
5. Health checks devem responder em < 1 segundo
6. Distributed tracing deve cobrir 100% das execuções de fluxo
7. SLOs devem ser monitorados automaticamente
8. Relatórios de performance devem ser gerados semanalmente

**Prioridade:** ALTA - Essencial para operação confiável em produção
