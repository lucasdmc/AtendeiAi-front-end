# ⚙️ Página de Configurações

## 📋 Visão Geral

**Arquivo**: `src/pages/Settings.tsx`  
**Rota**: `/settings`  
**Função**: Hub central de configurações do sistema

## 🎨 Layout e Navegação

### 📱 Estrutura Principal
- **Menu principal**: Lista de seções disponíveis
- **Navegação interna**: Cada seção tem sua própria tela
- **Header com voltar**: Navegação entre seções
- **Scroll**: Cada seção tem scroll independente

### 🔄 Tipos de Visualização
```typescript
type SettingsView = 'main' | 'profile' | 'templates' | 'flags' | 'context';
```

## 👤 Seção: Perfil

### 📊 Informações Exibidas
- **Foto do usuário**: Avatar editável
- **Nome**: Apenas visualização (não editável)
- **Função**: Badge com role do usuário
- **Botão**: "Alterar Foto do Perfil"

### 🎨 Layout
- **Avatar grande**: 96x96px
- **Informações centralizadas**: Nome e função
- **Botão destacado**: Para alterar foto

### 🔧 Funcionalidades
- **Upload de foto**: Modal ou input file
- **Preview**: Visualização antes de salvar
- **Validação**: Formato e tamanho de imagem

## 📝 Seção: Templates de Mensagens

### 📊 Funcionalidades Completas (CRUD)
- **Criar**: Formulário para novos templates
- **Editar**: Modificar templates existentes
- **Deletar**: Remover templates
- **Visualizar**: Lista organizada por categoria

### 📝 Formulário de Template
```typescript
interface TemplateForm {
  name: string;           // Nome do template
  content: string;        // Conteúdo da mensagem
  category: TemplateCategory; // Categoria
}

type TemplateCategory = 'saudacao' | 'agendamento' | 'financeiro' | 'despedida' | 'outro';
```

### 🎨 Categorias com Cores
- **Saudação**: Verde (`#10B981`)
- **Agendamento**: Azul (`#3B82F6`)
- **Financeiro**: Amarelo (`#F59E0B`)
- **Despedida**: Roxo (`#8B5CF6`)
- **Outro**: Cinza (`#6B7280`)

### 📊 Lista de Templates
- **Ordenação**: Por categoria e nome
- **Informações**: Nome, categoria, uso, data criação
- **Ações**: Editar, deletar para cada template
- **Contador**: Quantas vezes foi usado

## 🏷️ Seção: Flags

### 📊 Funcionalidades Completas (CRUD)
- **Criar**: Formulário para novas flags
- **Editar**: Modificar flags existentes
- **Deletar**: Remover flags
- **Visualizar**: Lista com cores

### 📝 Formulário de Flag
```typescript
interface FlagForm {
  name: string;     // Nome da flag
  color: string;    // Cor em hexadecimal
  description?: string; // Descrição opcional
}
```

### 🎨 Cores Disponíveis
- Azul (`#3B82F6`)
- Vermelho (`#EF4444`)
- Verde (`#10B981`)
- Amarelo (`#F59E0B`)
- Roxo (`#8B5CF6`)
- Rosa (`#EC4899`)
- Laranja (`#F97316`)
- Cinza (`#6B7280`)

### 📊 Lista de Flags
- **Visualização**: Nome, cor, descrição, data criação
- **Preview**: Círculo colorido com a cor da flag
- **Ações**: Editar, deletar para cada flag
- **Restrições**: Flags padrão (Manual/IA) não podem ser deletadas

## 🤖 Seção: Contexto do Bot

### 📊 Relatório Detalhado (Apenas Leitura)
Exibe configuração completa do chatbot baseada em JSON estruturado.

#### 🏥 Informações da Clínica
- **Básicas**: Nome, razão social, CNPJ
- **Especialidades**: Principal e secundárias
- **Missão**: Declaração de propósito

#### 📍 Localização
- **Endereço**: Completo com complemento
- **Bairro**: Localização específica
- **CEP**: Código postal

#### 📞 Contatos
- **Telefone Principal**: Linha principal
- **WhatsApp**: Número para chat
- **Email**: Contato institucional
- **Website**: URL da clínica

#### 🤖 Configuração do Assistente
- **Nome**: Identificação do bot
- **Personalidade**: Características comportamentais
- **Tom**: Estilo de comunicação
- **Saudações**: Mensagens iniciais e finais

#### 🕐 Horários de Funcionamento
- **Dias da semana**: Segunda a domingo
- **Horários**: Abertura e fechamento
- **Exceções**: Feriados e fechamentos

#### 👨‍⚕️ Profissionais
- **Informações**: Nome, especialidade, CRM
- **Experiência**: Tempo e áreas de atuação
- **Status**: Ativo/inativo
- **Badges**: Especialidades e status

#### 🏥 Serviços Disponíveis
- **Consultas**: Tipos e especialidades
- **Exames**: Procedimentos oferecidos
- **Preços**: Valores e convênios aceitos
- **Duração**: Tempo de cada serviço

#### 🛡️ Políticas e Restrições
- **Agendamento**: Antecedência mínima
- **Cancelamento**: Prazo para cancelar
- **Confirmação**: Política de confirmação
- **Faltas**: Penalidades aplicadas
- **Tópicos proibidos**: Limitações do bot

#### 💳 Formas de Pagamento
- **Aceitas**: Dinheiro, cartão, PIX, etc.
- **Não aceitas**: Transferência, boleto
- **Parcelamento**: Condições especiais
- **Descontos**: Políticas de desconto

#### ⚙️ Configurações do Sistema
- **Técnicas**: Fuso horário, idioma, formatos
- **Backup**: Configurações de segurança
- **Logs**: Registro de atividades

### 🎨 Apresentação Visual
- **Cards organizados**: Por seção temática
- **Ícones específicos**: Para cada tipo de informação
- **Cores diferenciadas**: Para fácil identificação
- **Badges**: Para status e categorias
- **Layout responsivo**: Adaptável ao conteúdo

## 🔗 Links para Outras Páginas

### 📋 Navegação Direta
- **Usuários**: Link para `/users` com header de volta
- **Clínicas**: Link para `/clinics` com header de volta
- **Contexto**: Seção interna com relatório JSON

## 🔌 APIs Necessárias

### 👤 Perfil do Usuário
```
GET /api/users/profile
Response: {
  id: string,
  name: string,
  role: string,
  avatar?: string
}

PUT /api/users/profile/avatar
Body: FormData (arquivo de imagem)
Response: { avatar_url: string }
```

### 📝 Templates (CRUD Completo)
```
GET /api/templates
POST /api/templates
PUT /api/templates/:id
DELETE /api/templates/:id

// Estrutura igual à documentada em conversations.md
```

### 🏷️ Flags (CRUD Completo)
```
GET /api/flags
POST /api/flags
PUT /api/flags/:id
DELETE /api/flags/:id

// Estrutura igual à documentada em conversations.md
```

### 🤖 Contexto do Bot
```
GET /api/clinics/:id/bot-context
Response: {
  clinic_info: object,
  location: object,
  contacts: object,
  ai_config: object,
  operating_hours: object,
  professionals: object[],
  services: object[],
  policies: object,
  payment_methods: object,
  system_settings: object
}
```

## 🔄 Estados da Interface

### 📊 Navegação
- **Menu principal**: Lista de seções
- **Seção ativa**: Renderização condicional
- **Breadcrumb**: Header com botão voltar

### 📝 Formulários
- **Validação**: Em tempo real
- **Loading**: Durante salvamento
- **Feedback**: Sucesso/erro após ações

### 🎨 Visual
- **Scroll**: Em todas as seções
- **Responsivo**: Adaptável a diferentes telas
- **Consistente**: Mesmo padrão visual

## 🎯 Considerações para o Back-end

### 🔒 Segurança
- **Permissões**: Verificar role do usuário
- **Isolamento**: Dados por clínica
- **Validação**: Todos os inputs
- **Sanitização**: Conteúdo de templates

### 📊 Performance
- **Cache**: Templates e flags frequentes
- **Compressão**: Para JSONs grandes
- **Paginação**: Se necessário para muitos items

### 🔄 Sincronização
- **Tempo real**: Mudanças em templates/flags
- **Consistência**: Entre sessões de usuários
- **Backup**: Configurações críticas

---

📝 **Esta página centraliza todas as configurações administrativas do sistema.**
