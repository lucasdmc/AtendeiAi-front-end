# 🎯 Plano Passo a Passo - TODOs para Conversas e Chatbots 100% Funcionais

## 📋 Objetivos Finais
- ✅ **Tela de Conversas** (`http://localhost:8080/conversations`) 100% funcional e integrada com backend
- ✅ **Tela de Chatbots** (`http://localhost:8080/chatbot`) 100% funcional e integrada com backend  
- ✅ **Editor de Fluxos** (`http://localhost:8080/settings/chatbots/editor`) 100% funcional e integrado com backend

## 🚫 Regras Importantes
- ❌ **NENHUM MOCK** no final da implementação
- ✅ **TODAS as funcionalidades** devem usar APIs reais
- ✅ **Validação obrigatória** antes de passar para próxima fase
- ✅ **Testes funcionais** em cada fase

---

## 📅 FASE 1: BACKEND FOUNDATION (Semana 1)

### 🔧 **FASE 1.1: APIs de Conversas (Dias 1-2)**

#### **Backend - Modelos e Schemas**
- [ ] **TODO-001**: Criar modelo `Session.ts` no backend
- [ ] **TODO-002**: Atualizar modelo `Conversation.ts` com campos de sessão
- [ ] **TODO-003**: Atualizar modelo `Message.ts` com `session_id`
- [ ] **TODO-004**: Criar modelo `SessionTransition.ts` para auditoria
- [ ] **TODO-005**: Criar índices de performance para sessões

#### **Backend - Endpoints de Conversas**
- [ ] **TODO-006**: Implementar `GET /api/v1/conversations` (listar com filtros por aba)
- [ ] **TODO-007**: Implementar `GET /api/v1/conversations/:id` (detalhes da conversa)
- [ ] **TODO-008**: Implementar `PUT /api/v1/conversations/:id` (atualizar conversa)
- [ ] **TODO-009**: Implementar `POST /api/v1/conversations/:id/close` (encerrar conversa)
- [ ] **TODO-010**: Implementar `GET /api/v1/conversations/:id/messages` (listar mensagens)
- [ ] **TODO-011**: Implementar `POST /api/v1/conversations/:id/messages` (enviar mensagem)
- [ ] **TODO-012**: Implementar `PUT /api/v1/messages/:id` (atualizar mensagem)
- [ ] **TODO-013**: Implementar `DELETE /api/v1/messages/:id` (deletar mensagem)

#### **Backend - Endpoints de Sessões**
- [ ] **TODO-014**: Implementar `GET /api/v1/conversations/:id/sessions` (histórico de sessões)
- [ ] **TODO-015**: Implementar `POST /api/v1/conversations/:id/sessions` (criar nova sessão)
- [ ] **TODO-016**: Implementar `PUT /api/v1/sessions/:id/transitions` (transição de estado)
- [ ] **TODO-017**: Implementar `PUT /api/v1/sessions/:id/assign` (atribuir sessão)
- [ ] **TODO-018**: Implementar `PUT /api/v1/sessions/:id/transfer` (transferir sessão)
- [ ] **TODO-019**: Implementar `PUT /api/v1/sessions/:id/close` (encerrar sessão)

#### **Backend - Endpoints de Flags/Tags**
- [ ] **TODO-020**: Implementar `GET /api/v1/flags` (listar flags disponíveis)
- [ ] **TODO-021**: Implementar `POST /api/v1/conversations/:id/flags` (adicionar flag)
- [ ] **TODO-022**: Implementar `DELETE /api/v1/conversations/:id/flags/:flagId` (remover flag)

#### **Validação Fase 1.1**
- [ ] **VALIDAÇÃO-001**: Testar todos os endpoints com Postman/Insomnia
- [ ] **VALIDAÇÃO-002**: Verificar se filtros por aba funcionam corretamente
- [ ] **VALIDAÇÃO-003**: Verificar se transições de sessão funcionam
- [ ] **VALIDAÇÃO-004**: Verificar se contadores são atualizados corretamente

**✅ CRITÉRIO PARA PASSAR**: Todos os endpoints de conversas funcionando e testados

---

### 🔧 **FASE 1.2: APIs de Chatbots (Dias 3-4)**

#### **Backend - Endpoints de Chatbots**
- [ ] **TODO-023**: Implementar `GET /api/v1/chatbots` (listar chatbots)
- [ ] **TODO-024**: Implementar `GET /api/v1/chatbots/:id` (detalhes do chatbot)
- [ ] **TODO-025**: Implementar `POST /api/v1/chatbots` (criar chatbot)
- [ ] **TODO-026**: Implementar `PUT /api/v1/chatbots/:id` (atualizar chatbot)
- [ ] **TODO-027**: Implementar `DELETE /api/v1/chatbots/:id` (deletar chatbot)
- [ ] **TODO-028**: Implementar `PUT /api/v1/chatbots/:id/activate` (ativar chatbot)
- [ ] **TODO-029**: Implementar `PUT /api/v1/chatbots/:id/pause` (pausar chatbot)
- [ ] **TODO-030**: Implementar `POST /api/v1/chatbots/:id/clone` (clonar chatbot)
- [ ] **TODO-031**: Implementar `PUT /api/v1/chatbots/reorder` (reordenar chatbots)

#### **Backend - Endpoints de Fluxos**
- [ ] **TODO-032**: Implementar `GET /api/v1/chatbots/flows` (listar fluxos)
- [ ] **TODO-033**: Implementar `GET /api/v1/chatbots/flows/:id` (detalhes do fluxo)
- [ ] **TODO-034**: Implementar `POST /api/v1/chatbots/flows` (criar fluxo)
- [ ] **TODO-035**: Implementar `PUT /api/v1/chatbots/flows/:id` (atualizar fluxo)
- [ ] **TODO-036**: Implementar `DELETE /api/v1/chatbots/flows/:id` (deletar fluxo)
- [ ] **TODO-037**: Implementar `POST /api/v1/chatbots/flows/:id/validate` (validar fluxo)
- [ ] **TODO-038**: Implementar `POST /api/v1/chatbots/flows/:id/test` (testar fluxo)
- [ ] **TODO-039**: Implementar `GET /api/v1/chatbots/flows/:id/export` (exportar fluxo)
- [ ] **TODO-040**: Implementar `POST /api/v1/chatbots/flows/import` (importar fluxo)

#### **Backend - Endpoints de Canais**
- [ ] **TODO-041**: Implementar `GET /api/v1/channels` (listar canais)

#### **Validação Fase 1.2**
- [ ] **VALIDAÇÃO-005**: Testar todos os endpoints de chatbots com Postman/Insomnia
- [ ] **VALIDAÇÃO-006**: Verificar se CRUD de chatbots funciona corretamente
- [ ] **VALIDAÇÃO-007**: Verificar se CRUD de fluxos funciona corretamente
- [ ] **VALIDAÇÃO-008**: Verificar se validação de fluxos funciona

**✅ CRITÉRIO PARA PASSAR**: Todos os endpoints de chatbots funcionando e testados

---

### 🔧 **FASE 1.3: Integração Frontend-Backend (Dia 5)**

#### **Frontend - Serviços de Conversas**
- [ ] **TODO-042**: Atualizar `ConversationsService` para usar APIs reais
- [ ] **TODO-043**: Implementar `getConversations(filters)` com filtros por aba
- [ ] **TODO-044**: Implementar `getConversation(id)` para detalhes
- [ ] **TODO-045**: Implementar `getMessages(conversationId)` para mensagens
- [ ] **TODO-046**: Implementar `sendMessage(conversationId, data)` para envio
- [ ] **TODO-047**: Implementar `getSessions(conversationId)` para sessões
- [ ] **TODO-048**: Implementar `transitionSession(sessionId, toState)` para transições
- [ ] **TODO-049**: Implementar `assignSession(sessionId, agentId)` para atribuição
- [ ] **TODO-050**: Implementar `transferSession(sessionId, targetAgentId)` para transferência
- [ ] **TODO-051**: Implementar `closeSession(sessionId, reason)` para encerramento

#### **Frontend - Serviços de Chatbots**
- [ ] **TODO-052**: Atualizar `ChatbotsService` para usar APIs reais
- [ ] **TODO-053**: Implementar `getChatbots(filters)` para listagem
- [ ] **TODO-054**: Implementar `createChatbot(data)` para criação
- [ ] **TODO-055**: Implementar `updateChatbot(id, data)` para atualização
- [ ] **TODO-056**: Implementar `deleteChatbot(id)` para exclusão
- [ ] **TODO-057**: Implementar `activateChatbot(id)` para ativação
- [ ] **TODO-058**: Implementar `pauseChatbot(id)` para pausa
- [ ] **TODO-059**: Implementar `cloneChatbot(id)` para clonagem
- [ ] **TODO-060**: Implementar `reorderChatbots(chatbotIds)` para reordenação

#### **Frontend - Serviços de Fluxos**
- [ ] **TODO-061**: Atualizar `FlowsService` para usar APIs reais
- [ ] **TODO-062**: Implementar `getFlow(id)` para carregar fluxo
- [ ] **TODO-063**: Implementar `createFlow(dto)` para criar fluxo
- [ ] **TODO-064**: Implementar `updateFlow(id, dto)` para atualizar fluxo
- [ ] **TODO-065**: Implementar `deleteFlow(id)` para deletar fluxo
- [ ] **TODO-066**: Implementar `validateFlow(id, dto)` para validação
- [ ] **TODO-067**: Implementar `exportFlow(id)` para exportação
- [ ] **TODO-068**: Implementar `importFlow(file)` para importação

#### **Validação Fase 1.3**
- [ ] **VALIDAÇÃO-009**: Testar integração básica de conversas
- [ ] **VALIDAÇÃO-010**: Testar integração básica de chatbots
- [ ] **VALIDAÇÃO-011**: Testar integração básica de fluxos
- [ ] **VALIDAÇÃO-012**: Verificar se não há mais mocks sendo usados

**✅ CRITÉRIO PARA PASSAR**: Frontend integrado com backend, sem mocks

---

## 📅 FASE 2: FUNCIONALIDADES CORE (Semana 2)

### 🔧 **FASE 2.1: Conversas - Funcionalidades Básicas (Dias 1-2)**

#### **Frontend - Hooks de Conversas**
- [ ] **TODO-069**: Implementar `useConversations(filters)` hook
- [ ] **TODO-070**: Implementar `useMessages(conversationId)` hook
- [ ] **TODO-071**: Implementar `useSessions(conversationId)` hook
- [ ] **TODO-072**: Implementar `useConversationActions()` hook

#### **Frontend - Componentes de Conversas**
- [ ] **TODO-073**: Atualizar `ConversationsList` para usar APIs reais
- [ ] **TODO-074**: Implementar filtragem por aba (bot, entrada, aguardando, em_atendimento, finalizadas)
- [ ] **TODO-075**: Implementar busca de conversas
- [ ] **TODO-076**: Implementar seleção de conversa
- [ ] **TODO-077**: Atualizar `ConversationCard` para exibir estado da sessão ativa
- [ ] **TODO-078**: Implementar contadores em tempo real por aba
- [ ] **TODO-079**: Atualizar `MessagesList` para carregar mensagens reais
- [ ] **TODO-080**: Implementar envio de mensagens
- [ ] **TODO-081**: Implementar carregamento de mensagens com paginação

#### **Frontend - Ações Contextuais**
- [ ] **TODO-082**: Implementar ação "Atribuir" na conversa
- [ ] **TODO-083**: Implementar ação "Transferir" na conversa
- [ ] **TODO-084**: Implementar ação "Encerrar" na conversa
- [ ] **TODO-085**: Implementar ação "Reabrir" na conversa
- [ ] **TODO-086**: Implementar ação "Ver Histórico" de sessões

#### **Validação Fase 2.1**
- [ ] **VALIDAÇÃO-013**: Testar listagem de conversas por aba
- [ ] **VALIDAÇÃO-014**: Testar seleção e visualização de conversa
- [ ] **VALIDAÇÃO-015**: Testar carregamento de mensagens
- [ ] **VALIDAÇÃO-016**: Testar envio de mensagens
- [ ] **VALIDAÇÃO-017**: Testar ações contextuais básicas

**✅ CRITÉRIO PARA PASSAR**: Funcionalidades básicas de conversas funcionando

---

### 🔧 **FASE 2.2: Conversas - Funcionalidades Avançadas (Dias 3-4)**

#### **Frontend - Funcionalidades Avançadas**
- [ ] **TODO-087**: Implementar filtros avançados (canal, setor, tags)
- [ ] **TODO-088**: Implementar ordenação de conversas
- [ ] **TODO-089**: Implementar gerenciamento de tags/flags
- [ ] **TODO-090**: Implementar agendamento de mensagens
- [ ] **TODO-091**: Implementar templates de mensagens
- [ ] **TODO-092**: Implementar respostas rápidas
- [ ] **TODO-093**: Implementar upload de arquivos/mídia
- [ ] **TODO-094**: Implementar gravação de áudio
- [ ] **TODO-095**: Implementar busca dentro da conversa
- [ ] **TODO-096**: Implementar histórico de sessões

#### **Frontend - Estados de Loading e Error**
- [ ] **TODO-097**: Implementar loading states em todos os componentes
- [ ] **TODO-098**: Implementar error handling robusto
- [ ] **TODO-099**: Implementar retry automático para falhas
- [ ] **TODO-100**: Implementar feedback visual para ações

#### **Validação Fase 2.2**
- [ ] **VALIDAÇÃO-018**: Testar filtros avançados
- [ ] **VALIDAÇÃO-019**: Testar gerenciamento de tags
- [ ] **VALIDAÇÃO-020**: Testar agendamento de mensagens
- [ ] **VALIDAÇÃO-021**: Testar upload de arquivos
- [ ] **VALIDAÇÃO-022**: Testar busca dentro da conversa
- [ ] **VALIDAÇÃO-023**: Testar loading states e error handling

**✅ CRITÉRIO PARA PASSAR**: Funcionalidades avançadas de conversas funcionando

---

### 🔧 **FASE 2.3: Chatbots - Funcionalidades Básicas (Dia 5)**

#### **Frontend - Hooks de Chatbots**
- [ ] **TODO-101**: Implementar `useChatbots(filters)` hook
- [ ] **TODO-102**: Implementar `useChatbotActions()` hook
- [ ] **TODO-103**: Implementar `useChannels()` hook

#### **Frontend - Componentes de Chatbots**
- [ ] **TODO-104**: Atualizar `Chatbot` page para usar APIs reais
- [ ] **TODO-105**: Implementar listagem de chatbots
- [ ] **TODO-106**: Implementar busca de chatbots
- [ ] **TODO-107**: Implementar filtro por canal
- [ ] **TODO-108**: Implementar criação de chatbot
- [ ] **TODO-109**: Implementar edição de chatbot
- [ ] **TODO-110**: Implementar exclusão de chatbot
- [ ] **TODO-111**: Implementar ativação/pausa de chatbot
- [ ] **TODO-112**: Implementar clonagem de chatbot
- [ ] **TODO-113**: Implementar reordenação por drag & drop

#### **Frontend - Estados de Loading e Error**
- [ ] **TODO-114**: Implementar loading states para chatbots
- [ ] **TODO-115**: Implementar error handling para chatbots
- [ ] **TODO-116**: Implementar feedback visual para ações

#### **Validação Fase 2.3**
- [ ] **VALIDAÇÃO-024**: Testar listagem de chatbots
- [ ] **VALIDAÇÃO-025**: Testar CRUD de chatbots
- [ ] **VALIDAÇÃO-026**: Testar ativação/pausa
- [ ] **VALIDAÇÃO-027**: Testar clonagem
- [ ] **VALIDAÇÃO-028**: Testar reordenação
- [ ] **VALIDAÇÃO-029**: Testar filtros e busca

**✅ CRITÉRIO PARA PASSAR**: Funcionalidades básicas de chatbots funcionando

---

## 📅 FASE 3: EDITOR E REFINAMENTO (Semana 3)

### 🔧 **FASE 3.1: Editor de Fluxos (Dias 1-2)**

#### **Frontend - Store de Editor**
- [ ] **TODO-117**: Atualizar `editorStore` para usar APIs reais
- [ ] **TODO-118**: Implementar `loadFromBackend(flowId)` no store
- [ ] **TODO-119**: Implementar `saveToBackend()` no store
- [ ] **TODO-120**: Implementar validação antes de salvar
- [ ] **TODO-121**: Implementar undo/redo persistente

#### **Frontend - Editor de Fluxos**
- [ ] **TODO-122**: Atualizar `ChatbotFlowEditor` para carregar fluxos reais
- [ ] **TODO-123**: Implementar salvamento automático
- [ ] **TODO-124**: Implementar validação de fluxo antes de salvar
- [ ] **TODO-125**: Implementar exportação de fluxos
- [ ] **TODO-126**: Implementar importação de fluxos
- [ ] **TODO-127**: Implementar teste de fluxos
- [ ] **TODO-128**: Implementar renomeação de fluxos
- [ ] **TODO-129**: Implementar duplicação de fluxos

#### **Frontend - Nós do Editor**
- [ ] **TODO-130**: Implementar todos os nós customizados funcionais
- [ ] **TODO-131**: Implementar drawers de configuração funcionais
- [ ] **TODO-132**: Implementar validação de nós
- [ ] **TODO-133**: Implementar conexões entre nós
- [ ] **TODO-134**: Implementar ações de nós (duplicar, deletar, info)

#### **Validação Fase 3.1**
- [ ] **VALIDAÇÃO-030**: Testar carregamento de fluxos
- [ ] **VALIDAÇÃO-031**: Testar salvamento de fluxos
- [ ] **VALIDAÇÃO-032**: Testar validação de fluxos
- [ ] **VALIDAÇÃO-033**: Testar exportação/importação
- [ ] **VALIDAÇÃO-034**: Testar todos os nós customizados
- [ ] **VALIDAÇÃO-035**: Testar drawers de configuração

**✅ CRITÉRIO PARA PASSAR**: Editor de fluxos completamente funcional

---

### 🔧 **FASE 3.2: Real-time e Otimizações (Dias 3-4)**

#### **Backend - WebSocket**
- [ ] **TODO-135**: Implementar WebSocket para conversas
- [ ] **TODO-136**: Implementar WebSocket para chatbots
- [ ] **TODO-137**: Implementar WebSocket para fluxos
- [ ] **TODO-138**: Implementar reconexão automática
- [ ] **TODO-139**: Implementar heartbeat/ping

#### **Frontend - WebSocket Integration**
- [ ] **TODO-140**: Implementar `WebSocketService` no frontend
- [ ] **TODO-141**: Conectar conversas com WebSocket
- [ ] **TODO-142**: Conectar chatbots com WebSocket
- [ ] **TODO-143**: Conectar editor com WebSocket
- [ ] **TODO-144**: Implementar atualizações em tempo real

#### **Frontend - Otimizações**
- [ ] **TODO-145**: Implementar cache de dados
- [ ] **TODO-146**: Implementar lazy loading
- [ ] **TODO-147**: Otimizar bundle size
- [ ] **TODO-148**: Implementar debounce em buscas
- [ ] **TODO-149**: Implementar paginação eficiente
- [ ] **TODO-150**: Implementar virtualização de listas

#### **Validação Fase 3.2**
- [ ] **VALIDAÇÃO-036**: Testar WebSocket para conversas
- [ ] **VALIDAÇÃO-037**: Testar WebSocket para chatbots
- [ ] **VALIDAÇÃO-038**: Testar WebSocket para fluxos
- [ ] **VALIDAÇÃO-039**: Testar reconexão automática
- [ ] **VALIDAÇÃO-040**: Testar performance otimizada

**✅ CRITÉRIO PARA PASSAR**: Real-time funcionando e performance otimizada

---

### 🔧 **FASE 3.3: Testes e Deploy (Dia 5)**

#### **Testes de Integração**
- [ ] **TODO-151**: Implementar testes de integração para conversas
- [ ] **TODO-152**: Implementar testes de integração para chatbots
- [ ] **TODO-153**: Implementar testes de integração para fluxos
- [ ] **TODO-154**: Implementar testes de WebSocket
- [ ] **TODO-155**: Implementar testes de performance

#### **Testes End-to-End**
- [ ] **TODO-156**: Testar fluxo completo de conversas
- [ ] **TODO-157**: Testar fluxo completo de chatbots
- [ ] **TODO-158**: Testar fluxo completo de editor
- [ ] **TODO-159**: Testar integração entre todas as telas
- [ ] **TODO-160**: Testar cenários de erro

#### **Deploy e Validação Final**
- [ ] **TODO-161**: Deploy em ambiente de teste
- [ ] **TODO-162**: Validação completa de funcionalidades
- [ ] **TODO-163**: Teste de carga e performance
- [ ] **TODO-164**: Deploy em produção
- [ ] **TODO-165**: Monitoramento pós-deploy

#### **Validação Fase 3.3**
- [ ] **VALIDAÇÃO-041**: Todos os testes passando
- [ ] **VALIDAÇÃO-042**: Performance dentro dos limites
- [ ] **VALIDAÇÃO-043**: Funcionalidades 100% operacionais
- [ ] **VALIDAÇÃO-044**: Nenhum mock sendo usado
- [ ] **VALIDAÇÃO-045**: Integração completa funcionando

**✅ CRITÉRIO PARA PASSAR**: Sistema 100% funcional e em produção

---

## 🎯 **CRITÉRIOS DE VALIDAÇÃO FINAL**

### **Funcionalidades Obrigatórias**
- [ ] ✅ **Conversas**: Listar, selecionar, enviar mensagens, ações contextuais
- [ ] ✅ **Chatbots**: CRUD completo, ativação/pausa, clonagem, reordenação
- [ ] ✅ **Editor**: Carregar, salvar, validar, exportar/importar fluxos
- [ ] ✅ **Real-time**: Atualizações em tempo real via WebSocket
- [ ] ✅ **Performance**: Tempo de resposta < 200ms, carregamento < 2s

### **Qualidade Obrigatória**
- [ ] ✅ **Sem Mocks**: Todas as funcionalidades usando APIs reais
- [ ] ✅ **Error Handling**: Tratamento robusto de erros
- [ ] ✅ **Loading States**: Estados de carregamento adequados
- [ ] ✅ **Testes**: Testes de integração passando
- [ ] ✅ **Documentação**: Documentação atualizada

### **Integração Obrigatória**
- [ ] ✅ **Backend-Frontend**: Comunicação 100% funcional
- [ ] ✅ **WebSocket**: Atualizações em tempo real
- [ ] ✅ **Persistência**: Dados salvos e carregados corretamente
- [ ] ✅ **Validação**: Validações funcionando
- [ ] ✅ **Segurança**: Autenticação e autorização funcionando

---

## 🚀 **PRÓXIMO PASSO IMEDIATO**

**INICIAR FASE 1.1 - APIs de Conversas**

1. **TODO-001**: Criar modelo `Session.ts` no backend
2. **TODO-002**: Atualizar modelo `Conversation.ts` com campos de sessão
3. **TODO-003**: Atualizar modelo `Message.ts` com `session_id`

**Após completar TODOs 001-003, validar antes de prosseguir para TODO-004**

---

## 📊 **RESUMO DE PROGRESSO**

- **Total de TODOs**: 165
- **Total de Validações**: 45
- **Fases**: 3 (Backend Foundation, Funcionalidades Core, Editor e Refinamento)
- **Duração Estimada**: 3 semanas
- **Critério de Sucesso**: 100% funcional, sem mocks, integrado com backend
