// Nó "Transferir para setor" do canvas
import { useState, useEffect, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { Building2, HelpCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';

export type TransferRule = 'specific' | 'previous';

export interface Sector {
  id: string;
  name: string;
}

export interface TransferToSectorValue {
  rule: TransferRule;
  sectorId: string | null;
  requireCurrentPermission: boolean;
  enableFallbackFlow: boolean;
}

export interface TransferToSectorData {
  value?: TransferToSectorValue;
  onChange?: (value: TransferToSectorValue) => void;
  sectors?: Sector[];
}

const DEFAULT_VALUE: TransferToSectorValue = {
  rule: 'specific',
  sectorId: null,
  requireCurrentPermission: false,
  enableFallbackFlow: false,
};

const MOCK_SECTORS: Sector[] = [
  { id: '1', name: 'Geral' },
  { id: '2', name: 'Comercial' },
  { id: '3', name: 'Suporte' },
];

export const TransferToSectorNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as TransferToSectorData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const [value, setValue] = useState<TransferToSectorValue>(
    nodeData.value || DEFAULT_VALUE
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showSectorSelect, setShowSectorSelect] = useState(false);

  const sectors = nodeData.sectors || MOCK_SECTORS;

  // Verificar conexões
  const isConnectedIn = useStore((store) =>
    store.edges.some((edge) => edge.target === id)
  );
  const isConnectedOut = useStore((store) =>
    store.edges.some((edge) => edge.source === id && edge.sourceHandle === 'output')
  );
  const isConnectedFallback = useStore((store) =>
    store.edges.some((edge) => edge.source === id && edge.sourceHandle === 'fallback')
  );

  // Atualizar valor quando data mudar
  useEffect(() => {
    if (nodeData.value) {
      setValue(nodeData.value);
    }
  }, [nodeData.value]);

  // Duplicar nó
  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const cascadeOffset = 12;
    let stackCount = 0;
    let newPosition = { ...currentNode.position };

    while (
      nodes.some(
        (n) =>
          n.id !== currentNode.id &&
          n.position.x === newPosition.x &&
          n.position.y === newPosition.y
      )
    ) {
      stackCount++;
      newPosition = {
        x: currentNode.position.x + stackCount * cascadeOffset,
        y: currentNode.position.y + stackCount * cascadeOffset,
      };
    }

    const newNode = {
      ...currentNode,
      id: `${currentNode.type}-${Date.now()}`,
      position: newPosition,
      data: { ...currentNode.data },
      selected: false,
    };
    setNodes((nds) => [...nds, newNode]);
    pushHistory();
  };

  // Deletar nó
  const handleDelete = () => {
    const nodes = getNodes();
    setNodes(nodes.filter((n) => n.id !== id));
    pushHistory();
  };

  // Atualizar valor
  const handleValueChange = (newValue: Partial<TransferToSectorValue>) => {
    const updated = { ...value, ...newValue };
    setValue(updated);
    nodeData.onChange?.(updated);
  };

  // Validações
  const needsSectorSelection = value.rule === 'specific' && !value.sectorId;
  const needsAllConnections =
    value.enableFallbackFlow && (!isConnectedOut || !isConnectedFallback);

  const selectedSector = sectors.find((s) => s.id === value.sectorId);

  const nodeInfo = {
    title: 'Transferir para setor',
    description: `Permite que a conversa seja transferida para um setor. Há várias estratégias disponíveis:

• **Específico**
Transfere a conversa diretamente para um setor específico.

• **Setor que o contato estava anteriormente**
Procura pela conversa mais recente, finalizada, daquele contato, no mesmo canal e, casos ela exista, transfere a conversa atual para o setor desta conversa anterior.

Além disso, é possível transferir a conversa somente se o atendente atual possuir permissão no setor.

Há também a opção de ativar um fluxo alternativo caso a transferência para o setor não seja possível.`,
  };

  return (
    <>
      <div
        role="group"
        className={cn(
          'group relative w-[328px] min-h-[200px] rounded-2xl border bg-white shadow-[0_2px_8px_rgba(16,24,40,.06)]',
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

        {/* Conector de entrada (lado esquerdo, na altura do título) */}
        <NodeConnector
          type="target"
          position={Position.Left}
          id="input"
          connected={isConnectedIn}
          label="Entrada do fluxo"
          className="!-left-[7.5px] !top-[24px]"
        />

        {/* Conector de saída principal (lado direito, na altura do título) */}
        <NodeConnector
          type="source"
          position={Position.Right}
          id="output"
          connected={isConnectedOut}
          label="Sucesso na transferência"
          className="!-right-[7.5px] !top-[24px]"
        />

        {/* Conector de saída fallback (só aparece se checkbox marcado, na altura do checkbox) */}
        {value.enableFallbackFlow && (
          <NodeConnector
            type="source"
            position={Position.Right}
            id="fallback"
            connected={isConnectedFallback}
            label="Fluxo alternativo (falha na transferência)"
            className="!-right-[7.5px] !bottom-[88px]"
          />
        )}

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3">
          {/* Header: Ícone + Título + Ajuda */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFECEC] rounded-full p-1.5 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#F36B6B]" />
              </div>
              <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
                Transferir para setor
              </h3>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Ajuda"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Campo: Regra */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <Label className="text-[13px] text-neutral-700">Regra</Label>
            <Select
              value={value.rule}
              onValueChange={(rule: TransferRule) => {
                handleValueChange({
                  rule,
                  // Limpar sectorId quando mudar para 'previous'
                  sectorId: rule === 'previous' ? null : value.sectorId,
                });
              }}
            >
              <SelectTrigger className="h-9 rounded-2xl border-neutral-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Específico</SelectItem>
                <SelectItem value="previous">
                  Setor que o contato estava anteriormente
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campo: Setor (desabilitado se rule = 'previous') */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <Label className="text-[13px] text-neutral-700">Setor</Label>
            <Popover open={showSectorSelect} onOpenChange={setShowSectorSelect}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-9 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-[14px] flex items-center justify-between',
                    value.rule === 'previous' && 'opacity-50 cursor-not-allowed',
                    !selectedSector && 'text-neutral-400'
                  )}
                  disabled={value.rule === 'previous'}
                >
                  <span>{selectedSector?.name || 'Selecione'}</span>
                  <Search className="w-4 h-4 text-neutral-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search" />
                  <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>
                  <CommandGroup>
                    {sectors.map((sector) => (
                      <CommandItem
                        key={sector.id}
                        onSelect={() => {
                          handleValueChange({ sectorId: sector.id });
                          setShowSectorSelect(false);
                        }}
                      >
                        {sector.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Switch: Transferir somente se atendente atual tem permissão */}
          <div
            className="flex items-start gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              id={`require-permission-${id}`}
              checked={value.requireCurrentPermission}
              onCheckedChange={(checked) =>
                handleValueChange({ requireCurrentPermission: checked })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor={`require-permission-${id}`}
              className="text-[13px] text-neutral-700 leading-relaxed cursor-pointer flex-1"
            >
              Transferir somente se atendente atual tem permissão
            </Label>
          </div>

          {/* Checkbox: Ativar fluxo se não for possível transferir */}
          <div
            className="flex items-start gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              id={`enable-fallback-${id}`}
              checked={value.enableFallbackFlow}
              onCheckedChange={(checked) =>
                handleValueChange({ enableFallbackFlow: checked as boolean })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor={`enable-fallback-${id}`}
              className="text-[13px] text-neutral-700 leading-relaxed cursor-pointer flex-1"
            >
              Ativar fluxo se não for possível transferir para o setor
            </Label>
          </div>

          {/* Avisos/Badges */}
          {(needsSectorSelection || needsAllConnections) && (
            <div className="space-y-2 pt-1">
              {needsSectorSelection && (
                <div className="bg-[#FCECEC] border border-[#F9D6D6] text-[#7F4D4D] rounded-lg px-3 py-2 text-[13px] leading-relaxed">
                  É necessário escolher um setor
                </div>
              )}
              {needsAllConnections && (
                <div className="bg-[#FCECEC] border border-[#F9D6D6] text-[#7F4D4D] rounded-lg px-3 py-2 text-[13px] leading-relaxed">
                  É necessário que todas as opções estejam conectadas
                </div>
              )}
            </div>
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

TransferToSectorNode.displayName = 'TransferToSectorNode';

