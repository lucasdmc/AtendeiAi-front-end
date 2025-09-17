# 🔌 APIs - Visão Geral

## 📋 Resumo das APIs Necessárias

Este documento consolida todas as APIs que o back-end precisa implementar baseado no front-end atual.

## 🗂️ Categorias de APIs

### 👤 Autenticação e Usuários
- **Login/Logout**: Autenticação de usuários
- **Gestão de Usuários**: CRUD completo
- **Perfil**: Gerenciamento de perfil pessoal
- **Permissões**: Controle de acesso por role

### 🏥 Clínicas
- **Gestão de Clínicas**: CRUD completo
- **Configurações**: JSON customizável por clínica
- **Validações**: CNPJ, email únicos

### 💬 Conversas e Mensagens
- **Conversas**: Listagem e gestão
- **Mensagens**: Histórico e envio
- **Estados**: Manual/IA, flags
- **Busca**: Filtros e pesquisa de conteúdo

### 🏷️ Sistema de Flags
- **CRUD**: Criação, edição, exclusão
- **Aplicação**: Aplicar flags em conversas
- **Filtros**: Busca por flags específicas

### 📝 Templates
- **CRUD**: Gestão completa de templates
- **Categorias**: Organização por tipo
- **Uso**: Contador de utilização

### 📅 Agendamentos
- **Consultas**: Gestão de agendamentos
- **Calendário**: Visualizações por período
- **Mensagens**: Agendamento de envios

### 📁 Arquivos
- **Upload**: Documentos e imagens
- **Download**: Recuperação de arquivos
- **Gestão**: Organização por paciente

## 🔄 Padrões de API

### 📊 Estrutura de Resposta Padrão
```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### ❌ Estrutura de Erro Padrão
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "field": "email",
      "issue": "Email já está em uso"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 📄 Paginação Padrão
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔒 Autenticação

### 🎫 JWT Token
```
Authorization: Bearer <token>
```

### 👤 Payload do Token
```json
{
  "user_id": "uuid",
  "clinic_id": "uuid",
  "role": "atendente",
  "permissions": ["read_conversations", "write_messages"],
  "exp": 1640995200
}
```

## 🌐 WebSocket

### 📡 Conexão
```
ws://localhost:3000/ws?token=<jwt_token>
```

### 📨 Eventos Essenciais
```json
// Nova mensagem
{
  "type": "new_message",
  "data": {
    "conversation_id": "uuid",
    "message": Message
  }
}

// Mudança de status
{
  "type": "conversation_status_changed", 
  "data": {
    "conversation_id": "uuid",
    "status": "manual" | "ai",
    "assigned_user_id": "uuid"
  }
}

// Flag aplicada
{
  "type": "flag_applied",
  "data": {
    "conversation_id": "uuid", 
    "flag": Flag
  }
}
```

## 🗄️ Estruturas de Banco Sugeridas

### 👤 Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  login VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  clinic_id UUID REFERENCES clinics(id),
  status user_status DEFAULT 'active',
  avatar_url TEXT,
  department VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  notes TEXT,
  start_date DATE,
  permissions JSONB,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🏥 Tabela: clinics
```sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  cep VARCHAR(9),
  status clinic_status DEFAULT 'active',
  meta_webhook_url TEXT,
  specialties TEXT[],
  opening_hours TEXT,
  description TEXT,
  bot_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 💬 Tabela: conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  clinic_id UUID REFERENCES clinics(id),
  status conversation_status DEFAULT 'active',
  assigned_user_id UUID REFERENCES users(id),
  bot_active BOOLEAN DEFAULT true,
  flags UUID[] REFERENCES flags(id),
  last_message_at TIMESTAMP,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 💬 Tabela: messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_type message_sender_type NOT NULL,
  sender_id UUID, -- user_id se human, null se bot/customer
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  metadata JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🏷️ Tabela: flags
```sql
CREATE TABLE flags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color
  description TEXT,
  clinic_id UUID REFERENCES clinics(id),
  is_system BOOLEAN DEFAULT false, -- Manual/IA flags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 📝 Tabela: templates
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category template_category NOT NULL,
  clinic_id UUID REFERENCES clinics(id),
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Prioridades de Implementação

### 🥇 Fase 1 - Essencial
1. **Autenticação**: Login/logout básico
2. **Usuários**: CRUD básico
3. **Clínicas**: CRUD básico
4. **Conversas**: Listagem e visualização

### 🥈 Fase 2 - Core Features
1. **Mensagens**: Envio e histórico
2. **WebSocket**: Tempo real básico
3. **Flags**: Sistema básico
4. **Templates**: CRUD básico

### 🥉 Fase 3 - Avançado
1. **Busca**: Filtros complexos
2. **Arquivos**: Upload/download
3. **Agendamento**: Mensagens programadas
4. **Analytics**: Métricas e relatórios

---

📝 **Este overview serve como guia para priorização e planejamento do desenvolvimento back-end.**
