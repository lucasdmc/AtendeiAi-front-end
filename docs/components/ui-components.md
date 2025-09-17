# 🎨 Componentes UI

## 📋 Visão Geral

Documentação dos principais componentes UI utilizados no sistema e suas funcionalidades.

## 🧩 Componentes Base (Radix UI)

### 📝 Formulários
- **Input**: Campos de texto com validação
- **Textarea**: Campos de texto longo
- **Select**: Dropdowns com opções
- **Button**: Botões com variantes
- **Label**: Labels associados aos campos

### 💬 Modais e Overlays
- **Dialog**: Modais principais
- **DialogContent**: Conteúdo dos modais
- **DialogHeader**: Cabeçalho com título
- **DialogDescription**: Descrição da ação

### 📊 Exibição de Dados
- **Card**: Containers de conteúdo
- **Table**: Tabelas de dados
- **Badge**: Indicadores coloridos
- **Avatar**: Fotos de usuários
- **ScrollArea**: Áreas com scroll customizado

## 🎨 Componentes Customizados

### 🏷️ Sistema de Flags
```jsx
// Flag Badge Component
<Badge 
  variant="outline"
  style={{ 
    backgroundColor: `${flag.color}20`, 
    borderColor: flag.color,
    color: flag.color 
  }}
>
  {flag.name}
</Badge>
```

### 🎛️ Toggle Switch
```jsx
// Toggle para Atendente Virtual
<button
  className={`
    relative inline-flex h-6 w-11 items-center rounded-full 
    transition-colors duration-200 ease-in-out focus:outline-none
    ${active ? 'bg-green-500' : 'bg-gray-300'}
  `}
  role="switch"
  aria-checked={active}
>
  <span className={`
    inline-block h-4 w-4 transform rounded-full bg-white 
    shadow-lg transition duration-200 ease-in-out
    ${active ? 'translate-x-6' : 'translate-x-1'}
  `} />
</button>
```

### 🔍 Campo de Busca
```jsx
// Search Input Component
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input
    className="pl-9 bg-white border-gray-300"
    placeholder="Pesquisar..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
```

### 📱 Cards de Conversa
```jsx
// Conversation Item Component
<div className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b">
  <Avatar className="h-12 w-12 mr-3">
    <AvatarImage src={avatar} />
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-900 truncate">
        {name}
      </p>
      <span className="text-xs text-gray-500">
        {formatTime(timestamp)}
      </span>
    </div>
    
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500 truncate">
        {lastMessage}
      </p>
      <Badge>{flag}</Badge>
    </div>
  </div>
  
  {unreadCount > 0 && (
    <div className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </div>
  )}
</div>
```

## 🎨 Padrões de Design

### 📐 Espaçamentos
```css
/* Padrão de padding/margin */
p-2: 8px
p-3: 12px  
p-4: 16px
p-6: 24px

/* Gaps entre elementos */
space-x-2: 8px horizontal
space-y-2: 8px vertical
space-x-3: 12px horizontal
space-y-3: 12px vertical
```

### 🎨 Cores do Sistema
```css
/* Cores principais */
Primary: Orange (#F97316)
Success: Green (#10B981)
Error: Red (#EF4444)
Warning: Yellow (#F59E0B)
Info: Blue (#3B82F6)

/* Cores de texto */
text-gray-900: Títulos principais
text-gray-700: Texto secundário  
text-gray-500: Texto auxiliar
text-gray-400: Placeholders

/* Cores de fundo */
bg-white: Fundo principal
bg-gray-50: Fundo secundário
bg-gray-100: Hover states
```

### 📏 Tamanhos
```css
/* Alturas padrão */
h-8: 32px (botões pequenos)
h-10: 40px (botões normais)
h-12: 48px (botões grandes)

/* Larguras fixas */
w-80: 320px (sidebar direito)
w-96: 384px (lista conversas)
w-64: 256px (sidebar principal expandido)
w-16: 64px (sidebar principal minimizado)
```

## 🔧 Funcionalidades Interativas

### 🎭 Estados de Hover
```css
/* Padrão para elementos clicáveis */
hover:bg-gray-50 
hover:bg-gray-100
hover:shadow-lg
transition-colors duration-200
```

### 🎯 Estados de Foco
```css
/* Campos de formulário */
focus:ring-2 focus:ring-orange-500 focus:border-orange-500

/* Botões */
focus:outline-none focus:ring-2 focus:ring-offset-2
```

### ✅ Estados de Seleção
```css
/* Item ativo */
bg-orange-100 text-orange-900 border-r-4 border-orange-500

/* Item selecionado */
bg-blue-50 border-blue-200
```

## 📱 Responsividade

### 📐 Breakpoints
```css
/* Mobile first */
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */  
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### 📱 Padrões Responsivos
```css
/* Grid adaptativo */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Flexbox responsivo */
flex-col md:flex-row

/* Espaçamentos responsivos */
p-4 md:p-6 lg:p-8

/* Texto responsivo */
text-sm md:text-base lg:text-lg
```

## 🎯 Componentes Críticos para Back-end

### 💬 Message Component
**Funcionalidades necessárias**:
- Renderização de diferentes tipos (texto, imagem, documento)
- Status de entrega (enviado, entregue, lido)
- Timestamp formatado
- Sender identification

### 🏷️ Flag System
**Funcionalidades necessárias**:
- Cores dinâmicas baseadas em hex
- Aplicação em tempo real
- Filtros por múltiplas flags
- Flags padrão vs customizadas

### 📝 Template System  
**Funcionalidades necessárias**:
- Categorização por tipo
- Contador de uso
- Busca por categoria
- Variáveis dinâmicas ({nome}, {data})

### 🔍 Search Components
**Funcionalidades necessárias**:
- Debounce para performance
- Highlight de resultados
- Busca em múltiplos campos
- Filtros combinados

## 🎨 Guia de Estilo

### 🎯 Princípios
1. **Consistência**: Mesmos padrões em toda aplicação
2. **Clareza**: Informações fáceis de entender
3. **Eficiência**: Ações rápidas e intuitivas
4. **Acessibilidade**: Componentes usáveis por todos

### 📋 Checklist de Componente
- [ ] Responsivo em todas as telas
- [ ] Estados de loading/error/success
- [ ] Acessibilidade (ARIA, keyboard)
- [ ] Hover e focus states
- [ ] Consistente com design system
- [ ] Performance otimizada

---

📝 **Estes componentes formam a base visual e interativa de todo o sistema.**
