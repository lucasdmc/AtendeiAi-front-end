# 💬 Tela de Conversas - Documentação Detalhada

## 📋 Informações Gerais

**URL:** `http://localhost:8080/conversations`  
**Rota:** `/conversations`  
**Arquivo Principal:** `src/pages/Conversations.tsx`  
**Framework:** React + TypeScript  
**State Management:** React Context API + React Query  
**Real-time:** Socket.IO  

---

## 🎨 Arquitetura Visual

### Layout Geral

A tela é dividida em **4 áreas principais**:

```
┌─────┬───────────────┬─────────────────────────────┬──────────────┐
│     │               │                             │              │
│  S  │  Lista de     │    Área Principal           │  Drawer de   │
│  I  │  Conversas    │    do Chat                  │  Contato     │
│  D  │               │                             │  (opcional)  │
│  E  │               │                             │              │
│  B  │               │                             │              │
│  A  │               │                             │              │
│  R  │               │                             │              │
│     │               │                             │              │
└─────┴───────────────┴─────────────────────────────┴──────────────┘
  64px    384px              flex-1 (restante)         440px
```

### Cores e Temas

- **Cor de fundo principal**: `#F5F7FB` (cinza claro)
- **Cor das conversas não lidas**: Badge azul `#3B82F6`
- **Cor das mensagens do cliente**: Verde WhatsApp
- **Cor das mensagens do atendente**: Branco/Cinza claro
- **Overlay quando drawer aberto**: `rgba(0, 0, 0, 0.3)`

---

## 🏗️ Estrutura de Componentes

### Hierarquia de Componentes

```
Conversations (Provider)
├── ConversationsContent
    ├── FilterColumn (drawer lateral esquerdo)
    ├── ConversationsList
    │   ├── SearchBar
    │   ├── ConversationFilters
    │   └── ConversationItem (múltiplos)
    │       └── ConversationMenu
    ├── ChatArea
    │   ├── ChatHeader
    │   ├── MessagesList
    │   │   ├── MessageItem (múltiplos)
    │   │   │   └── MessageMenu
    │   │   └── ScheduledMessageItem
    │   └── MessageInput
    │       ├── AudioRecorder
    │       └── EmojiPicker
    ├── ContactDrawer (drawer lateral direito)
    │   ├── Tab: Contato
    │   └── Tab: Conversa
    ├── TransferDrawer
    ├── ScheduleMessageDrawer
    ├── FinishConversationDrawer
    ├── QuickRepliesDrawer
    └── Modais
        ├── FilesModal
        ├── FlagsModal
        ├── TemplatesModal
        ├── ScheduleModal
        └── FiltersModal
```

### Diretórios e Organização

```
src/pages/Conversations/
├── components/           # Componentes da página
│   ├── ChatArea/        # Área de chat
│   ├── ConversationsList/
│   ├── FilterDrawer/
│   ├── ContactDrawer/
│   ├── TransferDrawer/
│   ├── ScheduleMessageDrawer/
│   ├── FinishConversationDrawer/
│   ├── QuickRepliesDrawer/
│   └── Modals/          # Modais diversos
├── context/             # Context API
├── hooks/               # Custom hooks
├── types/               # TypeScript types
├── utils/               # Utilidades
├── constants/           # Constantes e dados mock
└── styles/              # Estilos específicos
```

---

## 📊 Estado Global (Context)

### ConversationsContext

O contexto gerencia todo o estado da página:

#### Estados Principais

```typescript
interface ConversationsState {
  // Conversa selecionada
  selectedConversation: Conversation | null;
  
  // Busca e filtros
  searchTerm: string;
  activeFilter: string;
  activeTab: 'inbox' | 'waiting' | 'finished';
  
  // UI
  showContactInfo: boolean;
  searchInConversation: boolean;
  conversationSearchTerm: string;
}
```

#### Controle de Drawers

```typescript
// Drawers abertos/fechados
filterColumnOpen: boolean;
contactDrawerOpen: boolean;
contactDrawerTab: 'contact' | 'conversation';
transferDrawerOpen: boolean;
scheduleMessageDrawerOpen: boolean;
finishConversationDrawerOpen: boolean;
quickRepliesDrawerOpen: boolean;
```

#### Modais

```typescript
interface ModalState {
  filesModalOpen: boolean;
  flagsModalOpen: boolean;
  templatesModalOpen: boolean;
  scheduleModalOpen: boolean;
  filterModalOpen: boolean;
}
```

#### Dados da API (React Query)

```typescript
// Conversas
conversations: Conversation[];
conversationsLoading: boolean;
conversationsError: Error | null;

// Mensagens
messages: Message[];
messagesLoading: boolean;
messagesError: Error | null;

// Templates e Flags
templates: Template[];
flags: Flag[];

// Configurações da clínica
clinicSettings: ClinicSettings;
```

---

## 🔍 Componente: Coluna de Filtros

### FilterColumn

**Localização:** Drawer lateral esquerdo  
**Largura:** `320px`  
**Acionamento:** Botão de filtro na lista de conversas

### Funcionalidades

1. **Filtros por Status**
   - Todas as conversas
   - Em andamento
   - Finalizadas
   - Esperando

2. **Filtros por Atendimento**
   - Manual (atendente humano)
   - Automático (IA/Bot)

3. **Filtros por Canais**
   - WhatsApp
   - Telegram
   - Instagram
   - Outros

4. **Filtros por Etiquetas (Tags)**
   - Seleção múltipla
   - Contador de conversas por tag

5. **Filtros por Data**
   - Hoje
   - Esta semana
   - Este mês
   - Período customizado

---

## 📝 Componente: Lista de Conversas

### ConversationsList

**Largura:** `384px`  
**Altura:** `100vh`

### Estrutura

#### 1. Header da Lista

```
┌──────────────────────────────────┐
│  [Ícone Filtro]  "Conversas"     │
│  [Campo de busca]                │
│  [Filtros Rápidos]               │
└──────────────────────────────────┘
```

**Elementos:**
- Botão de filtro (abre FilterColumn)
- Título "Conversas"
- Campo de busca com ícone de lupa
- Filtros rápidos (chips)

#### 2. Filtros Rápidos (Chips)

- **Tudo**: Todas as conversas
- **Manual**: Apenas atendimento humano
- **IA**: Apenas atendimento automático
- **Não lidas**: Com mensagens não lidas
- **Flags**: Abre modal de seleção de flags

#### 3. Tabs de Organização

```
┌────────┬─────────┬───────────┐
│ Inbox  │ Waiting │ Finished  │
└────────┴─────────┴───────────┘
```

- **Inbox**: Conversas ativas
- **Waiting**: Conversas aguardando
- **Finished**: Conversas finalizadas

#### 4. Lista de Conversas

Cada item de conversa mostra:

```
┌─────────────────────────────────────┐
│ [Avatar] Nome do Contato        [⋮] │
│          Última mensagem...          │
│          10:30 AM          [Badge 2] │
└─────────────────────────────────────┘
```

**Informações Exibidas:**
- Avatar do contato (foto ou iniciais)
- Nome do contato
- Última mensagem (truncada)
- Horário da última mensagem
- Badge de não lidas (se houver)
- Menu de ações (⋮)

**Estados Visuais:**
- **Selecionada**: Fundo azul claro
- **Não lida**: Texto em negrito, badge azul
- **Grupo**: Ícone de grupo no avatar
- **Newsletter**: Ícone de megafone

### ConversationMenu

**Acionamento:** Clique no ícone (⋮)

**Ações Disponíveis:**
1. **Marcar como não lida** (👁️)
2. **Arquivar** (📦)
3. **Aplicar flag** (🏷️)
4. **Transferir** (👥)
5. **Finalizar conversa** (✓)
6. **Deletar conversa** (🗑️) - vermelho

---

## 💬 Componente: Área de Chat

### ChatArea

**Localização:** Centro da tela  
**Largura:** Restante do espaço (`flex-1`)

### Estrutura

#### 1. ChatHeader

```
┌─────────────────────────────────────────────────────┐
│ [Avatar] Nome do Contato            [🔍] [i] [⋮]    │
│          Online / Visto há 5 min                    │
└─────────────────────────────────────────────────────┘
```

**Elementos:**
- Avatar do contato
- Nome do contato
- Status online/último visto
- Botão de busca na conversa (🔍)
- Botão de informações do contato (i)
- Menu de ações (⋮)

**Menu de Ações do Header:**
1. Dados do contato
2. Arquivos e mídias
3. Aplicar flag
4. Transferir conversa
5. Agendar mensagem
6. Finalizar conversa

#### 2. Campo de Busca na Conversa (opcional)

Quando ativado, aparece abaixo do header:

```
┌─────────────────────────────────────────────────────┐
│  [🔍] Buscar mensagens...              [✕] [↑] [↓]  │
└─────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Busca em tempo real
- Navegação entre resultados (↑ ↓)
- Destaque visual nas mensagens encontradas
- Fechar busca (✕)

#### 3. MessagesList

**Área Principal:** Scrollável, carrega mensagens sob demanda

**Tipos de Mensagens:**

##### a) Mensagem do Cliente

```
                    ┌──────────────────────────┐
                    │ Olá, gostaria de         │
                    │ agendar uma consulta     │
                    │                    10:30 │
                    └──────────────────────────┘
```

- Alinhada à direita
- Fundo verde WhatsApp
- Texto branco
- Timestamp no canto inferior direito

##### b) Mensagem do Atendente/Bot

```
┌──────────────────────────┐
│ Olá! Claro, posso        │
│ ajudar com o agendamento │
│ 10:32                ✓✓  │
└──────────────────────────┘
```

- Alinhada à esquerda
- Fundo branco/cinza claro
- Texto preto
- Timestamp no canto inferior esquerdo
- Status de entrega (✓ enviada, ✓✓ lida)

##### c) Mensagem de Sistema

```
        ╔════════════════════════════════╗
        ║ Conversa assumida por Paulo R. ║
        ╚════════════════════════════════╝
```

- Centralizada
- Fundo amarelo claro
- Texto em cinza
- Sem avatar

##### d) Mensagem Agendada

```
┌──────────────────────────────────────┐
│ 📅 MENSAGEM AGENDADA                 │
│ Lembrete: sua consulta é amanhã      │
│ Enviará em: 25/12/2024 às 09:00     │
│                      [Editar] [✕]    │
└──────────────────────────────────────┘
```

- Fundo azul claro
- Ícone de calendário
- Informação de quando será enviada
- Botões de editar e cancelar

##### e) Mensagem com Mídia

**Imagem:**
```
┌──────────────────┐
│                  │
│  [Thumbnail]     │
│                  │
│  Legenda aqui    │
│           10:45  │
└──────────────────┘
```

**Documento:**
```
┌──────────────────────────┐
│ 📄 documento.pdf         │
│ 2.4 MB                   │
│ [Baixar] [Visualizar]    │
│                   10:45  │
└──────────────────────────┘
```

**Áudio:**
```
┌──────────────────────────┐
│ 🎤 [▶] ────────○──  0:15 │
│                   10:45  │
└──────────────────────────┘
```

**Mensagens com Grupos:**

Para mensagens de grupos, exibe informações do remetente:

```
┌──────────────────────────┐
│ João Silva               │
│ Concordo com a proposta  │
│ 10:32                    │
└──────────────────────────┘
```

#### 4. MessageInput

```
┌────────────────────────────────────────────────────┐
│ [Modo: Mensagem ▼]  Paulo R. [✓ Assinar]          │
├────────────────────────────────────────────────────┤
│ [😊] [📎] [🎤]                                     │
│                                                    │
│ Digite sua mensagem...                            │
│                                                    │
│                                      [📅] [Enviar] │
└────────────────────────────────────────────────────┘
```

**Header do Input:**
- **Modo**: Toggle entre "Mensagem" e "Nota interna"
- **Nome do Agente**: "Paulo R."
- **Checkbox Assinar**: Adiciona assinatura ao fim da mensagem

**Toolbar Superior:**
- **😊 Emoji Picker**: Abre seletor de emojis
- **📎 Anexar**: Anexar arquivos/mídias
- **🎤 Áudio**: Gravar mensagem de áudio

**Área de Texto:**
- Campo multilinhas
- Auto-expand até 5 linhas
- Placeholder: "Digite sua mensagem..."

**Toolbar Inferior:**
- **📅 Agendar**: Abre modal de agendamento
- **Enviar**: Envia a mensagem (ou Ctrl+Enter)

**Modo Nota Interna:**

Quando no modo "Nota":
- Fundo amarelo suave
- Ícone de nota (📝)
- Texto em itálico
- Nota visível apenas para atendentes

---

## 🗂️ Componente: Drawer de Contato

### ContactDrawer

**Localização:** Lateral direita  
**Largura:** `440px`  
**Acionamento:** 
- Clique no botão (i) no header do chat
- Clique em "Dados do contato" no menu

### Estrutura em Tabs

#### Tab 1: Contato

```
┌─────────────────────────────────────┐
│         [Avatar Grande]             │
│       Nome do Contato               │
│       +55 11 98765-4321             │
├─────────────────────────────────────┤
│ 📱 Telefone                         │
│    +55 11 98765-4321                │
│                                     │
│ 📧 E-mail                           │
│    contato@email.com                │
│                                     │
│ 🏷️ Tags                             │
│    [VIP] [Cliente] [+]              │
│                                     │
│ 📝 Observações                      │
│    Cliente desde 2020...            │
│                                     │
│ 🗂️ Campos Personalizados            │
│    CPF: 123.456.789-00              │
│    Convênio: Unimed                 │
├─────────────────────────────────────┤
│            [Editar Contato]         │
└─────────────────────────────────────┘
```

**Seções:**
1. **Header**: Avatar, nome, telefone
2. **Dados de Contato**: Telefone, e-mail
3. **Tags**: Lista de tags aplicadas, botão para adicionar
4. **Observações**: Campo de texto livre
5. **Campos Personalizados**: Dados extras (CPF, convênio, etc.)
6. **Botão Editar**: Abre formulário de edição

#### Tab 2: Conversa

```
┌─────────────────────────────────────┐
│ ℹ️ Informações da Conversa          │
├─────────────────────────────────────┤
│ 📊 Status                           │
│    🟢 Ativa                         │
│                                     │
│ 👤 Atendente                        │
│    Paulo Ribeiro                    │
│                                     │
│ 🏷️ Flags                            │
│    [Manual] [Prioridade Alta]       │
│                                     │
│ 📅 Criada em                        │
│    20/12/2024 às 09:15             │
│                                     │
│ ⏰ Última atividade                 │
│    Há 5 minutos                    │
│                                     │
│ 📝 Notas Internas                   │
│    [Lista de notas...]             │
│                                     │
│ 📁 Arquivos Compartilhados          │
│    [Lista de arquivos...]          │
├─────────────────────────────────────┤
│         [Ver Histórico Completo]    │
└─────────────────────────────────────┘
```

**Seções:**
1. **Status**: Estado atual da conversa
2. **Atendente**: Quem está atendendo
3. **Flags**: Tags da conversa
4. **Timestamps**: Criação e última atividade
5. **Notas Internas**: Anotações dos atendentes
6. **Arquivos**: Mídias compartilhadas
7. **Histórico**: Botão para ver histórico completo

---

## 🚀 Componente: Drawers de Ação

### 1. TransferDrawer

**Finalidade:** Transferir conversa para outro atendente ou setor

```
┌────────────────────────────────────┐
│ Transferir Conversa            [✕] │
├────────────────────────────────────┤
│                                    │
│ 📋 Tipo de Transferência           │
│  ○ Atendente                       │
│  ● Setor                           │
│                                    │
│ 👥 Selecione o Setor               │
│  [Dropdown com setores]            │
│                                    │
│ 💬 Mensagem (opcional)             │
│  [Campo de texto]                  │
│                                    │
│                                    │
│         [Cancelar] [Transferir]    │
└────────────────────────────────────┘
```

**Funcionalidades:**
- Seleção entre Atendente ou Setor
- Dropdown de atendentes/setores disponíveis
- Campo opcional para mensagem
- Validação: requer seleção

### 2. ScheduleMessageDrawer

**Finalidade:** Agendar envio de mensagem

```
┌────────────────────────────────────┐
│ Agendar Mensagem               [✕] │
├────────────────────────────────────┤
│                                    │
│ 💬 Mensagem                        │
│  [Campo de texto multilinha]      │
│                                    │
│ 📅 Data                            │
│  [Seletor de data]                │
│                                    │
│ ⏰ Horário                         │
│  [Seletor de hora]                │
│                                    │
│ 🔔 Lembrete                        │
│  ☑ Me notificar quando enviar     │
│                                    │
│                                    │
│         [Cancelar] [Agendar]       │
└────────────────────────────────────┘
```

**Validações:**
- Mensagem obrigatória
- Data e hora obrigatórias
- Data não pode ser no passado
- Horário mínimo: daqui a 5 minutos

### 3. FinishConversationDrawer

**Finalidade:** Finalizar atendimento

```
┌────────────────────────────────────┐
│ Finalizar Conversa             [✕] │
├────────────────────────────────────┤
│                                    │
│ 🎯 Motivo (obrigatório)            │
│  [Dropdown]                        │
│   - Problema resolvido             │
│   - Cliente não respondeu          │
│   - Transferido para outro canal   │
│   - Outros                         │
│                                    │
│ 💬 Observações (opcional)          │
│  [Campo de texto]                  │
│                                    │
│ 📊 Avaliação do Atendimento        │
│  [⭐⭐⭐⭐⭐]                        │
│                                    │
│ 🤖 Ações Automáticas               │
│  ☑ Enviar pesquisa de satisfação  │
│  ☑ Arquivar conversa              │
│                                    │
│                                    │
│         [Cancelar] [Finalizar]     │
└────────────────────────────────────┘
```

**Funcionalidades:**
- Motivo obrigatório
- Campo de observações
- Avaliação interna (1-5 estrelas)
- Ações automáticas configuráveis

### 4. QuickRepliesDrawer

**Finalidade:** Respostas rápidas e templates

```
┌────────────────────────────────────┐
│ Respostas Rápidas              [✕] │
├────────────────────────────────────┤
│ [🔍 Buscar...]                     │
├────────────────────────────────────┤
│                                    │
│ 📂 Saudações                       │
│  ├─ Bom dia ☀️                    │
│  ├─ Boa tarde 🌤️                  │
│  └─ Boa noite 🌙                   │
│                                    │
│ 📂 Agendamentos                    │
│  ├─ Confirmar consulta            │
│  ├─ Reagendar consulta            │
│  └─ Cancelar consulta             │
│                                    │
│ 📂 Financeiro                      │
│  ├─ Solicitar pagamento           │
│  ├─ Confirmar pagamento           │
│  └─ Enviar boleto                 │
│                                    │
│ 📂 Despedidas                      │
│  └─ Até logo                      │
│                                    │
├────────────────────────────────────┤
│        [+ Nova Resposta Rápida]    │
└────────────────────────────────────┘
```

**Funcionalidades:**
- Busca por nome ou conteúdo
- Organização por categorias
- Preview do conteúdo ao hover
- Clique insere no input
- Link para gerenciar templates

---

## 🎭 Modais

### 1. FilesModal

**Finalidade:** Visualizar arquivos e mídias da conversa

```
┌─────────────────────────────────────────────┐
│ Arquivos e Documentos                   [✕] │
├─────────────────────────────────────────────┤
│ [Todos] [Imagens] [Documentos] [Áudios]    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ IMG    │ │ IMG    │ │ PDF    │          │
│  │ 10/12  │ │ 12/12  │ │ 15/12  │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  ┌────────┐ ┌────────┐                     │
│  │ MP3    │ │ MP4    │                     │
│  │ 18/12  │ │ 20/12  │                     │
│  └────────┘ └────────┘                     │
│                                             │
├─────────────────────────────────────────────┤
│               [Baixar Todos] [Fechar]       │
└─────────────────────────────────────────────┘
```

**Funcionalidades:**
- Filtros por tipo de arquivo
- Grid de thumbnails
- Clique para visualizar em tela cheia
- Download individual ou em lote
- Ordenação por data

### 2. FlagsModal

**Finalidade:** Aplicar flags/etiquetas à conversa

```
┌─────────────────────────────────────┐
│ Aplicar Flag                    [✕] │
├─────────────────────────────────────┤
│ [🔍 Buscar flags...]               │
├─────────────────────────────────────┤
│                                     │
│  ☑ [VIP] Cliente VIP               │
│  ☐ [Urgente] Prioridade Alta       │
│  ☑ [Financeiro] Pendência          │
│  ☐ [Suporte] Problema Técnico      │
│  ☐ [Vendas] Oportunidade           │
│                                     │
├─────────────────────────────────────┤
│        [+ Criar Nova Flag]          │
│                                     │
│         [Cancelar] [Aplicar]        │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Seleção múltipla
- Busca por nome
- Cores personalizadas
- Link para criar nova flag
- Contador de flags aplicadas

### 3. TemplatesModal

**Finalidade:** Usar templates de mensagem

```
┌─────────────────────────────────────┐
│ Usar Template                   [✕] │
├─────────────────────────────────────┤
│ [🔍 Buscar...]                     │
├─────────────────────────────────────┤
│ [Todos] [Saudação] [Agendamento]   │
│ [Financeiro] [Despedida] [Outro]   │
├─────────────────────────────────────┤
│                                     │
│ 📝 Bom dia ☀️                      │
│    Olá! Bom dia. Como posso...     │
│    Usado 145 vezes                 │
│                       [Visualizar]  │
│                                     │
│ 📝 Confirmar Agendamento           │
│    Sua consulta está confirmada... │
│    Usado 89 vezes                  │
│                       [Visualizar]  │
│                                     │
├─────────────────────────────────────┤
│        [+ Criar Novo Template]      │
│                                     │
│             [Fechar]                │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Busca por nome ou conteúdo
- Filtros por categoria
- Preview ao visualizar
- Contador de uso
- Link para gerenciar templates
- Clique insere no input

### 4. ScheduleModal

**Finalidade:** Programar envio de mensagem (versão modal)

_Similar ao ScheduleMessageDrawer, mas em formato modal_

### 5. FiltersModal

**Finalidade:** Filtros avançados

```
┌─────────────────────────────────────┐
│ Filtros Avançados               [✕] │
├─────────────────────────────────────┤
│                                     │
│ 🗓️ Período                         │
│  ○ Hoje                            │
│  ○ Esta semana                     │
│  ○ Este mês                        │
│  ● Personalizado                   │
│    De: [20/12/2024]                │
│    Até: [25/12/2024]               │
│                                     │
│ 👤 Atendente                       │
│  [Dropdown - Todos]                │
│                                     │
│ 📊 Status                          │
│  ☑ Ativas                          │
│  ☐ Arquivadas                      │
│  ☑ Aguardando                      │
│  ☐ Finalizadas                     │
│                                     │
│ 🏷️ Flags                           │
│  [Multi-select]                    │
│                                     │
│ 📱 Canal                           │
│  ☑ WhatsApp                        │
│  ☐ Telegram                        │
│  ☐ Instagram                       │
│                                     │
│                                     │
│      [Limpar] [Aplicar Filtros]    │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Múltiplos critérios combinados
- Período customizado
- Filtro por atendente
- Filtro por status
- Filtro por flags
- Filtro por canal
- Botão para limpar filtros

---

## 🎼 Componentes Especiais

### AudioRecorder

**Finalidade:** Gravar e enviar áudios

**Estados:**

#### 1. Idle (Botão de Microfone)
```
[🎤]
```

#### 2. Gravando
```
┌──────────────────────────────┐
│ ⏺️ 00:15                    │
│ [▮▮▮▮▯▯▯▯▯▯] Gravando...   │
│ [🗑️ Cancelar] [⏸️ Pausar]  │
└──────────────────────────────┘
```

#### 3. Pausado
```
┌──────────────────────────────┐
│ ⏸️ 00:15                    │
│ [▮▮▮▮▯▯▯▯▯▯] Pausado       │
│ [🗑️ Cancelar] [▶️ Continuar]│
└──────────────────────────────┘
```

#### 4. Pronto para Enviar
```
┌──────────────────────────────┐
│ 🎤 00:15                     │
│ [▶️] ──────○─────────────   │
│ [🗑️ Descartar] [📤 Enviar]  │
└──────────────────────────────┘
```

**Funcionalidades:**
- Gravação com timer
- Visualização de forma de onda
- Pausar/continuar
- Reproduzir antes de enviar
- Cancelar/descartar
- Limite de 5 minutos

### AudioPlayer

**Finalidade:** Reproduzir mensagens de áudio

```
┌──────────────────────────────┐
│ 🎤 [▶️] ──○──────────  00:15 │
│                   1.0x  [⋯] │
└──────────────────────────────┘
```

**Funcionalidades:**
- Play/pause
- Seek (arrastar bolinha)
- Velocidade (1.0x, 1.5x, 2.0x)
- Download
- Timestamp com duração total
- Forma de onda visualizada

### EmojiPicker

**Finalidade:** Seletor de emojis

```
┌────────────────────────────────────┐
│ [🔍 Buscar emoji...]              │
├────────────────────────────────────┤
│ [😀] [🎉] [❤️] [👍] [🙏]         │
├────────────────────────────────────┤
│ Recentes                          │
│ 😊 😂 👍 ❤️ 🎉 🙌 ...            │
│                                    │
│ Smileys e Pessoas                 │
│ 😀 😃 😄 😁 😆 😅 ...            │
│                                    │
│ Animais e Natureza                │
│ 🐶 🐱 🐭 🐹 🐰 🦊 ...            │
│                                    │
│ Comida e Bebida                   │
│ 🍎 🍊 🍋 🍌 🍉 🍇 ...            │
│                                    │
└────────────────────────────────────┘
```

**Funcionalidades:**
- Busca por palavra-chave
- Categorias organizadas
- Recentes (últimos 10 usados)
- Clique insere no input
- Skin tone selector

---

## 🔌 Integração com Backend

### Endpoints da API

#### Conversas

```typescript
// Listar conversas
GET /api/conversations
Query: {
  clinic_id: string;
  status?: 'active' | 'archived' | 'finished';
  assigned_user_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
Response: {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
}

// Obter conversa específica
GET /api/conversations/:id
Response: Conversation

// Assumir conversa (manual)
PUT /api/conversations/:id/assign
Body: { user_id: string }
Response: Conversation

// Liberar conversa (para IA)
PUT /api/conversations/:id/release
Response: Conversation

// Aplicar flag
PUT /api/conversations/:id/flags
Body: { flag_ids: string[] }
Response: Conversation

// Arquivar conversa
PUT /api/conversations/:id/archive
Response: Conversation

// Finalizar conversa
PUT /api/conversations/:id/finish
Body: {
  reason: string;
  notes?: string;
  rating?: number;
}
Response: Conversation

// Deletar conversa
DELETE /api/conversations/:id
Response: { success: boolean }
```

#### Mensagens

```typescript
// Listar mensagens da conversa
GET /api/conversations/:conversation_id/messages
Query: {
  limit?: number;
  offset?: number;
  before?: string; // ISO timestamp
}
Response: {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

// Enviar mensagem
POST /api/conversations/:conversation_id/messages
Body: {
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  media_url?: string;
  is_internal_note?: boolean;
}
Response: Message

// Marcar mensagens como lidas
PUT /api/conversations/:conversation_id/messages/read
Body: { message_ids: string[] }
Response: { success: boolean }

// Deletar mensagem
DELETE /api/messages/:id
Response: { success: boolean }
```

#### Templates

```typescript
// Listar templates
GET /api/templates
Query: {
  clinic_id: string;
  category?: string;
  search?: string;
}
Response: Template[]

// Usar template (incrementar contador)
PUT /api/templates/:id/use
Response: Template
```

#### Flags

```typescript
// Listar flags
GET /api/flags
Query: { clinic_id: string }
Response: Flag[]
```

#### Agendamento

```typescript
// Agendar mensagem
POST /api/messages/schedule
Body: {
  conversation_id: string;
  message: string;
  scheduled_at: string; // ISO timestamp
}
Response: ScheduledMessage

// Listar mensagens agendadas
GET /api/messages/scheduled
Query: { conversation_id: string }
Response: ScheduledMessage[]

// Cancelar agendamento
DELETE /api/messages/scheduled/:id
Response: { success: boolean }
```

#### Transferência

```typescript
// Transferir conversa
POST /api/conversations/:id/transfer
Body: {
  type: 'user' | 'sector';
  target_id: string;
  message?: string;
}
Response: Conversation
```

#### Arquivos

```typescript
// Listar arquivos da conversa
GET /api/conversations/:id/files
Query: {
  type?: 'image' | 'document' | 'audio' | 'video';
}
Response: PatientFile[]

// Upload de arquivo
POST /api/files/upload
Body: FormData with file
Response: { url: string; file_id: string }
```

### WebSocket Events

**Conexão:**
```typescript
// Cliente conecta
socket.on('connect', () => {
  socket.emit('join', { clinic_id, user_id });
});
```

**Eventos Recebidos:**

```typescript
// Nova mensagem recebida
socket.on('message:new', (data: {
  conversation_id: string;
  message: Message;
}) => {
  // Atualizar lista de mensagens
  // Incrementar contador de não lidas
  // Tocar notificação sonora
});

// Mensagem lida
socket.on('message:read', (data: {
  conversation_id: string;
  message_ids: string[];
}) => {
  // Atualizar status das mensagens
});

// Conversa atualizada
socket.on('conversation:updated', (data: {
  conversation: Conversation;
}) => {
  // Atualizar dados da conversa
  // Reordenar lista se necessário
});

// Digitando...
socket.on('typing', (data: {
  conversation_id: string;
  user_name: string;
  is_typing: boolean;
}) => {
  // Mostrar/ocultar indicador de digitação
});

// Conversa transferida
socket.on('conversation:transferred', (data: {
  conversation_id: string;
  from_user_id: string;
  to_user_id: string;
}) => {
  // Atualizar atendente
  // Mostrar notificação
});
```

**Eventos Enviados:**

```typescript
// Marcar como digitando
socket.emit('typing:start', {
  conversation_id: string;
});

socket.emit('typing:stop', {
  conversation_id: string;
});

// Entrar em uma conversa (sala)
socket.emit('conversation:join', {
  conversation_id: string;
});

// Sair de uma conversa
socket.emit('conversation:leave', {
  conversation_id: string;
});
```

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  - Sidebar oculta (hamburguer menu)
  - Lista de conversas em overlay
  - Chat ocupa tela inteira
  - Drawer de contato em fullscreen
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  - Sidebar minimizada
  - Lista de conversas reduzida (280px)
  - Chat visível
  - Drawer de contato overlay
}

/* Desktop */
@media (min-width: 1025px) {
  - Layout completo com 4 colunas
  - Todas as áreas visíveis
}
```

### Adaptações Mobile

**Lista de Conversas:**
- Swipe para deletar/arquivar
- Pull-to-refresh
- Scroll infinito

**Chat:**
- Botões de ação maiores
- Input fixo na parte inferior
- Fab button para scroll to bottom

**Drawers:**
- Fullscreen em vez de lateral
- Animação de baixo para cima
- Botão voltar no header

---

## ♿ Acessibilidade

### ARIA Labels

```html
<!-- Exemplo de conversa -->
<div role="button" 
     aria-label="Conversa com João Silva, última mensagem há 5 minutos, 2 não lidas"
     tabindex="0">
  ...
</div>

<!-- Exemplo de mensagem -->
<div role="article"
     aria-label="Mensagem de João Silva às 10:30, Olá gostaria de agendar">
  ...
</div>

<!-- Exemplo de input -->
<textarea
  aria-label="Digite sua mensagem"
  aria-describedby="char-count"
  placeholder="Digite sua mensagem...">
</textarea>
```

### Navegação por Teclado

```
Tab        - Navegar entre elementos
Enter      - Selecionar/ativar
Esc        - Fechar modais/drawers
Ctrl+F     - Abrir busca
Ctrl+K     - Abrir templates
↑↓         - Navegar lista de conversas
Ctrl+Enter - Enviar mensagem
```

### Contraste e Cores

- **Ratio mínimo**: 4.5:1 para texto normal
- **Ratio mínimo**: 3:1 para texto grande
- **Indicadores de foco**: Visíveis em todos os elementos interativos
- **Modo escuro**: Suporte futuro

---

## ⚡ Performance

### Otimizações Implementadas

1. **Virtual Scrolling**
   - Lista de conversas: renderiza apenas itens visíveis
   - Lista de mensagens: renderiza apenas mensagens visíveis
   - Reduz DOM nodes e melhora scroll

2. **Lazy Loading**
   - Mensagens carregadas sob demanda (scroll)
   - Imagens carregadas apenas quando visíveis
   - Áudios carregados apenas ao reproduzir

3. **Debounce e Throttle**
   - Busca: debounce de 300ms
   - Scroll: throttle de 100ms
   - Digitando: debounce de 500ms

4. **React Query**
   - Cache de conversas (5 minutos)
   - Cache de mensagens (2 minutos)
   - Refetch automático em foco
   - Otimistic updates

5. **Memoization**
   - `useMemo` para cálculos pesados
   - `useCallback` para handlers
   - `React.memo` em componentes de lista

6. **Code Splitting**
   - Modais carregados sob demanda
   - Drawers carregados sob demanda
   - EmojiPicker lazy loaded

### Métricas de Performance

**Targets:**
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTI (Time to Interactive)**: < 3.5s

---

## 🧪 Testes

### Tipos de Testes

1. **Testes Unitários**
   - Hooks customizados
   - Funções utilitárias
   - Componentes isolados

2. **Testes de Integração**
   - Fluxo de envio de mensagem
   - Fluxo de transferência
   - Fluxo de agendamento

3. **Testes E2E**
   - Cenário completo de atendimento
   - Múltiplas conversas simultâneas

### Coverage

```
Statements   : 85%
Branches     : 80%
Functions    : 85%
Lines        : 85%
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Mensagens não aparecem

**Causa:** WebSocket desconectado  
**Solução:** Verificar conexão, reconectar automaticamente

#### 2. Lista de conversas não atualiza

**Causa:** Cache do React Query  
**Solução:** Invalidar query após ação

#### 3. Áudio não grava

**Causa:** Permissão do navegador  
**Solução:** Solicitar permissão, mostrar mensagem de erro

#### 4. Performance ruim com muitas conversas

**Causa:** Renderização excessiva  
**Solução:** Implementar virtual scrolling

#### 5. Emojis não renderizam

**Causa:** Fonte não suportada  
**Solução:** Usar fallback SVG

---

## 📚 Recursos Adicionais

### Documentações Relacionadas

- [Documentação do Backend](/docs/backend/api.md)
- [Guia de Componentes](/docs/components/ui-components.md)
- [Fluxos de Dados](/docs/data-flows/conversation-flow.md)
- [Endpoints da API](/docs/apis/endpoints.md)

### Bibliotecas Utilizadas

- **React Query**: Cache e sincronização de dados
- **Socket.IO**: Real-time communication
- **DayJS**: Manipulação de datas
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Lucide React**: Ícones
- **Tailwind CSS**: Estilização
- **Radix UI**: Primitivos de UI

---

## 🔄 Changelog

### Versão Atual (2024-12-25)

**Implementado:**
- ✅ Sistema completo de conversas
- ✅ Chat em tempo real
- ✅ Suporte a múltiplos tipos de mídia
- ✅ Sistema de flags e templates
- ✅ Drawers de ação (transferir, agendar, finalizar)
- ✅ Notas internas
- ✅ Busca em conversas e mensagens
- ✅ Filtros avançados
- ✅ Gravação de áudio
- ✅ Emoji picker
- ✅ Indicador de digitação
- ✅ Confirmações de leitura

**Pendente:**
- ⏳ Modo escuro
- ⏳ Suporte a videochamadas
- ⏳ Integração com calendário
- ⏳ Tradução automática
- ⏳ Chatbots customizáveis
- ⏳ Relatórios e analytics

---

**Documento criado em**: 25 de Dezembro de 2024  
**Última atualização**: 25 de Dezembro de 2024  
**Versão**: 1.0  
**Autor**: Equipe de Desenvolvimento

