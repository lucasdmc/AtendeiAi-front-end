// Nó "Iniciar manualmente" do canvas
import { useState, useEffect, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { Hand, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import {
  StartManuallyDrawer,
  StartManuallyValue,
} from '@/components/drawers/start-manually/StartManuallyDrawer';

export interface StartManuallyData {
  value?: StartManuallyValue;
  onChange?: (value: StartManuallyValue) => void;
}

const DEFAULT_VALUE: StartManuallyValue = {
  title: 'Início',
  unlisted: false,
  variables: [],
};

export const StartManuallyNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as StartManuallyData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const [value, setValue] = useState<StartManuallyValue>(
    nodeData.value || DEFAULT_VALUE
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Verificar se o conector de saída está conectado
  const isConnectedOut = useStore((store) =>
    store.edges.some((edge) => edge.source === id)
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

    // Encontrar uma posição não sobreposta
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
  const handleValueChange = (newValue: StartManuallyValue) => {
    setValue(newValue);
    nodeData.onChange?.(newValue);
  };

  // Atualizar título diretamente no nó
  const handleTitleChange = (newTitle: string) => {
    const newValue = { ...value, title: newTitle };
    setValue(newValue);
    nodeData.onChange?.(newValue);
  };

  // Atualizar "Não listado" diretamente no nó
  const handleUnlistedChange = (unlisted: boolean) => {
    const newValue = { ...value, unlisted };
    setValue(newValue);
    nodeData.onChange?.(newValue);
  };

  const nodeInfo = {
    title: 'Iniciar manualmente',
    description: `Este bloco permite iniciar o fluxo manualmente através de uma ação do atendente.

Quando adicionada essa ação no seu chatbot, ele ficará disponível na lista de chatbots executáveis que pode ser aberta a partir do botão Chatbots (ou apertando CTRL + B) dentro de qualquer conversa. Na lista, será identificado pelo nome do seu fluxo seguido pelo título desta ação.

Você pode adicionar quantas ações destas quiser para levar a lugares diferentes do seu chatbot, desde que os nomes sejam únicos.

É possível também marcar como "Não listado". Útil para bots de que a intenção não é serem executados diretamente pelos atendentes, mas sim via configuração geral da organização em certos cenários ou via API.

É possível adicionar variáveis personalizadas que podem ser utilizadas ao longo da interação com o bot. Esses valores são escolhidos no momento da execução manual deste chatbot.

O status do bot de ativado/desativado não afeta blocos de início manual.`,
  };

  return (
    <>
      <div
        role="group"
        className={cn(
          'group relative w-[296px] min-h-[140px] rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_8px_rgba(16,24,40,.06)]',
          selected &&
            `ring-2 ring-[${NODE_TOKENS.RING}] ring-offset-2 ring-offset-[${NODE_TOKENS.RING_OFFSET}]`,
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

        {/* Conector de saída (lado direito, centralizado verticalmente) */}
        <NodeConnector
          type="source"
          position={Position.Right}
          id="output"
          connected={isConnectedOut}
          label="Saída do bloco: Iniciar manualmente"
          className="!-right-[7.5px] !top-[50%] !-translate-y-1/2"
        />

        {/* Conteúdo do nó */}
        <div className="p-3.5 space-y-3">
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <Hand className="w-5 h-5 text-blue-600" />
            </div>
            <h3
              id="start-manually-title"
              className="font-semibold text-[14px] text-neutral-900 leading-tight"
            >
              Iniciar manualmente
            </h3>
          </div>

          {/* Campo: Título */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`title-${id}`}
              className="text-[13px] text-neutral-700"
            >
              Título
            </Label>
            <Input
              id={`title-${id}`}
              value={value.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Digite o título"
              className="h-9 w-full rounded-2xl border-neutral-200 bg-white px-3 text-[14px] text-neutral-800 placeholder:text-neutral-400 shadow-inner"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Switch: Não listado */}
          <div
            className="flex items-center gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              id={`unlisted-${id}`}
              checked={value.unlisted}
              onCheckedChange={handleUnlistedChange}
            />
            <Label
              htmlFor={`unlisted-${id}`}
              className="text-[14px] font-semibold text-neutral-900 cursor-pointer"
            >
              Não listado
            </Label>
          </div>

          {/* Variáveis (preview) */}
          {value.variables.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[13px] text-neutral-700">Variáveis</Label>
              <div className="bg-neutral-100 rounded-xl p-2.5 space-y-1">
                {value.variables.map((variable) => (
                  <p
                    key={variable.id}
                    className="text-[13px] text-neutral-600 leading-relaxed"
                  >
                    Nome: {variable.name || '(sem nome)'}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Link: Avançado */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDrawer(true);
            }}
            className="flex items-center gap-1.5 text-[14px] text-neutral-700 hover:text-neutral-900 underline-offset-4 hover:underline transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-500" />
            Avançado
          </button>
        </div>
      </div>

      {/* Modal de informações */}
      <NodeInfoDialog
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title={nodeInfo.title}
        description={nodeInfo.description}
      />

      {/* Drawer de configuração avançada */}
      <StartManuallyDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        value={value}
        onChange={handleValueChange}
      />
    </>
  );
});

StartManuallyNode.displayName = 'StartManuallyNode';

