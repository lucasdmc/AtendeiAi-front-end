# Validação de Integridade de Fluxos — Implementação Completa

**Contexto:** O sistema precisa garantir que fluxos criados no editor visual sejam logicamente válidos e executáveis antes da ativação.

**Lacuna identificada:** Validações de integridade insuficientes tanto no frontend quanto no backend, permitindo criação de fluxos inválidos.

**Impacto:** Fluxos com erros estruturais são ativados e falham durante execução, causando experiência ruim para usuários finais e dificuldade de debug.

**Implementação necessária:**

### 1. Validações Frontend (Pré-salvamento)

**Arquivo:** `src/lib/flowValidation.ts` (expandir funcionalidades)

**Validações obrigatórias:**
- **Nó inicial único:** Exatamente um nó `start-channel` ou `start-manual`
- **Conectividade:** Todos os nós devem estar conectados ao grafo principal
- **Nós órfãos:** Identificar nós sem conexões de entrada ou saída
- **Loops infinitos:** Detectar ciclos sem condições de saída
- **Dados obrigatórios:** Cada tipo de nó deve ter dados mínimos configurados
- **Caminhos válidos:** Todo caminho deve levar a um nó de finalização

**Validações específicas por tipo:**
- **start-channel:** Deve ter pelo menos um canal selecionado
- **action-message:** Deve ter pelo menos um bloco de conteúdo
- **ask-*:** Deve ter campo de destino configurado
- **action-choose:** Deve ter pelo menos 2 opções válidas
- **integration-webhook:** Endpoint e método HTTP obrigatórios

### 2. Validações Backend (Pré-ativação)

**Arquivo:** `src/controllers/flows.ts` (método `activate`)

**Validações de negócio:**
- **Recursos existentes:** Verificar se canais, setores, agentes referenciados existem
- **Permissões:** Validar se instituição tem acesso aos recursos utilizados
- **Limites:** Verificar quotas de execução e recursos
- **Dependências:** Confirmar que integrações externas estão funcionais

### 3. Sistema de Relatório de Erros

**Estrutura do relatório:**
```typescript
interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    criticalErrors: number;
    warnings: number;
    affectedNodes: string[];
  };
}

interface ValidationError {
  type: 'structural' | 'data' | 'business';
  severity: 'critical' | 'error' | 'warning';
  nodeId?: string;
  message: string;
  suggestion?: string;
}
```

### 4. Interface de Validação no Editor

**Componente:** `ValidationPanel.tsx` (novo)

**Funcionalidades:**
- Exibir erros em tempo real durante edição
- Destacar nós com problemas no canvas
- Sugerir correções automáticas quando possível
- Bloquear salvamento/ativação até resolução de erros críticos

### 5. Validação Contínua

**Implementar:**
- Validação automática a cada alteração no canvas
- Debounce para evitar validações excessivas
- Cache de resultados para otimizar performance
- Indicadores visuais no toolbar (ícone de status)

**Critério de validação:**
1. Editor deve impedir salvamento de fluxos com erros críticos
2. Relatório de validação deve identificar todos os problemas estruturais
3. Sugestões de correção devem ser precisas e acionáveis
4. Performance da validação deve ser < 100ms para fluxos de até 50 nós
5. Fluxos validados devem executar sem falhas estruturais

**Prioridade:** ALTA - Essencial para qualidade e confiabilidade do sistema
