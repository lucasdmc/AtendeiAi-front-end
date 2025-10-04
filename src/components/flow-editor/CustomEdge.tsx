// Custom edge com seta e botão de deletar
import { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    pushHistory();
  };

  const isActive = isHovered || selected;
  const edgeColor = isActive ? '#4F8DF6' : '#94A3B8';
  const arrowId = isActive ? 'arrow-blue' : 'arrow-gray';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#${arrowId})`}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2.5,
          transition: 'stroke 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Botão de deletar quando selecionado */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
              aria-label="Excluir conexão"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

