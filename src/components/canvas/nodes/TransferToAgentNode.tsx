// Nó "Transferir p/ atendente" do canvas
import { useState, useEffect, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { UserRoundCog, HelpCircle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export type TransferAgentRule = 'specific' | 'random' | 'least_busy' | 'previous' | 'remove';

export interface Agent {
  id: string;
  name: string;
  avatarColor?: string;
}

export interface TransferToAgentValue {
  rule: TransferAgentRule;
  agentIds: string[];
  requireAvailable: boolean;
  enableFallbackFlow: boolean;
}

export interface TransferToAgentData {
  value?: TransferToAgentValue;
  onChange?: (value: TransferToAgentValue) => void;
  agents?: Agent[];
}

const DEFAULT_VALUE: TransferToAgentValue = {
  rule: 'specific',
  agentIds: [],
  requireAvailable: false,
  enableFallbackFlow: false,
};

const MOCK_AGENTS: Agent[] = [
  { id: '1', name: 'Edna', avatarColor: '#EF4444' },
  { id: '2', name: 'EdnadePaula', avatarColor: '#3B82F6' },
  { id: '3', name: 'Marcos', avatarColor: '#F59E0B' },
  { id: '4', name: 'PauloRobertoBlun...', avatarColor: '#10B981' },
];

const AGENT_COLORS = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export const TransferToAgentNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as TransferToAgentData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const [value, setValue] = useState<TransferToAgentValue>(
    nodeData.value || DEFAULT_VALUE
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showAgentSelect, setShowAgentSelect] = useState(false);

  const agents = nodeData.agents || MOCK_AGENTS;

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
  const handleValueChange = (newValue: Partial<TransferToAgentValue>) => {
    const updated = { ...value, ...newValue };
    setValue(updated);
    nodeData.onChange?.(updated);
  };

  // Toggle seleção de agente (multi-select para random e least_busy)
  const toggleAgent = (agentId: string) => {
    const isMultiSelect = value.rule === 'random' || value.rule === 'least_busy';
    
    if (isMultiSelect) {
      const newIds = value.agentIds.includes(agentId)
        ? value.agentIds.filter((id) => id !== agentId)
        : [...value.agentIds, agentId];
      handleValueChange({ agentIds: newIds });
    } else {
      // Single select para 'specific'
      handleValueChange({ agentIds: [agentId] });
      setShowAgentSelect(false);
    }
  };

  // Remover agente selecionado
  const removeAgent = (agentId: string) => {
    handleValueChange({
      agentIds: value.agentIds.filter((id) => id !== agentId),
    });
  };

  // Verificar se campo de atendentes deve estar habilitado
  const isAgentFieldEnabled = 
    value.rule !== 'previous' && value.rule !== 'remove';

  // Verificar se deve usar multi-select
  const isMultiSelect = value.rule === 'random' || value.rule === 'least_busy';

  // Validações
  const needsAgentSelection =
    isAgentFieldEnabled && value.agentIds.length === 0;
  const needsAllConnections =
    value.enableFallbackFlow && (!isConnectedOut || !isConnectedFallback);

  const selectedAgents = agents.filter((a) => value.agentIds.includes(a.id));

  const nodeInfo = {
    title: 'Transferir p/ atendente',
    description: `Permite que a conversa seja transferida para um atendente. Há várias estratégias disponíveis:

• **Específico**
Transfere a conversa diretamente para um atendente específico.

• **Aleatoriamente**
Escolhe um dos atendentes aleatoriamente para transferir a conversa. É levado em consideração a última vez que cada atendente recebeu uma transferência de conversa em relação aos outros, para evitar a chance de sobrecarregue alguém. Pode-se determinar uma lista de atendentes que podem ser sorteados caso não deseje que inclua todos da organização.

• **Com menos conversas em aberto**
Escolherá o atendente com o menor número de conversas abertas que lhe pertencem. Pode-se determinar uma lista de atendentes que podem ser sorteados caso não deseje que inclua todos da organização.

• **Quem o atendeu anteriormente**
Procura pela conversa mais recente, finalizada, daquele contato, no mesmo canal e que havia alguém atribuído com permissão de visualizar o chat atual. Se uma conversa que atenda esses requisitos existir, é transferido para o mesmo atendente. Senão, um aviso é mostrado em forma de nota e continua a execução sem transferir a ninguém.

• **Remover**
Remove o(a) atendente atual da conversa. Se não havia ninguém, é avisado via nota e seguido adiante.

Note que além da seleção de atendentes (nas estratégias que permitem), há mais um filtro implícito onde só são considerados os atendentes que tem permissão para visualizar a conversa onde o bot está rodando.

Também é possível ativar um fluxo alternativo caso a transferência para um atendente não seja possível.`,
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
          label="Transferência bem-sucedida"
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
                <UserRoundCog className="w-4 h-4 text-[#F36B6B]" />
              </div>
              <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
                Transferir p/ atendente
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
              onValueChange={(rule: TransferAgentRule) => {
                handleValueChange({
                  rule,
                  // Limpar agentIds quando mudar para regras que não permitem seleção
                  agentIds: (rule === 'previous' || rule === 'remove') ? [] : value.agentIds,
                });
              }}
            >
              <SelectTrigger className="h-9 rounded-2xl border-neutral-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Específico</SelectItem>
                <SelectItem value="random">Aleatoriamente</SelectItem>
                <SelectItem value="least_busy">Com menos conversas em aberto</SelectItem>
                <SelectItem value="previous">Quem o atendeu anteriormente</SelectItem>
                <SelectItem value="remove">Remover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campo: Atendentes */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <Label className="text-[13px] text-neutral-700">Atendentes</Label>
            
            <Popover open={showAgentSelect} onOpenChange={setShowAgentSelect}>
              {/* Multi-select com chips */}
              {isMultiSelect && selectedAgents.length > 0 ? (
                <div className="min-h-[36px] rounded-2xl border border-neutral-200 bg-white px-3 py-2 flex flex-wrap items-center gap-2">
                  {selectedAgents.slice(0, 2).map((agent) => (
                    <Badge
                      key={agent.id}
                      variant="secondary"
                      className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarFallback
                          style={{ backgroundColor: agent.avatarColor || AGENT_COLORS[0] }}
                          className="text-[10px] text-white font-semibold"
                        >
                          {agent.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{agent.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAgent(agent.id);
                        }}
                        className="ml-0.5 hover:bg-neutral-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedAgents.length > 2 && (
                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                      + {selectedAgents.length - 2}
                    </Badge>
                  )}
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="ml-auto text-neutral-400 hover:text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isAgentFieldEnabled}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                </div>
              ) : (
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'h-9 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-[14px] flex items-center justify-between',
                      !isAgentFieldEnabled && 'opacity-50 cursor-not-allowed',
                      !selectedAgents[0] && 'text-neutral-400'
                    )}
                    disabled={!isAgentFieldEnabled}
                  >
                    <span>{selectedAgents[0]?.name || 'Selecione'}</span>
                    <Search className="w-4 h-4 text-neutral-400" />
                  </button>
                </PopoverTrigger>
              )}
              
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search" />
                  <CommandEmpty>Nenhum atendente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {agents.map((agent) => (
                      <CommandItem
                        key={agent.id}
                        onSelect={() => toggleAgent(agent.id)}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback
                            style={{ backgroundColor: agent.avatarColor || AGENT_COLORS[0] }}
                            className="text-xs text-white font-semibold"
                          >
                            {agent.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{agent.name}</span>
                        {value.agentIds.includes(agent.id) && isMultiSelect && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Switch: Transferir somente se atendente disponível */}
          <div
            className="flex items-start gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              id={`require-available-${id}`}
              checked={value.requireAvailable}
              onCheckedChange={(checked) =>
                handleValueChange({ requireAvailable: checked })
              }
              className="mt-0.5"
            />
            <Label
              htmlFor={`require-available-${id}`}
              className="text-[13px] text-neutral-700 leading-relaxed cursor-pointer flex-1"
            >
              Transferir somente se atendente disponível
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
              Ativar fluxo se não for possível transferir para nenhum atendente
            </Label>
          </div>

          {/* Avisos/Badges */}
          {(needsAgentSelection || needsAllConnections) && (
            <div className="space-y-2 pt-1">
              {needsAgentSelection && (
                <div className="bg-[#FCECEC] border border-[#F9D6D6] text-[#7F4D4D] rounded-lg px-3 py-2 text-[13px] leading-relaxed">
                  É necessário escolher um atendente
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

TransferToAgentNode.displayName = 'TransferToAgentNode';

