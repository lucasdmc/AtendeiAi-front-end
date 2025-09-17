# 👥 Página de Usuários

## 📋 Visão Geral

**Arquivo**: `src/pages/Users.tsx`  
**Rota**: `/users`  
**Função**: Gestão completa de usuários do sistema

## 🎨 Layout e Componentes

### 📱 Estrutura da Página
1. **Header** com botão voltar para Settings
2. **Área de conteúdo** com scroll
3. **Filtros e busca**
4. **Tabela de usuários**
5. **Modais** de criação/edição

### 🔍 Sistema de Filtros

#### 📝 Busca por Texto
- **Campo**: Input de busca
- **Função**: Filtrar por nome, login ou email
- **Estado**: `searchTerm`
- **Comportamento**: Case insensitive, busca parcial

#### 🎭 Filtro por Função
```typescript
type UserRole = 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
```
- **Opções**: Todas as funções + "Todas"
- **Estado**: `roleFilter`

#### 📊 Filtro por Status
- **Ativo**: Usuários ativos no sistema
- **Inativo**: Usuários desabilitados
- **Todos**: Sem filtro de status
- **Estado**: `statusFilter`

## 👤 Estrutura de Dados - Usuário

```typescript
interface User {
  id: string;
  name: string;
  login: string;
  email: string;
  role: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador';
  clinic_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login?: string;
  department?: string;
  phone?: string;
  address?: string;
  notes?: string;
  start_date?: string;
  permissions?: string[];
}
```

## 🎭 Tipos de Usuários

### 🔧 Funções e Permissões
- **Admin Lify**: Administrador global da plataforma
- **Suporte Lify**: Suporte técnico da Lify
- **Atendente**: Atendimento ao cliente
- **Gestor**: Gestão da clínica
- **Administrador**: Administrador da clínica

### 🎨 Cores por Função
```typescript
const roleColors = {
  admin_lify: "bg-purple-100 text-purple-800 border-purple-200",
  suporte_lify: "bg-orange-100 text-orange-800 border-orange-200",
  atendente: "bg-green-100 text-green-800 border-green-200",
  gestor: "bg-blue-100 text-blue-800 border-blue-200",
  administrador: "bg-red-100 text-red-800 border-red-200"
}
```

## 📊 Tabela de Usuários

### 📋 Colunas Exibidas
1. **Avatar + Nome**: Foto e nome completo
2. **Login**: Nome de usuário para acesso
3. **Email**: Email de contato
4. **Função**: Badge colorido com a função
5. **Status**: Badge ativo/inativo
6. **Último Login**: Data/hora formatada
7. **Ações**: Botões editar/deletar

### 🎨 Funcionalidades da Tabela
- **Scroll**: Tabela com scroll quando muitos usuários
- **Hover**: Efeito visual ao passar mouse
- **Responsiva**: Adaptável a diferentes tamanhos

## ➕ Modal de Criação

### 📝 Campos Obrigatórios
- **Nome Completo**: Texto livre
- **Login**: Único no sistema
- **Email**: Validação de formato
- **Senha**: Mínimo 6 caracteres
- **Função**: Select com opções

### 📝 Campos Opcionais (para scroll)
- **Departamento**: Setor de trabalho
- **Telefone**: Contato telefônico
- **Endereço**: Endereço residencial
- **Observações**: Textarea para notas
- **Data de Início**: Data de contratação
- **Permissões Especiais**: Checkboxes múltiplas

### 🎨 Layout do Modal
- **Altura máxima**: 80vh
- **Scroll interno**: 60vh
- **Grid responsivo**: 2 colunas em campos relacionados
- **Validação**: Campos obrigatórios marcados

## ✏️ Modal de Edição

### 📝 Campos Editáveis
- Todos os campos do modal de criação
- **Valores pré-preenchidos** com dados atuais
- **Senha**: Campo opcional (só preencher se alterar)

### 🔒 Restrições
- **Login**: Deve permanecer único
- **Email**: Deve permanecer único
- **ID**: Não editável (hidden)

## 🗑️ Exclusão de Usuários

### ⚠️ Confirmação
- **Alert nativo**: Confirmação antes de deletar
- **Irreversível**: Ação não pode ser desfeita
- **Cascade**: Verificar dependências antes de deletar

## 🔌 APIs Necessárias

### 📥 Endpoints Requeridos

#### 📊 Listagem e Busca
```
GET /api/users
Query params:
- search?: string (nome, login, email)
- role?: string (filtro por função)
- status?: 'active' | 'inactive'
- clinic_id?: string (filtro por clínica)
- page?: number (paginação)
- limit?: number (itens por página)

Response: {
  users: User[],
  total: number,
  page: number,
  totalPages: number
}
```

#### ➕ Criação
```
POST /api/users
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

Response: User
```

#### ✏️ Edição
```
PUT /api/users/:id
Body: Partial<User> (sem id, created_at)

Response: User
```

#### 🗑️ Exclusão
```
DELETE /api/users/:id

Response: { success: boolean, message: string }
```

#### 🔍 Busca Específica
```
GET /api/users/:id
Response: User
```

## 🔄 Estados da Interface

### 📊 Estados de Loading
- **Carregando usuários**: Spinner com mensagem
- **Criando usuário**: Botão desabilitado com "Criando..."
- **Editando usuário**: Botão desabilitado
- **Deletando usuário**: Confirmação + feedback

### ❌ Estados de Erro
- **Erro de carregamento**: Ícone + mensagem de erro
- **Erro de criação**: Alert com detalhes
- **Erro de edição**: Alert com detalhes
- **Erro de exclusão**: Alert com detalhes

### ✅ Estados de Sucesso
- **Usuário criado**: Alert de confirmação
- **Usuário editado**: Alert de confirmação
- **Usuário deletado**: Alert de confirmação

## 🎯 Considerações para o Back-end

### 🔒 Segurança
- **Hash de senhas**: bcrypt ou similar
- **Validação de roles**: Verificar permissões
- **Clinic isolation**: Usuários só veem da própria clínica
- **Audit log**: Registrar criações/edições/exclusões

### 📊 Performance
- **Paginação**: Essencial para muitos usuários
- **Índices**: Em login, email, clinic_id
- **Cache**: Para dados de função e status

### 🔄 Relacionamentos
- **Clínica**: FK para clinic_id
- **Conversas**: Usuários podem ser assigned_user_id
- **Audit**: Histórico de ações do usuário

### ✅ Validações
- **Login único**: Por clínica ou global
- **Email único**: Global no sistema
- **Senha forte**: Política de senhas
- **Role válido**: Apenas roles permitidos

---

📝 **Esta página é fundamental para o controle de acesso e segurança do sistema.**
