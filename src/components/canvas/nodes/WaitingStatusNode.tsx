/**
 * Canvas Node: Status esperando
 */

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useStore, useReactFlow } from '@xyflow/react';
import { HourglassIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { WaitingStatusConfig } from '@/types/utilityNodes';

export interface WaitingStatusData {
  value?: WaitingStatusConfig;
  onChange?: (value: WaitingStatusConfig) => void;
}

export const WaitingStatusNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as WaitingStatusData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  // Garantir que sempre temos um valor padrão
  const defaultValue: WaitingStatusConfig = { enabled: false };
  const [value, setValue] = useState<WaitingStatusConfig>(
    nodeData.value || defaultValue
  );
  
  const [showInfo, setShowInfo] = useState(false);

  // Verificar conexões
  const isConnectedIn = useStore((store) =>
    store.edges.some((edge) => edge.target === id)
  );
  const isConnectedOut = useStore((store) =>
    store.edges.some((edge) => edge.source === id)
  );

  // Handler para mudanças no value
  const handleValueChange = useCallback(
    (newValue: WaitingStatusConfig) => {
      setValue(newValue);
      
      // Atualizar o nó no store
      const nodes = getNodes();
      const updatedNodes = nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, value: newValue } } : n
      );
      setNodes(updatedNodes);
      pushHistory();
    },
    [id, getNodes, setNodes, pushHistory]
  );

  const handleDuplicate = useCallback(() => {
    console.log(`[WaitingStatusNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[WaitingStatusNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Status esperando',
    description: `Marcará ou desmarcará chat como esperando.

Com essa opção você pode marcar um chat como não-esperando enquanto o cliente está preenchendo os dados. Depois colocar como esperando no momento que finalizar o fluxo, por exemplo.`,
  };

  return (
    <>
      <div
        role="group"
        className={cn(
          'group relative w-[296px] rounded-2xl border bg-white shadow-[0_2px_8px_rgba(16,24,40,.06)]',
          selected
            ? `ring-2 ring-[${NODE_TOKENS.RING}] ring-offset-2 ring-offset-[${NODE_TOKENS.RING_OFFSET}] border-[#DDE3F0]`
            : 'border-[#DDE3F0]',
          'cursor-move'
        )}
      >
        {/* Menu de ações flutuante */}
        <NodeActionsMenu
          nodeId={id}
          onShowInfo={() => setShowInfo(true)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />

        {/* Conector de entrada */}
        <NodeConnector
          type="target"
          position={Position.Left}
          id="in"
          connected={isConnectedIn}
          label="Entrada do fluxo"
          className="!-left-[7.5px] !top-[24px]"
        />

        {/* Conector de saída */}
        <NodeConnector
          type="source"
          position={Position.Right}
          id="out"
          connected={isConnectedOut}
          label="Saída do fluxo"
          className="!-right-[7.5px] !top-[24px]"
        />

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3">
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <HourglassIcon className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Status esperando
            </h3>
          </div>

          {/* Botões Sim/Não */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={value.enabled ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9',
                value.enabled && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ enabled: true })}
            >
              Sim
            </Button>
            <Button
              variant={!value.enabled ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9',
                !value.enabled && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ enabled: false })}
            >
              Não
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de informações */}
      <NodeInfoDialog
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title={nodeInfo.title}
        description={nodeInfo.description}
      />
    </>
  );
});

WaitingStatusNode.displayName = 'WaitingStatusNode';

