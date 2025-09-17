# 📊 Página Dashboard

## 📋 Visão Geral

**Arquivo**: `src/pages/Index.tsx`  
**Rota**: `/`  
**Função**: Página inicial com visão geral do sistema

## 🎨 Layout e Componentes

### 📱 Estrutura da Página
1. **Header**: Título e descrição do sistema
2. **Grid de Módulos**: Cards clicáveis para navegação
3. **Scroll**: Para acomodar todos os módulos

### 🎯 Módulos Disponíveis

#### 🏥 Gestão de Clínicas
- **Ícone**: Building2 (azul)
- **Função**: Cadastro e gestão de clínicas
- **Link**: `/clinics`
- **Descrição**: "Cadastre e gerencie as clínicas do sistema"

#### 👥 Gestão de Usuários
- **Ícone**: Users (verde)
- **Função**: Controle de usuários e permissões
- **Link**: `/users`
- **Descrição**: "Controle os usuários e suas permissões"

#### 📅 Agendamentos
- **Ícone**: CalendarCheck (roxo)
- **Função**: Visualização de consultas
- **Link**: `/appointments`
- **Descrição**: "Visualize e acompanhe os agendamentos"

#### 📆 Agenda
- **Ícone**: Calendar (laranja)
- **Função**: Calendário completo
- **Link**: `/agenda`
- **Descrição**: "Calendário completo para gestão"

#### 💬 Conversas
- **Ícone**: MessageSquare (rosa)
- **Função**: Chat e atendimento
- **Link**: `/conversations`
- **Descrição**: "Chat e atendimento ao cliente"

#### 🤖 Contexto
- **Ícone**: FileText (índigo)
- **Função**: Configuração do chatbot
- **Link**: `/context`
- **Descrição**: "Configure as informações do chatbot"

## 🎨 Design e UX

### 📐 Grid Responsivo
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 3 colunas

### 🎨 Cards Interativos
- **Hover**: Sombra elevada
- **Transição**: Suave (200ms)
- **Ícone**: Colorido e grande (48x48px)
- **Título**: Fonte bold
- **Descrição**: Texto explicativo
- **Link**: Navegação direta

### 🎯 Cores por Módulo
```typescript
const moduleColors = {
  clinics: "text-blue-600",
  users: "text-green-600", 
  appointments: "text-purple-600",
  agenda: "text-orange-600",
  conversations: "text-pink-600",
  context: "text-indigo-600"
}
```

## 📊 Estrutura de Dados

### 🎯 Módulo
```typescript
interface Module {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}
```

### 📋 Lista de Módulos
```typescript
const modules = [
  {
    title: "Gestão de Clínicas",
    description: "Cadastre e gerencie as clínicas do sistema",
    icon: Building2,
    href: "/clinics",
    color: "text-blue-600"
  },
  // ... outros módulos
];
```

## 🔌 APIs Futuras (Sugestões)

### 📊 Dashboard Analytics
```
GET /api/dashboard/stats
Response: {
  total_clinics: number,
  total_users: number,
  active_conversations: number,
  pending_appointments: number,
  messages_today: number,
  bot_interactions: number
}
```

### 📈 Métricas Rápidas
```
GET /api/dashboard/quick-stats
Response: {
  online_users: number,
  unread_conversations: number,
  scheduled_messages: number,
  system_alerts: number
}
```

### 🚨 Alertas do Sistema
```
GET /api/dashboard/alerts
Response: {
  alerts: Alert[],
  total: number
}

interface Alert {
  id: string,
  type: 'info' | 'warning' | 'error',
  title: string,
  message: string,
  created_at: string,
  read: boolean
}
```

## 🎯 Melhorias Futuras

### 📊 KPIs em Tempo Real
- **Conversas ativas**: Número atual
- **Mensagens pendentes**: Aguardando resposta
- **Taxa de resolução**: Percentual de sucesso
- **Tempo médio**: De resposta e resolução

### 📈 Gráficos e Métricas
- **Conversas por dia**: Gráfico de linha
- **Distribuição por tipo**: Pizza (Manual vs IA)
- **Horários de pico**: Heatmap de atividade
- **Performance**: Métricas de atendimento

### 🔔 Notificações
- **Alertas**: Sistema de notificações
- **Badges**: Contadores em tempo real
- **Som**: Notificações sonoras opcionais

### ⚡ Ações Rápidas
- **Botões diretos**: Para ações frequentes
- **Shortcuts**: Atalhos de teclado
- **Quick access**: Últimas conversas/templates

## 🔄 Estados da Interface

### 📊 Loading
- **Cards**: Skeleton loading durante carregamento
- **Métricas**: Placeholder até carregar dados

### ❌ Erro
- **Conexão**: Mensagem de erro de rede
- **Permissão**: Acesso negado a módulos

### ✅ Sucesso
- **Navegação**: Transição suave entre páginas
- **Feedback**: Visual ao clicar nos cards

## 🎯 Considerações para o Back-end

### 🔒 Segurança
- **Permissões**: Módulos baseados no role do usuário
- **Isolamento**: Dados por clínica
- **Auditoria**: Log de acessos ao dashboard

### 📊 Performance
- **Cache**: Métricas frequentes
- **Agregação**: Cálculos pré-processados
- **Compressão**: Para dados grandes

### 🔄 Tempo Real
- **WebSocket**: Para métricas dinâmicas
- **Polling**: Para dados menos críticos
- **Push**: Notificações importantes

---

📝 **Esta página serve como porta de entrada e centro de comando do sistema.**
