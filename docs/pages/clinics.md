# 🏥 Página de Clínicas

## 📋 Visão Geral

**Arquivo**: `src/pages/Clinics.tsx`  
**Rota**: `/clinics`  
**Função**: Gestão completa de clínicas no sistema

## 🎨 Layout e Componentes

### 📱 Estrutura da Página
1. **Header** com botão voltar para Settings
2. **Área de conteúdo** com scroll
3. **Filtros e busca**
4. **Cards de clínicas**
5. **Modais** de criação/edição/configuração

## 🔍 Sistema de Filtros

### 📝 Busca por Texto
- **Campo**: Input de busca
- **Função**: Filtrar por nome da clínica
- **Estado**: `searchTerm`
- **Comportamento**: Case insensitive, busca parcial

### 📊 Filtro por Status
- **Ativa**: Clínicas em funcionamento
- **Inativa**: Clínicas desabilitadas
- **Todas**: Sem filtro de status
- **Estado**: `statusFilter`

## 🏥 Estrutura de Dados - Clínica

```typescript
interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  meta_webhook_url?: string;
  // Campos adicionais para formulário completo
  specialties?: string[]; // Especialidades oferecidas
  opening_hours?: string; // Horário de funcionamento
  description?: string; // Descrição da clínica
}
```

## 🎨 Visualização em Cards

### 📋 Informações Exibidas
1. **Nome da Clínica**: Título principal
2. **CNPJ**: Identificação fiscal
3. **Contato**: Telefone e email
4. **Endereço**: Localização completa
5. **Status**: Badge colorido (Ativa/Inativa)
6. **Ações**: Botões de editar/configurar/deletar

### 🎨 Layout dos Cards
- **Grid responsivo**: 1-3 colunas conforme tela
- **Hover effect**: Sombra ao passar mouse
- **Status visual**: Cores diferentes por status
- **Botões de ação**: Ícones intuitivos

## ➕ Modal de Criação

### 📝 Campos Obrigatórios
- **Nome da Clínica**: Identificação principal
- **CNPJ**: Documento fiscal
- **Telefone**: Contato principal
- **Email**: Email institucional

### 📝 Campos Opcionais
- **Meta Webhook**: URL para integrações
- **Status**: Ativa/Inativa (padrão: Ativa)

### 📝 Campos Extras (para scroll)
- **Endereço Completo**: Localização
- **Cidade**: Nome da cidade
- **Estado**: Select com estados brasileiros
- **Especialidades**: Checkboxes múltiplas
- **Horário de Funcionamento**: Textarea
- **Descrição**: Textarea com detalhes

### 🎨 Especialidades Disponíveis
- Clínica Geral
- Pediatria
- Cardiologia
- Dermatologia
- Ginecologia
- Ortopedia
- Psicologia
- Neurologia

## ✏️ Modal de Edição

### 📝 Campos Editáveis
- Todos os campos do modal de criação
- **Valores pré-preenchidos** com dados atuais
- **Validação**: CNPJ e email únicos

### 🔒 Restrições
- **CNPJ**: Deve permanecer único no sistema
- **Email**: Deve permanecer único no sistema
- **ID**: Não editável

## ⚙️ Modal de Configuração JSON

### 📊 Finalidade
- **Configurações avançadas** da clínica
- **Integração** com sistemas externos
- **Parâmetros específicos** por clínica

### 📝 Interface
- **Textarea grande**: Para JSON complexo
- **Validação**: JSON válido
- **Placeholder**: Exemplo de estrutura
- **Scroll**: Para JSONs grandes

### 🔧 Exemplo de Configuração
```json
{
  "webhook_url": "https://api.clinica.com/webhook",
  "auto_responses": true,
  "business_hours": {
    "monday": "08:00-18:00",
    "tuesday": "08:00-18:00",
    "wednesday": "08:00-18:00",
    "thursday": "08:00-18:00",
    "friday": "08:00-18:00",
    "saturday": "08:00-12:00",
    "sunday": "closed"
  },
  "specialties": ["clinica_geral", "pediatria"],
  "payment_methods": ["cash", "card", "insurance"],
  "notifications": {
    "email": true,
    "sms": false,
    "whatsapp": true
  }
}
```

## 🗑️ Exclusão de Clínicas

### ⚠️ Validações Necessárias
- **Verificar usuários**: Clínica tem usuários vinculados?
- **Verificar conversas**: Existem conversas ativas?
- **Verificar agendamentos**: Existem consultas futuras?

### 🔄 Processo de Exclusão
1. **Confirmação**: Alert com nome da clínica
2. **Validação**: Verificar dependências
3. **Exclusão**: Soft delete ou hard delete
4. **Feedback**: Confirmação de sucesso

## 🔌 APIs Necessárias

### 📥 Endpoints Requeridos

#### 📊 Listagem e Busca
```
GET /api/clinics
Query params:
- search?: string (nome da clínica)
- status?: 'active' | 'inactive'
- state?: string (filtro por estado)
- page?: number
- limit?: number

Response: {
  clinics: Clinic[],
  total: number,
  page: number,
  totalPages: number
}
```

#### ➕ Criação
```
POST /api/clinics
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
  description?: string,
  status: 'active' | 'inactive'
}

Response: Clinic
```

#### ✏️ Edição
```
PUT /api/clinics/:id
Body: Partial<Clinic> (sem id, created_at)

Response: Clinic
```

#### ⚙️ Configuração JSON
```
PUT /api/clinics/:id/config
Body: {
  config: object // JSON configuration
}

Response: { success: boolean }
```

#### 🗑️ Exclusão
```
DELETE /api/clinics/:id

Response: { 
  success: boolean, 
  message: string,
  dependencies?: {
    users: number,
    conversations: number,
    appointments: number
  }
}
```

#### 🔍 Validações
```
POST /api/clinics/validate-cnpj
Body: { cnpj: string, excludeId?: string }
Response: { available: boolean }

POST /api/clinics/validate-email  
Body: { email: string, excludeId?: string }
Response: { available: boolean }
```

## 🔄 Estados da Interface

### 📊 Estados de Loading
- **Carregando clínicas**: Spinner na área principal
- **Criando clínica**: Botão com "Criando..."
- **Editando clínica**: Loading durante salvamento
- **Deletando clínica**: Confirmação + loading

### ❌ Estados de Erro
- **Erro de carregamento**: Mensagem + botão recarregar
- **CNPJ duplicado**: Validação em tempo real
- **Email duplicado**: Validação em tempo real
- **JSON inválido**: Validação de formato

### ✅ Estados de Sucesso
- **Clínica criada**: Alert + refresh da lista
- **Clínica editada**: Alert + atualização do card
- **Configuração salva**: Alert de confirmação
- **Clínica deletada**: Alert + remoção da lista

## 🎯 Considerações para o Back-end

### 🔒 Segurança
- **CNPJ único**: Validação a nível de banco
- **Email único**: Validação a nível de banco
- **Permissões**: Apenas admins podem gerenciar
- **Audit log**: Registrar todas as operações

### 📊 Performance
- **Índices**: Em CNPJ, email, status
- **Paginação**: Para muitas clínicas
- **Cache**: Para dados frequentes

### 🔄 Relacionamentos
- **Usuários**: FK clinic_id
- **Conversas**: Relacionadas à clínica
- **Agendamentos**: Por clínica
- **Configurações**: JSON flexível por clínica

### 🌐 Integrações
- **Webhook**: Para notificações externas
- **APIs externas**: Validação de CNPJ
- **Sistemas de pagamento**: Por clínica
- **Calendários externos**: Sincronização

### 📋 Validações de Negócio
- **CNPJ válido**: Algoritmo de validação
- **Telefone**: Formato brasileiro
- **CEP**: Validação e busca de endereço
- **Horários**: Formato e consistência

---

📝 **Esta página é essencial para a configuração multi-tenant do sistema.**
