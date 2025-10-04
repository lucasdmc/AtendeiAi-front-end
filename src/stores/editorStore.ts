// Store Zustand para o Editor de Fluxo
import { create } from 'zustand';
import { Node, Edge, Viewport } from '@xyflow/react';
import { FlowDTO } from '@/types/flow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface EditorState {
  // Estado principal
  id?: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  dirty: boolean;

  // Histórico para undo/redo
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Configurações da área de trabalho
  showGrid: boolean;
  snapToGrid: boolean;
  showAlignmentGuides: boolean;

  // Actions
  setId: (id: string) => void;
  setName: (name: string) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setViewport: (viewport: Viewport) => void;
  setDirty: (dirty: boolean) => void;

  // Histórico
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Área de trabalho
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleAlignmentGuides: () => void;

  // Carregar/resetar
  load: (dto: FlowDTO) => void;
  reset: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  clearCanvas: () => void;
}

const initialState = {
  id: undefined,
  name: 'Novo Fluxo',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  dirty: false,
  history: [{ nodes: [], edges: [] }], // Inicializar com estado vazio
  historyIndex: 0, // Começar no índice 0
  canUndo: false,
  canRedo: false,
  showGrid: true,
  snapToGrid: false,
  showAlignmentGuides: true,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setId: (id) => set({ id }),

  setName: (name) => {
    set({ name, dirty: true });
  },

  setNodes: (nodesOrUpdater) => {
    const state = get();
    const newNodes = typeof nodesOrUpdater === 'function' 
      ? nodesOrUpdater(state.nodes)
      : nodesOrUpdater;
    
    set({ nodes: newNodes, dirty: true });
  },

  setEdges: (edgesOrUpdater) => {
    const state = get();
    const newEdges = typeof edgesOrUpdater === 'function'
      ? edgesOrUpdater(state.edges)
      : edgesOrUpdater;
    
    set({ edges: newEdges, dirty: true });
  },

  setViewport: (viewport) => set({ viewport }),

  setDirty: (dirty) => set({ dirty }),

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    
    // Remover estados futuros se estamos no meio do histórico
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Adicionar novo estado
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    
    // Limitar a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift();
      set({ 
        history: newHistory, 
        historyIndex: 49, 
        canUndo: true, 
        canRedo: false 
      });
    } else {
      set({ 
        history: newHistory, 
        historyIndex: newHistory.length - 1, 
        canUndo: true, 
        canRedo: false 
      });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      set({
        nodes: JSON.parse(JSON.stringify(previousState.nodes)),
        edges: JSON.parse(JSON.stringify(previousState.edges)),
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        dirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      set({
        nodes: JSON.parse(JSON.stringify(nextState.nodes)),
        edges: JSON.parse(JSON.stringify(nextState.edges)),
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
        dirty: true,
      });
    }
  },

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleAlignmentGuides: () => set((state) => ({ showAlignmentGuides: !state.showAlignmentGuides })),

  load: (dto) => {
    const nodes = dto.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    }));

    const edges = dto.edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      targetHandle: e.targetHandle,
      label: e.label,
    }));

    set({
      id: dto.id,
      name: dto.name,
      nodes,
      edges,
      viewport: dto.viewport,
      dirty: false,
      history: [{ nodes, edges }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  reset: () => {
    set({
      ...initialState,
      // Manter configurações da área de trabalho
      showGrid: get().showGrid,
      snapToGrid: get().snapToGrid,
      showAlignmentGuides: get().showAlignmentGuides,
    });
  },

  exportJSON: () => {
    const { id, name, nodes, edges, viewport } = get();
    const dto: FlowDTO = {
      id,
      name,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as any,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle ?? undefined,
        target: e.target,
        targetHandle: e.targetHandle ?? undefined,
        label: typeof e.label === 'string' ? e.label : undefined,
      })),
      viewport,
      updatedAt: new Date().toISOString(),
    };
    return JSON.stringify(dto, null, 2);
  },

  importJSON: (json) => {
    try {
      const dto = JSON.parse(json) as FlowDTO;
      get().load(dto);
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
      throw new Error('JSON inválido');
    }
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      dirty: true,
    });
    get().pushHistory();
  },
}));

