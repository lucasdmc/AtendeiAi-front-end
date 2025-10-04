/**
 * Canvas Node: Perguntar por um arquivo/mídia
 */

import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { NodeProps, Position, useStore, useReactFlow } from '@xyflow/react';
import { Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { AskFileConfig } from '@/types/askFile';
import { AskFileDrawer } from '@/components/drawers/ask-file/AskFileDrawer';
import { formatExtensionsList } from '@/lib/fileValidators';

// Helper para converter HTML em texto puro
const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

export interface AskFileData {
  value?: AskFileConfig;
  onChange?: (value: AskFileConfig) => void;
}

export const AskFileNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as AskFileData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  const [value, setValue] = useState<AskFileConfig>(
    nodeData.value || {
      headerRichText: '',
      allowedExtensions: [],
      validationErrorMessage: 'Desculpe, não entendi. Por favor, envie um arquivo válido.',
      targetField: { key: '', type: 'File' },
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

  // Atualizar valor quando data mudar
  useEffect(() => {
    if (nodeData.value) {
      setValue(nodeData.value);
    }
  }, [nodeData.value]);

  // Verificar conexões
  const isConnectedIn = useStore((store) =>
    store.edges.some((edge) => edge.target === id)
  );
  const connectedOutputs = useStore((store) =>
    store.edges
      .filter((edge) => edge.source === id)
      .map((edge) => edge.sourceHandle || '')
  );

  const hasFieldSelected = value.targetField && value.targetField.key.length > 0;
  
  // Verificar se os conectores obrigatórios estão conectados
  const validConnected = connectedOutputs.includes('out:valid');
  const invalidConnected = connectedOutputs.includes('out:invalid');
  const timeoutConnected = connectedOutputs.includes('out:timeout');
  
  const hasConnectionError = 
    !validConnected ||
    (value.invalidFlowEnabled && !invalidConnected) ||
    (value.noResponseEnabled && !timeoutConnected);

  // Calcular posições reais dos conectores
  useEffect(() => {
    const calc = () => {
      if (!nodeRef.current) return;

      const nodeRect = nodeRef.current.getBoundingClientRect();

      let validTop = 0;
      if (previewRef.current) {
        const rect = previewRef.current.getBoundingClientRect();
        validTop = rect.top - nodeRect.top + rect.height / 2;
      }

      let invalidTop = 0;
      if (value.invalidFlowEnabled && invalidCheckboxRef.current) {
        const rect = invalidCheckboxRef.current.getBoundingClientRect();
        invalidTop = rect.top - nodeRect.top + rect.height / 2 - 5;
      }

      let timeoutTop = 0;
      if (value.noResponseEnabled && timeoutCheckboxRef.current) {
        const rect = timeoutCheckboxRef.current.getBoundingClientRect();
        timeoutTop = rect.top - nodeRect.top + rect.height / 2 - 5;
      }

      setConnectorPositions({
        valid: validTop,
        invalid: invalidTop,
        timeout: timeoutTop,
      });
    };

    requestAnimationFrame(calc);
  }, [value.invalidFlowEnabled, value.noResponseEnabled, value.headerRichText, value.targetField]);

  // Handler para mudanças no value
  const handleValueChange = useCallback(
    (newValue: AskFileConfig) => {
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
    console.log(`[AskFileNode] Duplicate node: ${id}`);
  }, [id]);

  const handleDelete = useCallback(() => {
    console.log(`[AskFileNode] Delete node: ${id}`);
  }, [id]);

  const nodeInfo = {
    title: 'Perguntar por um arquivo/mídia',
    description: `Este bloco permite capturar um arquivo ou mídia enviada pelo contato.

Configure uma pergunta, defina quais extensões de arquivo são permitidas (PDF, imagens, vídeos, etc.), escolha onde salvar a resposta e configure fluxos alternativos para respostas inválidas ou timeout.

O sistema valida se o arquivo enviado tem uma das extensões permitidas e permite até 3 tentativas antes de seguir para o fluxo alternativo.`,
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
              label="Arquivo válido"
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
              label="Arquivo inválido (após 3 tentativas)"
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
              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Perguntar por um arquivo/mídia
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

          {/* Extensões permitidas */}
          {value.allowedExtensions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-500">Extensões:</span>
              <span className="text-[12px] font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 rounded px-2 py-0.5">
                {formatExtensionsList(value.allowedExtensions)}
              </span>
            </div>
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
      <AskFileDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        value={value}
        onChange={handleValueChange}
      />
    </>
  );
});

AskFileNode.displayName = 'AskFileNode';

