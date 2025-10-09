# Canvas — Interatividade Avançada e UX

**Contexto:** O canvas ReactFlow fornece funcionalidade básica, mas carece de recursos avançados de UX que facilitariam a criação de fluxos complexos.

**Lacuna identificada:** Falta de recursos de produtividade como seleção múltipla, operações em lote, minimap, busca visual, e ferramentas de alinhamento automático.

**Impacto:** Usuários enfrentam dificuldades para criar e manter fluxos complexos, especialmente aqueles com muitos nós, resultando em produtividade reduzida e erros de design.

**Implementação necessária:**

### 1. Seleção Múltipla e Operações em Lote

**Arquivo:** `src/components/flow-editor/FlowCanvas.tsx` (expandir)

**Funcionalidades:**
- **Seleção por área:** Arrastar para selecionar múltiplos nós
- **Seleção com Ctrl+Click:** Adicionar/remover nós da seleção
- **Seleção por tipo:** Selecionar todos os nós de um tipo específico
- **Operações em lote:**
  - Deletar múltiplos nós
  - Mover grupo de nós
  - Alterar propriedades comuns
  - Agrupar/desagrupar nós

**Componente:** `MultiSelectToolbar.tsx` (novo)
```typescript
interface MultiSelectActions {
  selectedNodes: Node[];
  onDelete: () => void;
  onGroup: () => void;
  onAlignHorizontal: () => void;
  onAlignVertical: () => void;
  onDistributeEvenly: () => void;
}
```

### 2. Ferramentas de Alinhamento e Layout

**Funcionalidades de alinhamento:**
- **Alinhamento:** Esquerda, centro, direita, topo, meio, base
- **Distribuição:** Espaçamento uniforme horizontal/vertical
- **Snap guides:** Linhas guia para alinhamento preciso
- **Grid magnético:** Alinhamento automático à grade
- **Layout automático:** Organização automática do fluxo

**Algoritmos de layout:**
- **Hierarchical:** Layout em árvore para fluxos lineares
- **Force-directed:** Layout orgânico para fluxos complexos
- **Circular:** Layout circular para fluxos cíclicos
- **Custom:** Layout personalizado baseado em regras

### 3. Minimap e Navegação

**Componente:** `FlowMinimap.tsx` (novo)

**Funcionalidades:**
- **Visão geral:** Miniatura do fluxo completo
- **Navegação rápida:** Click para navegar para área específica
- **Indicador de viewport:** Mostrar área atualmente visível
- **Zoom controls:** Controles de zoom integrados
- **Busca visual:** Destacar nós que correspondem à busca

### 4. Sistema de Busca Avançada

**Componente:** `FlowSearch.tsx` (expandir funcionalidade existente)

**Tipos de busca:**
- **Por nome:** Buscar nós pelo label/título
- **Por tipo:** Filtrar por tipo de nó
- **Por conteúdo:** Buscar no conteúdo dos nós (mensagens, configurações)
- **Por conexões:** Encontrar nós conectados a um nó específico
- **Por status:** Buscar nós com erros ou configurações incompletas

**Interface de busca:**
```typescript
interface SearchResult {
  nodeId: string;
  nodeType: string;
  label: string;
  matches: SearchMatch[];
  relevanceScore: number;
}

interface SearchMatch {
  field: string;
  value: string;
  highlight: { start: number; end: number };
}
```

### 5. Sistema de Grupos e Camadas

**Funcionalidade de agrupamento:**
- **Grupos visuais:** Agrupar nós relacionados com borda visual
- **Collapse/expand:** Recolher grupos para simplificar visualização
- **Grupos aninhados:** Suporte a grupos dentro de grupos
- **Movimentação em grupo:** Mover grupo inteiro como uma unidade

**Camadas (layers):**
- **Background layer:** Elementos de fundo (anotações, áreas)
- **Node layer:** Nós do fluxo
- **Connection layer:** Conexões entre nós
- **UI layer:** Elementos de interface (seleção, guides)

### 6. Anotações e Documentação Visual

**Componente:** `FlowAnnotations.tsx` (novo)

**Tipos de anotação:**
- **Text notes:** Notas de texto livres
- **Sticky notes:** Notas adesivas coloridas
- **Arrows:** Setas para destacar elementos
- **Areas:** Áreas destacadas com cores
- **Comments:** Comentários com threading

### 7. Histórico Visual e Versionamento

**Funcionalidades:**
- **Visual diff:** Comparação visual entre versões
- **Timeline:** Linha do tempo das alterações
- **Restore point:** Pontos de restauração nomeados
- **Branch/merge:** Sistema de branches para colaboração

**Componente:** `VersionHistory.tsx` (novo)
```typescript
interface FlowVersion {
  id: string;
  timestamp: Date;
  author: string;
  description: string;
  changes: FlowChange[];
  snapshot: FlowSnapshot;
}
```

### 8. Colaboração em Tempo Real

**Funcionalidades:**
- **Cursors:** Mostrar cursores de outros usuários
- **Live editing:** Edição simultânea com resolução de conflitos
- **Comments:** Sistema de comentários em tempo real
- **Presence:** Indicar quem está visualizando/editando

**Integração WebSocket:**
```typescript
interface CollaborationEvent {
  type: 'cursor' | 'edit' | 'comment' | 'presence';
  userId: string;
  data: any;
  timestamp: Date;
}
```

### 9. Atalhos de Teclado Avançados

**Atalhos de produtividade:**
- `Ctrl+A`: Selecionar todos
- `Ctrl+D`: Duplicar seleção
- `Ctrl+G`: Agrupar seleção
- `Ctrl+Shift+G`: Desagrupar
- `Del`: Deletar seleção
- `F2`: Renomear nó selecionado
- `Ctrl+F`: Buscar
- `Ctrl+H`: Substituir
- `Ctrl+L`: Layout automático
- `Ctrl+Shift+A`: Alinhar seleção

### 10. Performance para Fluxos Grandes

**Otimizações:**
- **Virtualização:** Renderizar apenas nós visíveis
- **Level of detail:** Simplificar nós quando zoom < threshold
- **Culling:** Não processar nós fora da viewport
- **Lazy loading:** Carregar detalhes dos nós sob demanda
- **Debouncing:** Agrupar operações frequentes

**Critério de validação:**
1. Canvas deve suportar fluxos com 500+ nós sem degradação de performance
2. Operações de seleção múltipla devem ser fluidas (60 FPS)
3. Busca deve retornar resultados em < 200ms
4. Layout automático deve organizar fluxos de forma lógica e legível
5. Colaboração em tempo real deve funcionar com até 10 usuários simultâneos
6. Atalhos de teclado devem funcionar de forma consistente
7. Anotações devem persistir entre sessões
8. Versionamento deve permitir comparação e restauração

**Prioridade:** MÉDIA - Importante para produtividade, mas não bloqueia funcionalidade básica
