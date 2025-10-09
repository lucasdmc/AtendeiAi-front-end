# Documentação da Tela do Editor de Chatbot

## Visão Geral

A tela do Editor de Chatbot (`http://localhost:8080/settings/chatbots/editor`) é uma interface visual complexa para criação e edição de fluxos conversacionais. Esta tela permite que usuários construam chatbots através de um sistema de arrastar e soltar (drag-and-drop) utilizando blocos funcionais conectados por linhas de fluxo.

## Estrutura da Tela

### 1. Layout Principal

A tela é organizada em uma estrutura hierárquica com os seguintes elementos:

```
Layout
└── Div Container (h-screen flex flex-col bg-[#F0F4FF])
    ├── Breadcrumb + Search (height: 40px)
    ├── EditorToolbar (height: 56px)
    ├── FlowCanvas (flex-1)
    └── Painéis e Modais Flutuantes
```

### 2. Componente Principal

**Arquivo:** `src/pages/ChatbotFlowEditor.tsx`

**Propósito:** Componente principal que orquestra toda a funcionalidade do editor, incluindo gerenciamento de estado, navegação, salvamento e integração com o ReactFlow.

**Principais responsabilidades:**
- Carregamento e salvamento de fluxos
- Gerenciamento do estado global do editor
- Coordenação entre diferentes painéis e componentes
- Validação de fluxos
- Integração com serviços de backend

## Componentes da Interface

### 3. Breadcrumb + Search Bar

**Localização:** Topo da tela (40px de altura)
**Estilo:** Fundo branco com borda inferior

**Elementos:**
- Navegação hierárquica: Home > Configurações > Chatbots > [Nome do Fluxo]
- Botão de busca (funcionalidade futura)

### 4. EditorToolbar

**Arquivo:** `src/components/flow-editor/EditorToolbar.tsx`

**Propósito:** Barra de ferramentas principal com controles essenciais do editor.

**Elementos principais:**
- **Adicionar Bloco** (ícone Plus): Abre o painel de biblioteca de blocos
- **Templates** (ícone Lightbulb): Abre o painel de ideias/templates
- **Desfazer/Refazer** (ícones Undo2/Redo2): Controles de histórico
- **Salvar** (ícone Save): Salva o fluxo atual
- **Testar Fluxo** (ícone Play): Abre modal de teste
- **Indicador de Estado**: Mostra se há alterações não salvas
- **Nome do Fluxo**: Clicável para renomear

### 5. FlowCanvas

**Arquivo:** `src/components/flow-editor/FlowCanvas.tsx`

**Propósito:** Canvas principal onde os nós são posicionados e conectados. Utiliza a biblioteca ReactFlow.

**Funcionalidades:**
- Renderização de nós personalizados
- Conexões entre nós (edges)
- Zoom e pan
- Seleção múltipla
- Drag and drop

**Tipos de nós suportados:**
- `start-channel`: Início por canal
- `start-manual`: Início manual
- `action-message`: Enviar mensagem
- `action-transfer-sector`: Transferir para setor
- `action-transfer-agent`: Transferir para atendente
- `action-transfer-ai`: Transferir para IA
- `action-choose`: Pedir para escolher
- `ask-question`: Fazer pergunta
- `ask-name`: Pedir nome
- `ask-email`: Pedir email
- `ask-number`: Pedir número
- `ask-date`: Pedir data
- `ask-file`: Pedir arquivo
- `action-waiting-status`: Status de espera
- `action-privacy`: Privacidade
- `action-waiting-flow`: Fluxo de espera
- `action-wait`: Aguardar
- `end-conversation`: Finalizar conversa
- `integration-webhook`: Webhook

### 6. BlockLibraryPanel

**Arquivo:** `src/components/flow-editor/BlockLibraryPanel.tsx`

**Propósito:** Painel lateral que exibe todos os tipos de blocos disponíveis organizados por categoria.

**Características:**
- Posição fixa à esquerda
- Busca por blocos
- Organização por categorias: Início, Condição, Ação, Pergunta, Fim, Utilitários, Integração
- Drag and drop para o canvas
- Clique para adicionar no centro do viewport

### 7. IdeasPanel

**Arquivo:** `src/components/flow-editor/IdeasPanel.tsx`

**Propósito:** Painel que oferece templates pré-construídos de fluxos comuns.

**Funcionalidades:**
- Lista de templates disponíveis
- Busca por templates
- Aplicação de templates no canvas atual

### 8. FloatingControls

**Arquivo:** `src/components/flow-editor/FloatingControls.tsx`

**Propósito:** Controles flutuantes para navegação e configuração do workspace.

**Elementos:**
- **Controles de Zoom** (centro inferior):
  - Resetar visualização
  - Zoom in/out
- **Configurações do Workspace** (canto inferior direito):
  - Toggle da grade
  - Magnetismo (snap to grid)
  - Guias de alinhamento
  - Exportar/Importar JSON
  - Limpar canvas

### 9. Modais e Drawers

#### RenameDialog
**Arquivo:** `src/components/flow-editor/RenameDialog.tsx`
**Propósito:** Modal para renomear o fluxo atual.

#### FlowTestModal
**Arquivo:** `src/components/flow-editor/FlowTestModal.tsx`
**Propósito:** Modal para testar o fluxo, incluindo ativação automática e instruções de teste.

#### WebhookDrawer
**Arquivo:** `src/components/drawers/webhook/WebhookDrawer.tsx`
**Propósito:** Drawer lateral para configuração de webhooks.

## Gerenciamento de Estado

### 10. EditorStore

**Arquivo:** `src/stores/editorStore.ts`

**Propósito:** Store Zustand que gerencia todo o estado do editor.

**Estado principal:**
- `id`: ID do fluxo
- `name`: Nome do fluxo
- `nodes`: Array de nós do fluxo
- `edges`: Array de conexões
- `dirty`: Indica se há alterações não salvas
- `canUndo/canRedo`: Estados do histórico
- `showGrid/snapToGrid/showAlignmentGuides`: Configurações visuais

**Ações principais:**
- `load()`: Carrega um fluxo
- `save()`: Salva o fluxo atual
- `undo()/redo()`: Controles de histórico
- `addNode()/removeNode()`: Manipulação de nós
- `addEdge()/removeEdge()`: Manipulação de conexões

## Serviços Integrados

### 11. FlowsService

**Arquivo:** `src/services/flowsService.ts`

**Propósito:** Serviço para comunicação com a API de fluxos.

**Métodos principais:**
- `getFlow()`: Busca um fluxo específico
- `createFlow()`: Cria novo fluxo
- `updateFlow()`: Atualiza fluxo existente
- `activateFlow()`: Ativa fluxo para teste
- `testFlow()`: Testa fluxo com mensagem

### 12. ActiveChannelsService

**Arquivo:** `src/services/activeChannelsService.ts`

**Propósito:** Serviço para buscar canais ativos da instituição.

## Tipos e Interfaces

### 13. Flow Types

**Arquivo:** `src/types/flow.ts`

**Principais tipos:**
- `NodeType`: Enum com todos os tipos de nós
- `BlockDefinition`: Definição de um bloco
- `TemplateFlow`: Template de fluxo
- `FlowDTO`: Objeto de transferência de dados

### 14. Validação

**Arquivo:** `src/lib/flowValidation.ts`

**Propósito:** Validação de fluxos antes do salvamento.

**Funcionalidades:**
- Validação de campos obrigatórios
- Verificação de conexões
- Relatório de erros detalhado

## Funcionalidades Principais

### 15. Drag and Drop

O editor suporta arrastar blocos da biblioteca diretamente para o canvas, com:
- Detecção de posição de drop
- Prevenção de sobreposição
- Posicionamento inteligente

### 16. Atalhos de Teclado

- `Ctrl+S`: Salvar
- `Ctrl+Z`: Desfazer
- `Ctrl+Shift+Z`: Refazer
- `Ctrl+0`: Resetar visualização
- `Ctrl++`: Zoom in
- `Ctrl+-`: Zoom out

### 17. Auto-save e Dirty State

O editor monitora alterações e:
- Marca estado como "dirty" quando há mudanças
- Exibe indicador visual de alterações não salvas
- Avisa antes de sair com alterações pendentes

### 18. Responsividade

A interface é otimizada para:
- Telas desktop (mínimo recomendado: 1200px)
- Painéis redimensionáveis
- Zoom adaptativo

## Fluxo de Dados

### 19. Ciclo de Vida do Editor

1. **Inicialização**: Carrega fluxo existente ou cria novo
2. **Edição**: Usuário adiciona/modifica nós e conexões
3. **Validação**: Sistema valida estrutura antes do salvamento
4. **Persistência**: Dados são salvos via API
5. **Teste**: Fluxo pode ser ativado e testado

### 20. Integração com Backend

O editor se comunica com o backend através de:
- APIs REST para CRUD de fluxos
- WebSocket para teste em tempo real
- Validação server-side antes da persistência

## Considerações Técnicas

### 21. Performance

- Virtualização de nós para fluxos grandes
- Debounce em operações de salvamento automático
- Lazy loading de componentes pesados

### 22. Acessibilidade

- Suporte a navegação por teclado
- Labels semânticos
- Contraste adequado
- Tooltips informativos

### 23. Extensibilidade

A arquitetura permite:
- Adição de novos tipos de nós
- Plugins personalizados
- Temas customizados
- Validadores específicos

## Conclusão

O Editor de Chatbot é uma ferramenta complexa e poderosa que combina interface intuitiva com funcionalidades avançadas. Sua arquitetura modular permite manutenção eficiente e extensões futuras, enquanto oferece uma experiência rica para criação de fluxos conversacionais.
