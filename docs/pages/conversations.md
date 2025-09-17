# 💬 Página de Conversas

## 📋 Visão Geral

**Arquivo**: `src/pages/Conversations.tsx`  
**Rota**: `/conversations`  
**Função**: Tela principal de chat e atendimento ao cliente

Esta é a página mais complexa do sistema, responsável por toda a interação de chat entre atendentes e clientes.

## 🎨 Layout e Estrutura

### 📐 Divisão da Tela (4 colunas)

1. **Sidebar Principal** (minimizável)
   - Menu de navegação do sistema
   - Ícones: Dashboard, Conversas, Agendamentos, Agenda
   - Estado persistente via localStorage

2. **Lista de Conversas** (largura: 384px)
   - Busca de conversas
   - Filtros de conversas
   - Lista de conversas ativas

3. **Área de Chat** (flex-1)
   - Header da conversa
   - Campo de busca na conversa (opcional)
   - Mensagens
   - Input de nova mensagem

4. **Dados do Paciente** (largura: 320px, opcional)
   - Informações do paciente
   - Arquivos e documentos
   - Menu de ações

## 🔍 Funcionalidades de Busca e Filtros

### 📝 Busca de Conversas
- **Localização**: Header da lista de conversas
- **Placeholder**: "Pesquisar ou começar uma nova conversa"
- **Função**: Filtrar conversas por nome ou telefone
- **Estado**: `searchTerm`

### 🏷️ Filtros de Conversas (2 linhas)

#### Linha 1: Filtros Principais
- **Tudo**: Mostra todas as conversas
- **Manual**: Conversas em atendimento manual
- **IA**: Conversas em atendimento automático

#### Linha 2: Filtros Especiais
- **Não lidas**: Conversas com mensagens não lidas
- **Flags**: Abre modal para seleção de flags customizadas

### 🔍 Busca na Conversa
- **Ativação**: Botão de lupa no header da conversa
- **Função**: Buscar mensagens específicas dentro da conversa ativa
- **Visual**: Campo amarelo que aparece/desaparece
- **Estado**: `searchInConversation`, `conversationSearchTerm`

## 💬 Gestão de Conversas

### 📊 Estrutura de Dados - Conversa
```typescript
interface Conversation {
  id: string;
  customer_phone: string;
  customer_name: string;
  status: 'active' | 'inactive';
  updated_at: string;
  assigned_user_id: string | null; // null = IA, string = Manual
  lastMessage: string;
  avatar?: string;
  unreadCount?: number;
}
```

### 🎯 Estados das Conversas
- **IA**: `assigned_user_id = null` - Atendimento automático
- **Manual**: `assigned_user_id = string` - Atendimento humano
- **Não lidas**: `unreadCount > 0`

### 🔄 Transições de Estado
- **Assumir Conversa**: IA → Manual
- **Liberar Conversa**: Manual → IA (não implementado no front)

## 💬 Sistema de Mensagens

### 📊 Estrutura de Dados - Mensagem
```typescript
interface Message {
  id: string;
  sender_type: 'customer' | 'bot' | 'human';
  content: string;
  timestamp: string;
  customer_name?: string;
}
```

### 🎨 Visualização
- **Cliente**: Balões verdes à direita
- **Bot/Atendente**: Balões brancos à esquerda
- **Timestamp**: Exibido em formato legível
- **Status**: Check simples/duplo para mensagens enviadas

### ✉️ Envio de Mensagens
- **Input**: Campo de texto na parte inferior
- **Envio**: Enter ou botão de enviar
- **Anexos**: Botões para emoji e anexos (visual apenas)

## 🏷️ Sistema de Flags

### 📊 Flags Padrão (sempre presentes)
- **Manual**: Azul (`#3B82F6`) - Atendimento humano
- **IA**: Verde (`#10B981`) - Atendimento automático

### 🎨 Flags Customizadas
```typescript
interface Flag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}
```

### 🔧 Operações com Flags
- **Visualizar**: Modal "Aplicar Flag"
- **Aplicar**: Seleção de flag para conversa
- **Filtrar**: Por flags específicas
- **Gerenciar**: Link para Settings (CRUD completo)

## 📝 Sistema de Templates

### 📊 Estrutura de Dados - Template
```typescript
interface Template {
  id: string;
  name: string;
  content: string;
  category: 'saudacao' | 'agendamento' | 'financeiro' | 'despedida' | 'outro';
  createdAt: string;
  usageCount: number;
}
```

### 📂 Categorias de Templates
- **Saudação**: Templates de boas-vindas
- **Agendamento**: Relacionados a consultas
- **Financeiro**: Pagamentos e convênios
- **Despedida**: Finalizações de atendimento
- **Outro**: Templates diversos

### 🔧 Operações com Templates
- **Visualizar**: Modal "Usar Template"
- **Usar**: Inserir template na conversa
- **Gerenciar**: Link para Settings (CRUD completo)

## 📁 Sistema de Arquivos

### 📊 Estrutura de Dados - Arquivo
```typescript
interface PatientFile {
  id: string;
  type: 'image' | 'document';
  name: string;
  url: string;
  date: string;
}
```

### 🔧 Operações com Arquivos
- **Visualizar**: Modal "Arquivos e Documentos"
- **Baixar**: Download de arquivos
- **Encaminhar**: Compartilhar arquivos
- **Limpar**: Remover seleções

## 📅 Agendamento de Mensagens

### 📊 Estrutura de Dados
```typescript
interface ScheduledMessage {
  message: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  conversation_id: string;
}
```

### 🔧 Funcionalidades
- **Agendar**: Modal "Programar Mensagem"
- **Validação**: Data/hora obrigatórias
- **Confirmação**: Alert com data/hora programada

## 👤 Dados do Paciente

### 📊 Informações Exibidas
```typescript
interface PatientInfo {
  name: string;
  age: number;
  phone: string;
  insurance: string; // Convênio
  status: string;
  description: string;
  files: PatientFile[];
}
```

### 🎨 Seções
1. **Foto e Nome**: Avatar e identificação
2. **Dados Básicos**: Idade, telefone, convênio
3. **Arquivos**: Lista de documentos/exames
4. **Menu de Ações**: Templates, Atendente Virtual, etc.

## 🤖 Controle do Atendente Virtual

### 🎛️ Toggle de Estado
- **Ativo**: Verde - IA responde automaticamente
- **Pausado**: Cinza - Apenas atendimento manual
- **Persistência**: Estado local (não salvo)

### 🎨 Visualização
- Toggle moderno com animação
- Status textual: "Ativo" / "Pausado"
- Cores dinâmicas baseadas no estado

## 🔌 APIs Necessárias para o Back-end

### 📥 Conversas
- `GET /api/conversations` - Listar conversas
- `GET /api/conversations/:id/messages` - Mensagens da conversa
- `POST /api/conversations/:id/messages` - Enviar mensagem
- `PUT /api/conversations/:id/assign` - Assumir/liberar conversa
- `PUT /api/conversations/:id/flag` - Aplicar flag

### 🏷️ Flags
- `GET /api/flags` - Listar flags
- `POST /api/flags` - Criar flag
- `PUT /api/flags/:id` - Editar flag
- `DELETE /api/flags/:id` - Deletar flag

### 📝 Templates
- `GET /api/templates` - Listar templates
- `POST /api/templates` - Criar template
- `PUT /api/templates/:id` - Editar template
- `DELETE /api/templates/:id` - Deletar template
- `PUT /api/templates/:id/use` - Incrementar contador de uso

### 📁 Arquivos
- `GET /api/conversations/:id/files` - Arquivos do paciente
- `GET /api/files/:id/download` - Download de arquivo

### 📅 Mensagens Programadas
- `POST /api/messages/schedule` - Agendar mensagem
- `GET /api/messages/scheduled` - Listar agendadas
- `DELETE /api/messages/scheduled/:id` - Cancelar agendamento

### 🤖 Atendente Virtual
- `PUT /api/conversations/:id/bot-status` - Ativar/pausar bot
- `GET /api/conversations/:id/bot-status` - Status atual

## 🔄 Fluxos de Dados Críticos

### 1. **Recebimento de Mensagem**
```
Cliente envia → WebSocket → Atualiza lista → Notifica não lida
```

### 2. **Assumir Conversa**
```
Clique "Assumir" → PUT /assign → Atualiza flag → Pausa bot
```

### 3. **Aplicar Template**
```
Seleciona template → Insere no input → PUT /use (contador)
```

### 4. **Busca em Tempo Real**
```
Digite busca → Filtra local → Destaca resultados
```

## 🎯 Considerações para o Back-end

### 🔄 WebSocket/Real-time
- **Essencial** para mensagens em tempo real
- **Eventos**: nova mensagem, mudança de status, flags aplicadas

### 🗄️ Banco de Dados
- **Conversas**: Tabela principal com relacionamentos
- **Mensagens**: Histórico completo com índices para busca
- **Flags**: Sistema flexível de categorização
- **Templates**: Com contadores de uso e categorias

### 🔍 Performance
- **Paginação**: Para listas de conversas e mensagens
- **Cache**: Para templates e flags frequentes
- **Índices**: Para buscas rápidas por texto

### 🔒 Segurança
- **Autorização**: Usuários só veem conversas permitidas
- **Validação**: Todas as entradas de dados
- **Rate Limiting**: Para envio de mensagens

---

📝 **Esta página é o coração do sistema e requer atenção especial na implementação do back-end.**
