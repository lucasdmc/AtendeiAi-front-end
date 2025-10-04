// Canvas principal do React Flow
import { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Connection,
  addEdge,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode } from './FlowNode';
import { StartByChannelNode, StartManuallyNode, SendMessageNode, TransferToSectorNode, TransferToAgentNode, TransferToAIAgentNode } from '@/components/canvas/nodes';
import { CustomEdge } from './CustomEdge';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from '@/components/ui/sonner';

// Registrar tipos de nós personalizados
const nodeTypes: NodeTypes = {
  'start-channel': StartByChannelNode,
  'start-manual': StartManuallyNode,
  'action-message': SendMessageNode,
  'action-transfer-sector': TransferToSectorNode,
  'action-transfer-agent': TransferToAgentNode,
  'action-transfer-ai': TransferToAIAgentNode,
  'condition-weekday': FlowNode,
  'condition-hours': FlowNode,
  'condition-simple': FlowNode,
  'condition-multi': FlowNode,
  'action-note': FlowNode,
  'action-edit-tags': FlowNode,
  'action-private': FlowNode,
  'action-choose': FlowNode,
  'action-input': FlowNode,
  'action-template': FlowNode,
  'action-trigger-flow': FlowNode,
  'action-status-waiting': FlowNode,
  'action-rating': FlowNode,
  'action-feedback': FlowNode,
  'action-contact-field': FlowNode,
  'action-wait': FlowNode,
  'end-conversation': FlowNode,
  'util-notes': FlowNode,
  'integration-webhook': FlowNode,
};

// Registrar tipos de edges personalizados
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Estilo customizado das conexões
const defaultEdgeOptions = {
  type: 'custom',
};

// Estilo da linha durante a conexão (com seta)
const connectionLineStyle = {
  strokeWidth: 2.5,
  stroke: '#4F8DF6',
};

export function FlowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  
  const nodes = useEditorStore((state) => state.nodes);
  const edges = useEditorStore((state) => state.edges);
  const showGrid = useEditorStore((state) => state.showGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const setNodes = useEditorStore((state) => state.setNodes);
  const setEdges = useEditorStore((state) => state.setEdges);
  const setViewport = useEditorStore((state) => state.setViewport);
  const pushHistory = useEditorStore((state) => state.pushHistory);

  // Conectar nós
  const onConnect = useCallback(
    (connection: Connection) => {
      // Validação: Bloquear self-loops (React Flow não bloqueia isso automaticamente)
      if (connection.source === connection.target) {
        toast.error('Conexão inválida', {
          description: 'Um bloco não pode se conectar a si mesmo.',
        });
        return;
      }

      // Conexão válida - criar edge
      // O React Flow já bloqueia automaticamente:
      // - source -> source (saída -> saída)
      // - target -> target (entrada -> entrada)
      setEdges((eds) => addEdge(connection, eds));
      pushHistory();
    },
    [setEdges, pushHistory]
  );

  // Quando nós são movidos
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        // Usar helper nativo do React Flow
        const updatedNodes = applyNodeChanges(changes, nds);
        
        // Salvar no histórico apenas quando terminar de arrastar
        changes.forEach((change) => {
          if (change.type === 'position' && 'dragging' in change && change.dragging === false) {
            pushHistory();
          }
        });
        
        return updatedNodes;
      });
    },
    [setNodes, pushHistory]
  );

  // Quando edges são alteradas
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        // Usar helper nativo do React Flow
        const updatedEdges = applyEdgeChanges(changes, eds);
        
        // Salvar no histórico quando remover edge
        changes.forEach((change) => {
          if (change.type === 'remove') {
            pushHistory();
          }
        });
        
        return updatedEdges;
      });
    },
    [setEdges, pushHistory]
  );

  // Drag & drop de blocos
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const blockData = event.dataTransfer.getData('application/reactflow');
      if (!blockData) return;

      const block = JSON.parse(blockData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${block.type}-${Date.now()}`,
        type: block.type,
        position,
        data: {
          label: block.title,
          description: '',
        },
      };

      setNodes((nds) => [...nds, newNode]);
      pushHistory();
    },
    [screenToFlowPosition, setNodes, pushHistory]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Atualizar viewport quando mudar
  const onMoveEnd = useCallback(
    (_: any, viewport: any) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  return (
    <div 
      className="flex-1 relative" 
      onDrop={onDrop} 
      onDragOver={onDragOver}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F4FF',
        backgroundImage: showGrid
          ? `
            linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
          `
          : undefined,
        backgroundSize: showGrid
          ? '20px 20px, 20px 20px, 100px 100px, 100px 100px'
          : undefined,
        backgroundPosition: showGrid
          ? '0 0, 0 0, 0 0, 0 0'
          : undefined,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{
          ...connectionLineStyle,
          markerEnd: 'url(#arrow-blue)',
        }}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
        // Pan (arrastar canvas)
        panOnDrag={[1, 2]} // Botão do meio (1) e direito (2) do mouse
        panOnScroll={true} // Dois dedos no touchpad
        selectionOnDrag={true} // Permite seleção arrastando
        zoomOnScroll={true} // Scroll para zoom
        zoomOnPinch={true} // Pinch para zoom no touchpad
      >
        {/* Definições de marcadores SVG para setas */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <marker
              id="arrow-gray"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#94A3B8"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#4F8DF6"
                strokeLinejoin="round"
              />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
}

