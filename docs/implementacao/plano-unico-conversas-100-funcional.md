# 🎯 PLANO ÚNICO - TELA DE CONVERSAS 100% FUNCIONAL

## 📋 VISÃO GERAL

**Objetivo**: Implementar completamente a tela de conversas (`http://localhost:8080/conversations`) com todas as funcionalidades, integração frontend-backend, persistência de dados e experiência de usuário completa.

**Status Atual**: Backend 85% implementado, Frontend 20% implementado
**Meta**: 100% funcional em 7-10 semanas (reduzido de 9-14 semanas)

---

## 🚀 FASES DE IMPLEMENTAÇÃO

### **FASE 1: BACKEND FINALIZAÇÃO** ⏱️ 1 semana
*Status: 85% → 100%*

#### 1.1 WebSocket Completo (Socket.io) 🔄
- [ ] **Instalar Socket.io**
  ```bash
  npm install socket.io @types/socket.io
  ```
- [ ] **Configurar Socket.io no server.ts**
  - [ ] Integrar com Express
  - [ ] Configurar CORS para frontend
  - [ ] Implementar rooms por clínica
- [ ] **Implementar eventos específicos**
  - [ ] `message_received` - Nova mensagem
  - [ ] `conversation_updated` - Conversa atualizada
  - [ ] `typing_start/stop` - Indicador de digitação
  - [ ] `online_status` - Status online/offline
  - [ ] `conversation_assigned` - Conversa atribuída
  - [ ] `conversation_transferred` - Conversa transferida
- [ ] **Integrar com controllers existentes**
  - [ ] Emitir eventos no MessageController
  - [ ] Emitir eventos no ConversationController
  - [ ] Emitir eventos no SessionController

#### 1.2 Cache de Dados (Redis) 🔄
- [ ] **Implementar cache de conversas**
  - [ ] Cache de lista de conversas por clínica
  - [ ] Cache de detalhes de conversa
  - [ ] Cache de contadores por aba
- [ ] **Implementar cache de mensagens**
  - [ ] Cache de mensagens por conversa
  - [ ] Cache de mensagens não lidas
- [ ] **Implementar invalidação estratégica**
  - [ ] Invalidar cache ao criar/atualizar conversa
  - [ ] Invalidar cache ao enviar mensagem
  - [ ] TTL automático para dados

#### 1.3 Rate Limiting 🔄
- [ ] **Implementar rate limiting específico**
  - [ ] Limite de mensagens por minuto
  - [ ] Limite de requisições por IP
  - [ ] Limite de uploads por hora
- [ ] **Configurar middleware**
  - [ ] Rate limiting por endpoint
  - [ ] Rate limiting por usuário
  - [ ] Rate limiting por clínica

#### 1.4 Busca Avançada (Opcional) 🔄
- [ ] **Implementar busca full-text básica**
  - [ ] Índices MongoDB para busca
  - [ ] Endpoint de busca avançada
  - [ ] Busca em mensagens

### **FASE 2: HOOKS E SERVIÇOS FRONTEND** ⏱️ 1 semana
*Status: 0% → 100%*

#### 2.1 Hooks Customizados 🔄
- [ ] **useConversations**
  ```typescript
  // Funcionalidades:
  // - Listar conversas com filtros
  // - Paginação infinita
  // - Cache inteligente
  // - Refetch automático
  // - Integração com React Query
  ```
- [ ] **useMessages**
  ```typescript
  // Funcionalidades:
  // - Listar mensagens da conversa
  // - Envio de mensagens
  // - Scroll infinito para histórico
  // - Otimistic updates
  // - Upload de mídia
  ```
- [ ] **useWebSocket**
  ```typescript
  // Funcionalidades:
  // - Conexão Socket.io
  // - Reconexão automática
  // - Gerenciar eventos em tempo real
  // - Status de conexão
  ```
- [ ] **useConversationFilters**
  ```typescript
  // Funcionalidades:
  // - Gerenciar filtros ativos
  // - Persistir filtros no localStorage
  // - Aplicar filtros no backend
  // - Contadores dinâmicos
  ```
- [ ] **useConversationActions**
  ```typescript
  // Funcionalidades:
  // - Assumir conversa
  // - Transferir conversa
  // - Fechar conversa
  // - Arquivar conversa
  // - Aplicar/remover flags
  ```

#### 2.2 Serviços de API 🔄
- [ ] **ConversationService**
  ```typescript
  // Métodos:
  // - getConversations(filters, pagination)
  // - getConversation(id)
  // - updateConversation(id, data)
  // - closeConversation(id, reason)
  // - assignConversation(id, agentId)
  // - transferConversation(id, newAgentId)
  ```
- [ ] **MessageService**
  ```typescript
  // Métodos:
  // - getMessages(conversationId, pagination)
  // - sendMessage(conversationId, content, type)
  // - uploadMedia(file)
  // - scheduleMessage(conversationId, content, date)
  // - updateMessage(messageId, data)
  // - deleteMessage(messageId)
  ```
- [ ] **WebSocketService**
  ```typescript
  // Métodos:
  // - connect(clinicId)
  // - disconnect()
  // - subscribe(event, callback)
  // - unsubscribe(event, callback)
  // - emit(event, data)
  ```

### **FASE 3: COMPONENTES CORE** ⏱️ 2-3 semanas
*Status: 20% → 80%*

#### 3.1 ConversationsList 🔄
- [ ] **Integração com Backend**
  - [ ] Conectar aos endpoints existentes
  - [ ] Implementar loading states (skeleton)
  - [ ] Implementar error states
  - [ ] Implementar empty states
- [ ] **Filtros Funcionais**
  - [ ] Conectar filtros ao backend
  - [ ] Persistir filtros no localStorage
  - [ ] Contadores dinâmicos em tempo real
  - [ ] Filtros por aba funcionais
- [ ] **Ordenação**
  - [ ] Múltiplos campos de ordenação
  - [ ] Persistir preferências de ordenação
  - [ ] Indicadores visuais de ordenação
- [ ] **Busca**
  - [ ] Debounce na busca (300ms)
  - [ ] Highlight de resultados
  - [ ] Busca em tempo real
  - [ ] Histórico de buscas
- [ ] **Paginação**
  - [ ] Scroll infinito implementado
  - [ ] Loading de mais dados
  - [ ] Performance otimizada
  - [ ] Indicadores de carregamento

#### 3.2 ChatArea 🔄
- [ ] **MessagesList**
  - [ ] Scroll infinito para histórico
  - [ ] Auto-scroll para novas mensagens
  - [ ] Loading states para mensagens
  - [ ] Error handling para mensagens
  - [ ] Virtualização para performance
- [ ] **MessageItem**
  - [ ] Renderização otimizada
  - [ ] Menu de contexto funcional
  - [ ] Ações (responder, reenviar, copiar, deletar)
  - [ ] Preview de mídia (imagem, áudio, vídeo)
  - [ ] Indicadores de status (enviado, entregue, lido)
- [ ] **MessageInput**
  - [ ] Envio otimista de mensagens
  - [ ] Upload de arquivos (drag & drop)
  - [ ] Templates de mensagem
  - [ ] Quick replies
  - [ ] Agendamento de mensagens
  - [ ] Indicador de digitação
- [ ] **ChatHeader**
  - [ ] Informações do contato
  - [ ] Status online/offline
  - [ ] Indicadores de digitação
  - [ ] Ações rápidas (transferir, fechar, arquivar)
  - [ ] Badge de mensagens não lidas

#### 3.3 Filtros e Busca 🔄
- [ ] **ConversationFilters**
  - [ ] Filtros rápidos funcionais
  - [ ] Filtros avançados
  - [ ] Persistência de filtros
  - [ ] Contadores em tempo real
  - [ ] Reset de filtros
- [ ] **FiltersModal**
  - [ ] Filtros por data (DateRangePicker)
  - [ ] Filtros por status
  - [ ] Filtros por flags
  - [ ] Filtros por agente/setor
  - [ ] Filtros por tipo de atendimento
- [ ] **Busca Global**
  - [ ] Campo de busca com sugestões
  - [ ] Histórico de buscas
  - [ ] Busca em mensagens
  - [ ] Filtros de busca

### **FASE 4: FUNCIONALIDADES AVANÇADAS** ⏱️ 1-2 semanas
*Status: 80% → 95%*

#### 4.1 Menu de Contexto 🔄
- [ ] **ConversationMenu**
  - [ ] Assumir conversa (com validação)
  - [ ] Transferir conversa (com motivo)
  - [ ] Fechar conversa (com feedback)
  - [ ] Arquivar conversa
  - [ ] Aplicar flags (múltiplas)
  - [ ] Exportar conversa
  - [ ] Duplicar conversa
- [ ] **MessageMenu**
  - [ ] Responder mensagem
  - [ ] Reenviar mensagem
  - [ ] Copiar mensagem
  - [ ] Deletar mensagem
  - [ ] Marcar como importante
  - [ ] Download de mídia

#### 4.2 Drawers e Modais 🔄
- [ ] **ContactDrawer**
  - [ ] Informações do contato
  - [ ] Histórico de conversas
  - [ ] Notas do cliente
  - [ ] Integração com CRM
  - [ ] Edição de informações
- [ ] **TransferDrawer**
  - [ ] Seleção de agente/setor
  - [ ] Motivo da transferência
  - [ ] Nota interna
  - [ ] Confirmação de transferência
- [ ] **ScheduleMessageDrawer**
  - [ ] Agendamento de mensagens
  - [ ] Templates disponíveis
  - [ ] Repetição de mensagens
  - [ ] Preview da mensagem
- [ ] **FlagsModal**
  - [ ] Gerenciar flags existentes
  - [ ] Criar novas flags
  - [ ] Aplicar flags em lote
  - [ ] Remover flags

#### 4.3 Tempo Real 🔄
- [ ] **WebSocket Integration**
  - [ ] Conexão automática ao carregar página
  - [ ] Reconexão em caso de falha
  - [ ] Indicadores de status de conexão
  - [ ] Fallback para SSE se WebSocket falhar
- [ ] **Eventos em Tempo Real**
  - [ ] Novas mensagens aparecem automaticamente
  - [ ] Status de leitura atualizado
  - [ ] Indicador de digitação
  - [ ] Status online/offline
  - [ ] Atualizações de conversa
  - [ ] Notificações de transferência

### **FASE 5: OTIMIZAÇÕES E POLISH** ⏱️ 1 semana
*Status: 95% → 100%*

#### 5.1 Performance 🔄
- [ ] **Otimizações de Renderização**
  - [ ] React.memo para componentes pesados
  - [ ] useMemo para cálculos complexos
  - [ ] useCallback para funções passadas como props
  - [ ] Virtualização de listas longas
- [ ] **Cache Inteligente**
  - [ ] React Query para cache de API
  - [ ] Invalidação estratégica de cache
  - [ ] Prefetch de dados importantes
  - [ ] Otimistic updates
- [ ] **Bundle Optimization**
  - [ ] Code splitting por rota
  - [ ] Lazy loading de componentes
  - [ ] Tree shaking otimizado
  - [ ] Bundle size < 500KB

#### 5.2 UX/UI Polish 🔄
- [ ] **Loading States**
  - [ ] Skeleton loaders para conversas
  - [ ] Spinners contextuais
  - [ ] Progress indicators para uploads
  - [ ] Loading states para ações
- [ ] **Error Handling**
  - [ ] Error boundaries implementados
  - [ ] Retry mechanisms
  - [ ] Fallback UI para erros
  - [ ] Mensagens de erro amigáveis
- [ ] **Responsividade**
  - [ ] Mobile-first design
  - [ ] Tablet optimization
  - [ ] Touch interactions
  - [ ] Gestos de swipe
- [ ] **Acessibilidade**
  - [ ] ARIA labels completos
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] High contrast mode
  - [ ] Focus management

#### 5.3 Notificações 🔄
- [ ] **Toast Notifications**
  - [ ] Sucesso/erro/info
  - [ ] Auto-dismiss configurável
  - [ ] Action buttons em toasts
  - [ ] Posicionamento inteligente
- [ ] **Badge Counters**
  - [ ] Contadores de não lidas
  - [ ] Atualização em tempo real
  - [ ] Persistência de contadores
  - [ ] Animação de mudança
- [ ] **Browser Notifications**
  - [ ] Solicitar permissões
  - [ ] Notificações nativas
  - [ ] Click to focus na aba
  - [ ] Configurações de notificação

### **FASE 6: TESTES E DEPLOY** ⏱️ 1 semana
*Status: 100% → 100% + Testes*

#### 6.1 Testes 🔄
- [ ] **Testes Unitários**
  - [ ] Hooks customizados
  - [ ] Utilitários e helpers
  - [ ] Serviços de API
  - [ ] Componentes isolados
- [ ] **Testes de Integração**
  - [ ] Fluxos completos de usuário
  - [ ] Integração API
  - [ ] Eventos WebSocket
  - [ ] Persistência de dados
- [ ] **Testes E2E**
  - [ ] Cenários de usuário completos
  - [ ] Cross-browser testing
  - [ ] Performance testing
  - [ ] Acessibilidade testing

#### 6.2 Deploy e Monitoramento 🔄
- [ ] **Deploy**
  - [ ] Build otimizado
  - [ ] Environment variables
  - [ ] CDN configuration
  - [ ] SSL certificates
- [ ] **Monitoramento**
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring
  - [ ] User analytics
  - [ ] API monitoring
  - [ ] WebSocket monitoring

---

## 📋 CHECKLIST DE VALIDAÇÃO POR FASE

### **FASE 1 - BACKEND FINALIZAÇÃO**
- [ ] Socket.io conectado e funcionando
- [ ] Eventos em tempo real emitidos
- [ ] Cache Redis implementado
- [ ] Rate limiting configurado
- [ ] Testes de endpoints funcionando

### **FASE 2 - HOOKS E SERVIÇOS**
- [ ] useConversations funcionando
- [ ] useMessages funcionando
- [ ] useWebSocket conectado
- [ ] Serviços de API implementados
- [ ] Cache React Query funcionando

### **FASE 3 - COMPONENTES CORE**
- [ ] ConversationsList integrado
- [ ] ChatArea funcionando
- [ ] Filtros aplicados
- [ ] Busca funcionando
- [ ] Paginação infinita

### **FASE 4 - FUNCIONALIDADES AVANÇADAS**
- [ ] Menus de contexto funcionais
- [ ] Drawers implementados
- [ ] Tempo real funcionando
- [ ] Notificações ativas
- [ ] Ações de conversa funcionando

### **FASE 5 - OTIMIZAÇÕES**
- [ ] Performance otimizada
- [ ] Loading states implementados
- [ ] Error handling completo
- [ ] Responsividade garantida
- [ ] Acessibilidade validada

### **FASE 6 - TESTES E DEPLOY**
- [ ] Testes passando
- [ ] Deploy funcionando
- [ ] Monitoramento ativo
- [ ] Documentação completa

---

## 🎯 CRITÉRIOS DE SUCESSO

### ✅ **Funcionalidade**
- [ ] Todas as funcionalidades implementadas
- [ ] Integração frontend-backend completa
- [ ] Persistência de dados funcionando
- [ ] Tempo real implementado e estável

### ✅ **Performance**
- [ ] Tempo de carregamento < 2 segundos
- [ ] Scroll infinito sem lag
- [ ] Cache eficiente funcionando
- [ ] Bundle size < 500KB

### ✅ **UX/UI**
- [ ] Interface intuitiva e responsiva
- [ ] Loading states informativos
- [ ] Error handling elegante
- [ ] Acessibilidade garantida

### ✅ **Qualidade**
- [ ] Código limpo e documentado
- [ ] Testes implementados e passando
- [ ] Monitoramento ativo
- [ ] Deploy automatizado

---

## 📅 CRONOGRAMA DETALHADO

| Semana | Fase | Atividades Principais | Entregáveis |
|--------|------|----------------------|-------------|
| **1** | Fase 1 | Socket.io, Cache Redis, Rate Limiting | Backend 100% |
| **2** | Fase 2 | Hooks, Serviços, React Query | Integração básica |
| **3-4** | Fase 3 | ConversationsList, ChatArea, Filtros | Core funcional |
| **5-6** | Fase 4 | Menus, Drawers, Tempo Real | Funcionalidades avançadas |
| **7** | Fase 5 | Performance, UX, Acessibilidade | Polish completo |
| **8** | Fase 6 | Testes, Deploy, Monitoramento | Produção |

---

## 🚨 RISCOS E MITIGAÇÕES

### **Riscos Técnicos**
- **WebSocket complexidade**: Implementar fallback para SSE
- **Performance com muitos dados**: Implementar virtualização
- **Integração complexa**: Fazer integração incremental

### **Riscos de Prazo**
- **Escopo muito amplo**: Priorizar funcionalidades core primeiro
- **Dependências externas**: Ter planos alternativos
- **Bugs complexos**: Reservar tempo para debugging

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### **Prioridades**
1. **Core**: Listar conversas, carregar mensagens, enviar mensagens
2. **Filtros**: Filtros básicos funcionais
3. **Tempo Real**: WebSocket básico
4. **UX**: Loading states e error handling
5. **Otimizações**: Performance e responsividade

### **Decisões Técnicas**
- **Estado**: Zustand para estado global
- **Cache**: React Query para cache de API
- **WebSocket**: Socket.io para tempo real
- **Testes**: Jest + Testing Library
- **Deploy**: Vercel/Netlify para frontend

### **Padrões de Código**
- **TypeScript**: Tipagem estrita
- **ESLint**: Linting automático
- **Prettier**: Formatação consistente
- **Conventional Commits**: Commits padronizados

---

## 🎉 CONCLUSÃO

Este plano integra a análise do backend existente (85% implementado) com o plano detalhado da tela de conversas, resultando em um cronograma otimizado de **7-10 semanas** (reduzido de 9-14 semanas).

**Próximo passo**: Começar pela **Fase 1** implementando Socket.io e cache Redis no backend.

**Este plano será atualizado conforme o progresso da implementação.**

