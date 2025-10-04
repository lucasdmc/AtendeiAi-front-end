/**
 * Canvas Node: Aguardar (Wait/Delay)
 */

import { memo, useState, useCallback } from 'react';
import { NodeProps, Position, useStore, useReactFlow } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { WaitConfig, WaitMode, WaitUnit, WAIT_UNIT_LABELS } from '@/types/waitNode';

export interface WaitData {
  value?: WaitConfig;
  onChange?: (value: WaitConfig) => void;
}

export const WaitNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as WaitData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  // Garantir que sempre temos um valor padrão
  const defaultValue: WaitConfig = {
    mode: 'fixed',
    fixedValue: 15,
    fixedUnit: 'minutes',
    variableName: '',
    responseFlowEnabled: false,
  };
  
  const [value, setValue] = useState<WaitConfig>(
    nodeData.value || defaultValue
  );
  
  const [showInfo, setShowInfo] = useState(false);

  // Verificar conexões
  const edges = useStore((store) => store.edges);
  const isConnectedIn = edges.some((edge) => edge.target === id);
  const isConnectedOut = edges.some((edge) => edge.source === id && edge.sourceHandle === 'out');
  const isConnectedResponse = edges.some((edge) => edge.source === id && edge.sourceHandle === 'out:response');

  // Validação
  const hasError = 
    (value.mode === 'fixed' && (!value.fixedValue || value.fixedValue <= 0)) ||
    (value.mode === 'variable' && !value.variableName?.trim()) ||
    (value.responseFlowEnabled && !isConnectedResponse);

  // Handler para mudanças no value
  const handleValueChange = useCallback(
    (newValue: WaitConfig) => {
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
    console.log(`[WaitNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[WaitNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Aguardar',
    description: `Permite definir um tempo de espera antes da próxima ação.`,
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

        {/* Conector de saída principal */}
        <NodeConnector
          type="source"
          position={Position.Right}
          id="out"
          connected={isConnectedOut}
          label="Saída do fluxo"
          className="!-right-[7.5px] !top-[24px]"
        />

        {/* Conector de saída para resposta antes do tempo */}
        {value.responseFlowEnabled && (
          <NodeConnector
            type="source"
            position={Position.Right}
            id="out:response"
            connected={isConnectedResponse}
            label="Resposta antes do tempo"
            className="!-right-[7.5px] !bottom-[60px]"
          />
        )}

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Aguardar
            </h3>
          </div>

          {/* Botões Fixo/Variável */}
          <div className="flex gap-2">
            <Button
              variant={value.mode === 'fixed' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9 text-[14px]',
                value.mode === 'fixed' && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ ...value, mode: 'fixed' })}
            >
              Fixo
            </Button>
            <Button
              variant={value.mode === 'variable' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-9 text-[14px]',
                value.mode === 'variable' && 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={() => handleValueChange({ ...value, mode: 'variable' })}
            >
              Variável
            </Button>
          </div>

          {/* Modo Fixo */}
          {value.mode === 'fixed' && (
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-700">Intervalo</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={value.fixedValue || ''}
                  onChange={(e) =>
                    handleValueChange({
                      ...value,
                      fixedValue: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 h-10 text-[14px]"
                  placeholder="15"
                />
                <Select
                  value={value.fixedUnit || 'minutes'}
                  onValueChange={(val) =>
                    handleValueChange({ ...value, fixedUnit: val as WaitUnit })
                  }
                >
                  <SelectTrigger className="w-[120px] h-10 text-[14px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(WAIT_UNIT_LABELS) as WaitUnit[]).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {WAIT_UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Modo Variável */}
          {value.mode === 'variable' && (
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-700">Nome da variável</Label>
              <Input
                type="text"
                value={value.variableName || ''}
                onChange={(e) =>
                  handleValueChange({ ...value, variableName: e.target.value })
                }
                className="h-10 text-[14px]"
                placeholder=""
              />
            </div>
          )}

          {/* Checkbox: Ativar fluxo se responder antes */}
          <div className="flex items-start gap-2 pt-1">
            <Checkbox
              id={`response-flow-${id}`}
              checked={value.responseFlowEnabled}
              onCheckedChange={(checked) =>
                handleValueChange({
                  ...value,
                  responseFlowEnabled: checked as boolean,
                })
              }
              className="mt-0.5"
            />
            <label
              htmlFor={`response-flow-${id}`}
              className="text-[13px] text-neutral-700 leading-tight cursor-pointer select-none"
            >
              Ativar fluxo se contato responder antes
            </label>
          </div>

          {/* Badge de validação */}
          {hasError && (
            <Badge
              variant="destructive"
              className="w-full justify-center text-[11px] py-1.5 bg-red-50 text-red-700 border-red-200"
            >
              É necessário que todas as opções estejam conectadas
            </Badge>
          )}
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

WaitNode.displayName = 'WaitNode';

