// Nó "Perguntar por um nome" do canvas
import { useState, useEffect, useRef, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { AskNameDrawer, AskNameConfig } from '@/components/drawers/ask-name/AskNameDrawer';

// Helper para converter HTML em texto puro
const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

export interface AskNameData {
  value?: AskNameConfig;
  onChange?: (value: AskNameConfig) => void;
}

export const AskNameNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as AskNameData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const [value, setValue] = useState<AskNameConfig>(
    nodeData.value || {
      headerRichText: '',
      targetField: { key: '', type: 'Text' },
      validation: { kind: 'none' },
      invalidFlowEnabled: false,
      noResponseEnabled: false,
      noResponseDelayValue: 15,
      noResponseDelayUnit: 'minutes',
    }
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Refs para calcular posições reais
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const invalidCheckboxRef = useRef<HTMLDivElement | null>(null);
  const timeoutCheckboxRef = useRef<HTMLDivElement | null>(null);
  const [connectorPositions, setConnectorPositions] = useState<{
    valid: number;
    invalid: number;
    timeout: number;
  }>({
    valid: 0,
    invalid: 0,
    timeout: 0,
  });

  // Verificar conexões
  const isConnectedIn = useStore((store) =>
    store.edges.some((edge) => edge.target === id)
  );
  const connectedOutputs = useStore((store) =>
    store.edges
      .filter((edge) => edge.source === id)
      .map((edge) => edge.sourceHandle || '')
  );

  // Atualizar valor quando data mudar
  useEffect(() => {
    if (nodeData.value) {
      setValue(nodeData.value);
    }
  }, [nodeData.value]);

  // Calcular posições reais dos conectores
  useEffect(() => {
    const calculatePositions = () => {
      if (!nodeRef.current) return;

      // Centro vertical do preview
      const validPos = previewRef.current
        ? previewRef.current.offsetTop + previewRef.current.offsetHeight / 2 - 5
        : 0;

      // Centro vertical do checkbox "resposta inválida"
      const invalidPos = invalidCheckboxRef.current
        ? invalidCheckboxRef.current.offsetTop + invalidCheckboxRef.current.offsetHeight / 2 - 5
        : 0;

      // Centro vertical do checkbox "timeout"
      const timeoutPos = timeoutCheckboxRef.current
        ? timeoutCheckboxRef.current.offsetTop + timeoutCheckboxRef.current.offsetHeight / 2 - 5
        : 0;

      setConnectorPositions({
        valid: validPos,
        invalid: invalidPos,
        timeout: timeoutPos,
      });
    };

    const timer = setTimeout(calculatePositions, 10);
    return () => clearTimeout(timer);
  }, [value.invalidFlowEnabled, value.noResponseEnabled, value.headerRichText]);

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
  const handleValueChange = (newValue: AskNameConfig) => {
    setValue(newValue);
    nodeData.onChange?.(newValue);
  };

  // Validação
  const hasFieldSelected = value.targetField && value.targetField.key.length > 0;
  
  // Verificar se os conectores obrigatórios estão conectados
  const validConnected = connectedOutputs.includes('out:valid');
  const invalidConnected = connectedOutputs.includes('out:invalid');
  const timeoutConnected = connectedOutputs.includes('out:timeout');
  
  const hasConnectionError = 
    !validConnected ||
    (value.invalidFlowEnabled && !invalidConnected) ||
    (value.noResponseEnabled && !timeoutConnected);

  const nodeInfo = {
    title: 'Perguntar por um nome',
    description: `Este bloco permite capturar o nome do contato.

Configure uma pergunta, escolha onde salvar a resposta, defina validações opcionais (regex ou tamanho de texto) e configure fluxos alternativos para respostas inválidas ou timeout.

O sistema permite até 3 tentativas para respostas inválidas antes de seguir para o fluxo alternativo.`,
  };

  return (
    <>
      <div
        ref={nodeRef}
        role="group"
        className={cn(
          'group relative w-[328px] min-h-[200px] rounded-2xl border bg-white shadow-[0_2px_8px_rgba(16,24,40,.06)]',
          selected
            ? `ring-2 ring-[${NODE_TOKENS.RING}] ring-offset-2 ring-offset-[${NODE_TOKENS.RING_OFFSET}] border-[#DDE3F0]`
            : 'border-[#DDE3F0]',
          'cursor-move'
        )}
        onClick={(e) => {
          e.stopPropagation();
          setShowDrawer(true);
        }}
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

        {/* Conector de saída "válido" (alinhado ao preview) */}
        {connectorPositions.valid > 0 && (
          <div
            className="absolute"
            style={{
              top: `${connectorPositions.valid}px`,
              right: '-7.5px',
            }}
          >
            <NodeConnector
              type="source"
              position={Position.Right}
              id="out:valid"
              connected={validConnected}
              label="Resposta válida"
            />
          </div>
        )}

        {/* Conector de saída "inválido" (alinhado ao checkbox) */}
        {value.invalidFlowEnabled && connectorPositions.invalid > 0 && (
          <div
            className="absolute"
            style={{
              top: `${connectorPositions.invalid}px`,
              right: '-7.5px',
            }}
          >
            <NodeConnector
              type="source"
              position={Position.Right}
              id="out:invalid"
              connected={invalidConnected}
              label="Resposta inválida (após 3 tentativas)"
            />
          </div>
        )}

        {/* Conector de saída "timeout" (alinhado ao checkbox) */}
        {value.noResponseEnabled && connectorPositions.timeout > 0 && (
          <div
            className="absolute"
            style={{
              top: `${connectorPositions.timeout}px`,
              right: '-7.5px',
            }}
          >
            <NodeConnector
              type="source"
              position={Position.Right}
              id="out:timeout"
              connected={timeoutConnected}
              label="Não respondeu no tempo configurado"
            />
          </div>
        )}

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3">
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Perguntar por um nome
            </h3>
          </div>

          {/* Preview da pergunta */}
          <div
            ref={previewRef}
            className="text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 min-h-[44px] flex items-center"
          >
            {value.headerRichText.trim().length > 0 ? (
              <span className="line-clamp-2">{htmlToPlainText(value.headerRichText)}</span>
            ) : (
              <span className="text-neutral-500">Digite a pergunta no painel de configuração</span>
            )}
          </div>

          {/* Informação do campo selecionado */}
          {hasFieldSelected ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-500">Salvar em:</span>
              <span className="text-[12px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
                {value.targetField.key}
              </span>
            </div>
          ) : (
            <p className="text-[12px] text-orange-600">
              Selecione onde salvar a resposta no painel de configuração.
            </p>
          )}

          {/* Checkboxes de fluxos opcionais */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div
              className="flex items-start gap-2"
              ref={invalidCheckboxRef}
            >
              <Checkbox
                id={`invalid-${id}`}
                checked={value.invalidFlowEnabled}
                onCheckedChange={(checked) =>
                  handleValueChange({ ...value, invalidFlowEnabled: checked as boolean })
                }
                className="mt-0.5"
              />
              <Label
                htmlFor={`invalid-${id}`}
                className="text-[13px] text-neutral-700 leading-relaxed cursor-pointer"
              >
                Ativar fluxo para resposta inválida
              </Label>
            </div>

            <div
              className="flex items-start gap-2"
              ref={timeoutCheckboxRef}
            >
              <Checkbox
                id={`timeout-${id}`}
                checked={value.noResponseEnabled}
                onCheckedChange={(checked) =>
                  handleValueChange({ ...value, noResponseEnabled: checked as boolean })
                }
                className="mt-0.5"
              />
              <Label
                htmlFor={`timeout-${id}`}
                className="text-[13px] text-neutral-700 leading-relaxed cursor-pointer"
              >
                Ativar fluxo se o contato não responder
              </Label>
            </div>
          </div>

          {/* Badge de validação de conexões */}
          {hasConnectionError && (
            <div className="bg-[#FCECEC] border border-[#F9D6D6] text-[#7F4D4D] rounded-lg px-3 py-2 text-[13px] leading-relaxed">
              É necessário que todas as opções estejam conectadas
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

      {/* Drawer de configuração */}
      <AskNameDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        value={value}
        onChange={handleValueChange}
      />
    </>
  );
});

AskNameNode.displayName = 'AskNameNode';

