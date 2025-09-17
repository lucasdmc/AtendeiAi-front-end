# 🔌 Endpoints Detalhados

## 📋 Resumo de Todos os Endpoints

Lista completa de APIs necessárias para o funcionamento do front-end.

## 🔐 Autenticação

### 🎫 Login
```
POST /api/auth/login
Body: {
  login: string,
  password: string
}

Response: {
  success: true,
  data: {
    token: string,
    user: {
      id: string,
      name: string,
      role: string,
      clinic_id: string
    }
  }
}
```

### 🚪 Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  message: "Logout realizado com sucesso"
}
```

### ✅ Validar Token
```
GET /api/auth/validate
Headers: Authorization: Bearer <token>

Response: {
  valid: true,
  user: User
}
```

## 👥 Usuários

### 📊 Listar Usuários
```
GET /api/users
Query: ?search=string&role=string&status=string&page=number&limit=number
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    users: User[],
    pagination: PaginationInfo
  }
}
```

### ➕ Criar Usuário
```
POST /api/users
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  login: string,
  email: string,
  password: string,
  role: UserRole,
  clinic_id: string,
  department?: string,
  phone?: string,
  address?: string,
  notes?: string,
  start_date?: string,
  permissions?: string[]
}

Response: {
  success: true,
  data: User,
  message: "Usuário criado com sucesso"
}
```

### ✏️ Editar Usuário
```
PUT /api/users/:id
Headers: Authorization: Bearer <token>
Body: Partial<User>

Response: {
  success: true,
  data: User,
  message: "Usuário atualizado com sucesso"
}
```

### 🗑️ Deletar Usuário
```
DELETE /api/users/:id
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  message: "Usuário deletado com sucesso"
}
```

## 🏥 Clínicas

### 📊 Listar Clínicas
```
GET /api/clinics
Query: ?search=string&status=string&page=number&limit=number
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    clinics: Clinic[],
    pagination: PaginationInfo
  }
}
```

### ➕ Criar Clínica
```
POST /api/clinics
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  cnpj: string,
  phone: string,
  email: string,
  address?: string,
  city?: string,
  state?: string,
  cep?: string,
  meta_webhook_url?: string,
  specialties?: string[],
  opening_hours?: string,
  description?: string
}

Response: {
  success: true,
  data: Clinic,
  message: "Clínica criada com sucesso"
}
```

### ⚙️ Configuração JSON
```
PUT /api/clinics/:id/config
Headers: Authorization: Bearer <token>
Body: {
  config: object
}

Response: {
  success: true,
  message: "Configuração salva com sucesso"
}
```

## 💬 Conversas

### 📊 Listar Conversas
```
GET /api/conversations
Query: ?search=string&status=string&assigned=string&flags=string&unread=boolean&page=number&limit=number
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    conversations: Conversation[],
    pagination: PaginationInfo
  }
}
```

### 💬 Mensagens da Conversa
```
GET /api/conversations/:id/messages
Query: ?search=string&page=number&limit=number
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    messages: Message[],
    pagination: PaginationInfo
  }
}
```

### ✉️ Enviar Mensagem
```
POST /api/conversations/:id/messages
Headers: Authorization: Bearer <token>
Body: {
  content: string,
  type: 'text' | 'image' | 'document',
  metadata?: object
}

Response: {
  success: true,
  data: Message,
  message: "Mensagem enviada com sucesso"
}
```

### 🔄 Assumir/Liberar Conversa
```
PUT /api/conversations/:id/assign
Headers: Authorization: Bearer <token>
Body: {
  action: 'assign' | 'release',
  user_id?: string
}

Response: {
  success: true,
  data: {
    conversation_id: string,
    assigned_user_id: string | null,
    bot_active: boolean
  }
}
```

### 🏷️ Aplicar Flag
```
PUT /api/conversations/:id/flags
Headers: Authorization: Bearer <token>
Body: {
  flag_id: string,
  action: 'add' | 'remove'
}

Response: {
  success: true,
  data: {
    conversation_id: string,
    flags: string[]
  }
}
```

## 🏷️ Flags

### 📊 Listar Flags
```
GET /api/flags
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: Flag[]
}
```

### ➕ Criar Flag
```
POST /api/flags
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  color: string,
  description?: string
}

Response: {
  success: true,
  data: Flag,
  message: "Flag criada com sucesso"
}
```

### ✏️ Editar Flag
```
PUT /api/flags/:id
Headers: Authorization: Bearer <token>
Body: {
  name?: string,
  color?: string,
  description?: string
}

Response: {
  success: true,
  data: Flag,
  message: "Flag atualizada com sucesso"
}
```

### 🗑️ Deletar Flag
```
DELETE /api/flags/:id
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  message: "Flag deletada com sucesso"
}
```

## 📝 Templates

### 📊 Listar Templates
```
GET /api/templates
Query: ?category=string&search=string
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: Template[]
}
```

### ➕ Criar Template
```
POST /api/templates
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  content: string,
  category: TemplateCategory
}

Response: {
  success: true,
  data: Template,
  message: "Template criado com sucesso"
}
```

### 📈 Usar Template
```
PUT /api/templates/:id/use
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    template_id: string,
    usage_count: number
  }
}
```

## 📁 Arquivos

### 📊 Listar Arquivos do Paciente
```
GET /api/conversations/:id/files
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: PatientFile[]
}
```

### 📤 Upload de Arquivo
```
POST /api/files/upload
Headers: Authorization: Bearer <token>
Body: FormData {
  file: File,
  conversation_id: string,
  type: 'image' | 'document'
}

Response: {
  success: true,
  data: {
    file_id: string,
    url: string,
    name: string,
    type: string,
    size: number
  }
}
```

### 📥 Download de Arquivo
```
GET /api/files/:id/download
Headers: Authorization: Bearer <token>

Response: File stream
```

## 📅 Mensagens Programadas

### ⏰ Agendar Mensagem
```
POST /api/messages/schedule
Headers: Authorization: Bearer <token>
Body: {
  conversation_id: string,
  content: string,
  scheduled_for: string, // ISO datetime
  type: 'text' | 'template'
}

Response: {
  success: true,
  data: {
    id: string,
    scheduled_for: string,
    status: 'pending'
  }
}
```

### 📋 Listar Agendadas
```
GET /api/messages/scheduled
Query: ?conversation_id=string&status=string
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: ScheduledMessage[]
}
```

### ❌ Cancelar Agendamento
```
DELETE /api/messages/scheduled/:id
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  message: "Agendamento cancelado"
}
```

## 🤖 Bot Control

### 🎛️ Controlar Bot
```
PUT /api/conversations/:id/bot-control
Headers: Authorization: Bearer <token>
Body: {
  active: boolean
}

Response: {
  success: true,
  data: {
    conversation_id: string,
    bot_active: boolean
  }
}
```

### 📊 Status do Bot
```
GET /api/conversations/:id/bot-status
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    bot_active: boolean,
    last_interaction: string,
    auto_responses_count: number
  }
}
```

## 🔍 Busca e Filtros

### 🔍 Busca Global
```
GET /api/search
Query: ?q=string&type=conversations|users|clinics&page=number&limit=number
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    results: SearchResult[],
    total: number,
    type: string
  }
}
```

### 📊 Filtros Avançados
```
POST /api/conversations/filter
Headers: Authorization: Bearer <token>
Body: {
  status?: string[],
  flags?: string[],
  date_range?: {
    start: string,
    end: string
  },
  assigned_user?: string,
  has_unread?: boolean
}

Response: {
  success: true,
  data: Conversation[]
}
```

## 📊 Analytics e Métricas

### 📈 Dashboard Stats
```
GET /api/analytics/dashboard
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    active_conversations: number,
    pending_human: number,
    messages_today: number,
    response_time_avg: number,
    satisfaction_rate: number
  }
}
```

### 📊 Conversation Analytics
```
GET /api/analytics/conversations
Query: ?period=day|week|month&clinic_id=string
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    total_conversations: number,
    manual_vs_ai: {
      manual: number,
      ai: number
    },
    resolution_rate: number,
    avg_response_time: number,
    peak_hours: object[]
  }
}
```

## 🔄 WebSocket Events

### 📡 Conexão
```
ws://localhost:3000/ws?token=<jwt_token>
```

### 📨 Eventos do Cliente → Servidor
```json
// Entrar em conversa
{
  "type": "join_conversation",
  "conversation_id": "uuid"
}

// Sair de conversa  
{
  "type": "leave_conversation",
  "conversation_id": "uuid"
}

// Digitando
{
  "type": "typing",
  "conversation_id": "uuid"
}
```

### 📨 Eventos do Servidor → Cliente
```json
// Nova mensagem
{
  "type": "new_message",
  "data": {
    "conversation_id": "uuid",
    "message": Message
  }
}

// Status atualizado
{
  "type": "conversation_updated",
  "data": {
    "conversation_id": "uuid", 
    "updates": object
  }
}

// Usuário digitando
{
  "type": "user_typing",
  "data": {
    "conversation_id": "uuid",
    "user_name": "string"
  }
}
```

## ❌ Códigos de Erro

### 🔒 Autenticação (401)
- `AUTH_REQUIRED`: Token necessário
- `TOKEN_EXPIRED`: Token expirado
- `TOKEN_INVALID`: Token inválido

### 🚫 Autorização (403)
- `INSUFFICIENT_PERMISSIONS`: Sem permissão
- `CLINIC_ACCESS_DENIED`: Acesso negado à clínica
- `ROLE_REQUIRED`: Role insuficiente

### 📝 Validação (400)
- `VALIDATION_ERROR`: Dados inválidos
- `DUPLICATE_ENTRY`: Registro duplicado
- `REQUIRED_FIELD`: Campo obrigatório
- `INVALID_FORMAT`: Formato inválido

### 🔍 Não Encontrado (404)
- `USER_NOT_FOUND`: Usuário não encontrado
- `CONVERSATION_NOT_FOUND`: Conversa não encontrada
- `TEMPLATE_NOT_FOUND`: Template não encontrado

### ⚠️ Servidor (500)
- `INTERNAL_ERROR`: Erro interno
- `DATABASE_ERROR`: Erro de banco
- `EXTERNAL_API_ERROR`: Erro em API externa

## 🎯 Headers Padrão

### 📨 Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
```

### 📨 Response Headers
```
Content-Type: application/json
X-Rate-Limit-Remaining: 100
X-Rate-Limit-Reset: 1640995200
X-Request-ID: uuid
```

## 🔄 Rate Limiting

### 📊 Limites Sugeridos
- **Login**: 5 tentativas/minuto
- **Mensagens**: 30 mensagens/minuto
- **Busca**: 60 requests/minuto
- **CRUD**: 100 requests/minuto
- **WebSocket**: 1000 eventos/minuto

### 🎯 Headers de Rate Limit
```
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1640995200
```

---

📝 **Esta documentação serve como contrato entre front-end e back-end.**
