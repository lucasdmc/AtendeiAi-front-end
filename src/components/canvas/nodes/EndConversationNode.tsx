/**
 * Canvas Node: Finalizar conversa
 */

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useStore, useReactFlow } from '@xyflow/react';
import { CheckCircle, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { EndConversationConfig, ClosedBy } from '@/types/utilityNodes';

export interface EndConversationData {
  value?: EndConversationConfig;
  onChange?: (value: EndConversationConfig) => void;
}

const CLOSED_BY_LABELS: Record<ClosedBy, string> = {
  none: 'Ninguém',
  chat_owner: 'Dono do chat',
};

export const EndConversationNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as EndConversationData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  // Garantir que sempre temos um valor padrão
  const defaultValue: EndConversationConfig = { closedBy: 'none' };
  const [value, setValue] = useState<EndConversationConfig>(
    nodeData.value || defaultValue
  );
  
  const [showInfo, setShowInfo] = useState(false);

  // Verificar conexões
  const isConnectedIn = useStore((store) =>
    store.edges.some((edge) => edge.target === id)
  );

  // Handler para mudanças no value
  const handleValueChange = useCallback(
    (newValue: EndConversationConfig) => {
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
    console.log(`[EndConversationNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[EndConversationNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Finalizar conversa',
    description: `Essa ação finalizará a conversa automaticamente.

Não é possível conectar nenhuma outra ação após essa justamente porque a finalização da conversa ser uma ação terminal.

Se desejar executar outras ações juntamente com a finalização, elas devem vir antes.

**Fechado por**

Essa opção determina quem que deve ser inserido como a pessoa que fez a ação de fechar o chat. É uma escolha importante dependendo das suas necessidades de métricas e/ou automações externas.

• **Ninguém**: O chat é apenas fechado, sem especificar quem fechou.
• **Dono do chat**: Se no momento em que o bloco de fechamento executar o chat em questão pertencer a alguém, essa pessoa será inserida como sendo quem fez a ação de fechar. Se não pertencer a ninguém, o chat é apenas fechado, sem especificar quem fechou.`,
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

        {/* Sem conector de saída - nó terminal */}

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3">
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-green-100 border border-green-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Finalizar conversa
            </h3>
          </div>

          {/* Informação */}
          <p className="text-[12px] text-neutral-600">
            É fechado por:
          </p>

          {/* Select de quem fechou */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <Select
              value={value.closedBy}
              onValueChange={(val) =>
                handleValueChange({ closedBy: val as ClosedBy })
              }
            >
              <SelectTrigger className="w-full h-10">
                <div className="flex items-center gap-2">
                  {value.closedBy === 'chat_owner' ? (
                    <UserCircle2 className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4" />
                    <span>Ninguém</span>
                  </div>
                </SelectItem>
                <SelectItem value="chat_owner">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4" />
                    <span>Dono do chat</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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

EndConversationNode.displayName = 'EndConversationNode';

