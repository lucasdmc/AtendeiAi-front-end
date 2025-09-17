# Documentação do Sistema - AtendeiAi Front-End

## 📋 Visão Geral

Este documento serve como base para o desenvolvimento do back-end do sistema AtendeiAi, detalhando todas as páginas, componentes, funcionalidades e integrações necessárias.

## 📁 Estrutura da Documentação

- [**Páginas Principais**](./pages/) - Documentação de todas as telas do sistema
- [**Componentes**](./components/) - Componentes reutilizáveis e suas funcionalidades
- [**APIs Necessárias**](./apis/) - Endpoints e estruturas de dados requeridas
- [**Fluxos de Dados**](./data-flows/) - Como os dados fluem entre front-end e back-end

## 🎯 Páginas do Sistema

### 📊 Dashboard (`/`)
- **Arquivo**: `src/pages/Index.tsx`
- **Função**: Página inicial com visão geral do sistema
- **Documentação**: [Dashboard](./pages/dashboard.md)

### 💬 Conversas (`/conversations`)
- **Arquivo**: `src/pages/Conversations.tsx`
- **Função**: Tela principal de chat e atendimento
- **Documentação**: [Conversas](./pages/conversations.md)

### 📅 Agendamentos (`/appointments`)
- **Arquivo**: `src/pages/Appointments.tsx`
- **Função**: Gestão de consultas e compromissos
- **Documentação**: [Agendamentos](./pages/appointments.md)

### 📆 Agenda (`/agenda`)
- **Arquivo**: `src/pages/Agenda.tsx`
- **Função**: Calendário completo com visualizações
- **Documentação**: [Agenda](./pages/agenda.md)

### 👥 Usuários (`/users`)
- **Arquivo**: `src/pages/Users.tsx`
- **Função**: Gestão de usuários do sistema
- **Documentação**: [Usuários](./pages/users.md)

### 🏥 Clínicas (`/clinics`)
- **Arquivo**: `src/pages/Clinics.tsx`
- **Função**: Gestão de clínicas e suas configurações
- **Documentação**: [Clínicas](./pages/clinics.md)

### ⚙️ Configurações (`/settings`)
- **Arquivo**: `src/pages/Settings.tsx`
- **Função**: Configurações do sistema e usuário
- **Documentação**: [Configurações](./pages/settings.md)

### 🤖 Contexto do Bot (`/context`)
- **Arquivo**: `src/pages/ContextPage.tsx`
- **Função**: Configuração do comportamento do chatbot
- **Documentação**: [Contexto do Bot](./pages/context.md)

## 🔧 Tecnologias Utilizadas

- **Framework**: React 18 + TypeScript
- **Roteamento**: React Router DOM
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI
- **Ícones**: Lucide React
- **Estado**: React Hooks + Context API
- **Persistência**: localStorage (estado da UI)

## 📊 Dados Mock Atuais

O front-end atualmente utiliza dados mock para demonstração. Todos os dados estão definidos em:
- `src/data/mockData.ts` (dados gerais)
- Dados inline nos componentes (dados específicos)

## 🎯 Próximos Passos

1. **Análise das APIs necessárias** baseada na documentação
2. **Definição dos endpoints** e estruturas de dados
3. **Implementação do back-end** seguindo as especificações
4. **Integração** substituindo dados mock por APIs reais

---

📝 **Nota**: Esta documentação reflete o estado atual do front-end e deve ser atualizada conforme evoluções do sistema.
