/**
 * Canvas Node: Privar ou liberar
 */

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useStore, useReactFlow } from '@xyflow/react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { PrivacyConfig } from '@/types/utilityNodes';

export interface PrivacyData {
  value?: PrivacyConfig;
  onChange?: (value: PrivacyConfig) => void;
}

export const PrivacyNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as PrivacyData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  // Garantir que sempre temos um valor padrão
  const defaultValue: PrivacyConfig = { action: 'private' };
  const [value, setValue] = useState<PrivacyConfig>(
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
    (newValue: PrivacyConfig) => {
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
    console.log(`[PrivacyNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[PrivacyNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Privar ou liberar',
    description: `Marcará ou desmarcará chat como privado.

Essa ação não funcionará se a conversa não tiver um atendente, aparecerá uma nota interna explicando.

Por isso, é sempre necessário garantir que a conversa tenha um atendente antes dessa ação executar. Executando a ação de transferir para alguém antes, por exemplo.`,
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
            <div className="bg-red-100 border border-red-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-red-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Privar ou liberar
            </h3>
          </div>

          {/* Botões Privar/Liberar */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={value.action === 'private' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9',
                value.action === 'private' && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ action: 'private' })}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Privar
            </Button>
            <Button
              variant={value.action === 'public' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9',
                value.action === 'public' && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ action: 'public' })}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Liberar
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

PrivacyNode.displayName = 'PrivacyNode';

