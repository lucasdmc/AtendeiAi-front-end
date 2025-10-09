# Sincronização Frontend-Backend — Lacunas Críticas

**Contexto:** O frontend utiliza ReactFlow com tipos de nós específicos, enquanto o backend possui processadores com nomenclaturas diferentes. Esta divergência impede a execução correta dos fluxos criados no editor.

**Lacuna identificada:** Inconsistência na nomenclatura e mapeamento de tipos de nós entre frontend e backend.

**Evidências das inconsistências:**

### Frontend (ReactFlow)
```
- start-channel
- start-manual  
- action-message
- action-transfer-sector
- action-transfer-agent
- action-transfer-ai
- action-choose
- ask-question, ask-name, ask-email, ask-number, ask-date, ask-file
- action-waiting-status
- action-privacy
- action-waiting-flow
- action-wait
- end-conversation
- integration-webhook
```

### Backend (Processadores)
```
- start-by-channel (diverge do frontend)
- start-manually (diverge do frontend)
- send-message (diverge do frontend)
- ask-to-choose (diverge do frontend)
- util-wait (diverge do frontend)
- util-privacy (diverge do frontend)
- util-end-conversation (diverge do frontend)
- util-transfer-to-sector (diverge do frontend)
- util-transfer-to-agent (diverge do frontend)
- util-transfer-to-ai-agent (diverge do frontend)
```

**Impacto:** Fluxos salvos no frontend não são reconhecidos pelo motor de execução do backend, resultando em falha na execução dos chatbots.

**Implementação necessária:**

### 1. Unificação da Nomenclatura
- **Decisão:** Adotar a nomenclatura do frontend como padrão
- **Ação:** Atualizar todos os processadores backend para usar os tipos do frontend
- **Arquivos a modificar:**
  - `src/services/NodeProcessor.ts` - Atualizar registro de processadores
  - `src/services/NodeProcessorUnified.ts` - Renomear classes dos processadores
  - `src/services/processors/*.ts` - Ajustar exports das classes
  - `src/models/Flow.ts` - Atualizar enum de tipos permitidos

### 2. Validação de Tipos no Salvamento
- **Implementar:** Middleware de validação que verifica se todos os tipos de nós do frontend têm processadores correspondentes
- **Localização:** `src/controllers/flows.ts` - método `create` e `update`
- **Comportamento:** Rejeitar salvamento se houver tipos não suportados

### 3. Mapeamento de Compatibilidade
- **Criar:** Serviço de mapeamento para conversão de tipos legados
- **Propósito:** Garantir compatibilidade com fluxos existentes durante migração
- **Implementação:** Função utilitária que converte tipos antigos para novos

**Critério de validação:**
1. Todos os tipos de nós do frontend devem ter processadores correspondentes no backend
2. Fluxo criado no editor deve ser salvo e executado sem erros de tipo
3. Teste de round-trip: salvar fluxo no frontend → carregar do backend → executar → verificar comportamento esperado
4. Executar suite de testes automatizados cobrindo todos os tipos de nós

**Prioridade:** CRÍTICA - Bloqueia funcionalidade básica do sistema
