// Canvas principal do React Flow
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode } from './FlowNode';
import { useEditorStore } from '@/stores/editorStore';

// Registrar tipos de nós personalizados
const nodeTypes: NodeTypes = {
  'start-channel': FlowNode,
  'start-manual': FlowNode,
  'condition-weekday': FlowNode,
  'condition-hours': FlowNode,
  'condition-simple': FlowNode,
  'condition-multi': FlowNode,
  'action-message': FlowNode,
  'action-note': FlowNode,
  'action-transfer-sector': FlowNode,
  'action-edit-tags': FlowNode,
  'action-transfer-agent': FlowNode,
  'action-transfer-ai': FlowNode,
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

// Estilo customizado das conexões
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#B9C3D0' },
  type: 'smoothstep',
  animated: false,
};

export function FlowCanvas() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  
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
      // Bloquear self-loops
      if (connection.source === connection.target) {
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
      pushHistory();
    },
    [setEdges, pushHistory]
  );

  // Quando nós são movidos
  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nds) => {
        const newNodes = [...nds];
        
        changes.forEach((change: any) => {
          if (change.type === 'position' && change.dragging === false) {
            // Salvar no histórico apenas quando terminar de arrastar
            pushHistory();
          }
        });

        // Aplicar mudanças manualmente
        return newNodes.map((node) => {
          const change = changes.find((c: any) => c.id === node.id);
          if (!change) return node;

          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }

          return node;
        }).filter(Boolean) as Node[];
      });
    },
    [setNodes, pushHistory]
  );

  // Quando edges são alteradas
  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((eds) => {
        const newEdges = [...eds];

        changes.forEach((change: any) => {
          if (change.type === 'remove') {
            pushHistory();
          }
        });

        return newEdges.map((edge) => {
          const change = changes.find((c: any) => c.id === edge.id);
          if (!change) return edge;

          if (change.type === 'select') {
            return { ...edge, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }

          return edge;
        }).filter(Boolean) as Edge[];
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
    <div className="flex-1 relative bg-[#EEF3FF]" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#DDE3F0"
          />
        )}
      </ReactFlow>
    </div>
  );
}

