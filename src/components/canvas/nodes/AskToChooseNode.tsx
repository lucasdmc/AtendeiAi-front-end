// Nó "Pedir para escolher" do canvas
import { useState, useEffect, useRef, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { AskToChooseDrawer } from '@/components/drawers/ask-to-choose/AskToChooseDrawer';

export type Separator = 'space' | 'dot' | 'colon' | 'dash' | 'paren';

export interface OptionItem {
  id: string;
  labelRichText: string;
}

export interface AskToChooseValue {
  headerRichText?: string | null;
  useEmojiNumbering: boolean;
  separator: Separator;
  options: OptionItem[];
  footerRichText?: string | null;
  flowInvalidEnabled: boolean;
  flowNoResponseEnabled: boolean;
  noResponseDelayValue?: number;
  noResponseDelayUnit?: 'minutes' | 'hours';
}

export interface AskToChooseData {
  value?: AskToChooseValue;
  onChange?: (value: AskToChooseValue) => void;
}

const DEFAULT_VALUE: AskToChooseValue = {
  headerRichText: null,
  useEmojiNumbering: false,
  separator: 'dot',
  options: [
    { id: '1', labelRichText: 'Opção 01' },
    { id: '2', labelRichText: 'Opção 02' },
  ],
  footerRichText: null,
  flowInvalidEnabled: false,
  flowNoResponseEnabled: false,
  noResponseDelayValue: 15,
  noResponseDelayUnit: 'minutes',
};

// Função helper para converter HTML em texto puro
const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  
  // Criar elemento temporário para decodificar HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Pegar texto puro (decodifica automaticamente &nbsp;, &lt;, etc)
  return temp.textContent || temp.innerText || '';
};

export const AskToChooseNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data || {}) as AskToChooseData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const [value, setValue] = useState<AskToChooseValue>(
    nodeData.value || DEFAULT_VALUE
  );
  const [showInfo, setShowInfo] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Refs para calcular posições reais
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const invalidCheckboxRef = useRef<HTMLDivElement | null>(null);
  const timeoutCheckboxRef = useRef<HTMLDivElement | null>(null);
  const [connectorPositions, setConnectorPositions] = useState<{
    options: number[];
    invalid: number;
    timeout: number;
  }>({
    options: [],
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

      console.log('🔵 ==================== CÁLCULO DE POSIÇÕES ====================');
      console.log('📦 Nó:', nodeRef.current);
      console.log('📏 Nó offsetTop:', nodeRef.current.offsetTop);
      console.log('📏 Nó offsetHeight:', nodeRef.current.offsetHeight);

      // Calcular centro vertical de cada input de opção
      const optionPositions = optionRefs.current.map((ref, index) => {
        if (!ref) return 0;
        
        // Pegar borda superior e inferior do elemento
        const elementTop = ref.offsetTop;
        const elementHeight = ref.offsetHeight;
        
        // Calcular centro = top + (height / 2) - 5px de ajuste
        const centerY = elementTop + (elementHeight / 2) - 5;
        
        console.log(`\n📍 OPÇÃO ${index + 1}:`);
        console.log(`   Element:`, ref);
        console.log(`   offsetTop (borda superior): ${elementTop}px`);
        console.log(`   offsetHeight (altura): ${elementHeight}px`);
        console.log(`   ✅ Centro calculado: ${elementTop} + (${elementHeight} / 2) - 5 = ${centerY}px`);
        
        return centerY;
      });

      // Calcular centro vertical do checkbox "resposta inválida"
      let invalidPos = 0;
      if (invalidCheckboxRef.current) {
        const elementTop = invalidCheckboxRef.current.offsetTop;
        const elementHeight = invalidCheckboxRef.current.offsetHeight;
        invalidPos = elementTop + (elementHeight / 2) - 5;
        
        console.log(`\n📍 CHECKBOX RESPOSTA INVÁLIDA:`);
        console.log(`   Element:`, invalidCheckboxRef.current);
        console.log(`   offsetTop: ${elementTop}px`);
        console.log(`   offsetHeight: ${elementHeight}px`);
        console.log(`   ✅ Centro calculado: ${elementTop} + (${elementHeight} / 2) - 5 = ${invalidPos}px`);
      }

      // Calcular centro vertical do checkbox "timeout"
      let timeoutPos = 0;
      if (timeoutCheckboxRef.current) {
        const elementTop = timeoutCheckboxRef.current.offsetTop;
        const elementHeight = timeoutCheckboxRef.current.offsetHeight;
        timeoutPos = elementTop + (elementHeight / 2) - 5;
        
        console.log(`\n📍 CHECKBOX TIMEOUT:`);
        console.log(`   Element:`, timeoutCheckboxRef.current);
        console.log(`   offsetTop: ${elementTop}px`);
        console.log(`   offsetHeight: ${elementHeight}px`);
        console.log(`   ✅ Centro calculado: ${elementTop} + (${elementHeight} / 2) - 5 = ${timeoutPos}px`);
      }

      console.log('\n📊 RESULTADO FINAL:');
      console.log('   Posições das opções:', optionPositions);
      console.log('   Posição checkbox inválida:', invalidPos);
      console.log('   Posição checkbox timeout:', timeoutPos);
      console.log('🔵 ============================================================\n');

      setConnectorPositions({
        options: optionPositions,
        invalid: invalidPos,
        timeout: timeoutPos,
      });
    };

    // Executar após renderização
    const timer = setTimeout(calculatePositions, 10);
    return () => clearTimeout(timer);
  }, [value.options.length, value.flowInvalidEnabled, value.flowNoResponseEnabled]);

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
  const handleValueChange = (newValue: AskToChooseValue) => {
    setValue(newValue);
    if (nodeData.onChange) {
      nodeData.onChange(newValue);
    } else {
      // Se não houver onChange configurado, atualizar o nó diretamente
      const nodes = getNodes();
      setNodes(
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, value: newValue } }
            : node
        )
      );
      pushHistory();
    }
  };

  // Validações
  const allOptionsConnected = value.options.every((_, index) => {
    const handleId = `out:opt:${index + 1}`;
    return connectedOutputs.includes(handleId);
  });

  const invalidConnected = !value.flowInvalidEnabled || connectedOutputs.includes('out:invalid');
  const timeoutConnected = !value.flowNoResponseEnabled || connectedOutputs.includes('out:timeout');

  const hasError = !allOptionsConnected || !invalidConnected || !timeoutConnected;

  const nodeInfo = {
    title: 'Pedir para escolher',
    description: `Este bloco envia uma mensagem com opções enumeradas e aguarda a resposta do contato.

O contato pode responder com o número da opção ou com o texto da opção (case-insensitive).

Se a resposta for inválida, o bot tentará novamente (até 3 vezes). Após 3 tentativas, pode seguir para um fluxo alternativo.

Também é possível definir um tempo limite para resposta e criar um fluxo alternativo para quando o contato não responder.`,
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

        {/* Conector de entrada (lado esquerdo, na altura do título) */}
        <NodeConnector
          type="target"
          position={Position.Left}
          id="input"
          connected={isConnectedIn}
          label="Entrada do fluxo"
          className="!-left-[7.5px] !top-[24px]"
        />

        {/* Conectores de saída por opção (lado direito, alinhados ao centro de cada input) */}
        {value.options.map((option, index) => {
          const isConnected = connectedOutputs.includes(`out:opt:${index + 1}`);
          const topOffset = connectorPositions.options[index] || 0;
          
          return (
            <div
              key={option.id}
              className="absolute"
              style={{ top: `${topOffset}px`, right: '-7.5px' }}
            >
              <NodeConnector
                type="source"
                position={Position.Right}
                id={`out:opt:${index + 1}`}
                connected={isConnected}
                label={`Quando escolher a opção ${index + 1}`}
              />
            </div>
          );
        })}

        {/* Conector de saída para resposta inválida (alinhado com checkbox) */}
        {value.flowInvalidEnabled && connectorPositions.invalid > 0 && (
          <div
            className="absolute"
            style={{ 
              top: `${connectorPositions.invalid}px`,
              right: '-7.5px' 
            }}
          >
            <NodeConnector
              type="source"
              position={Position.Right}
              id="out:invalid"
              connected={connectedOutputs.includes('out:invalid')}
              label="Fluxo para resposta inválida"
            />
          </div>
        )}

        {/* Conector de saída para timeout (alinhado com checkbox) */}
        {value.flowNoResponseEnabled && connectorPositions.timeout > 0 && (
          <div
            className="absolute"
            style={{ 
              top: `${connectorPositions.timeout}px`,
              right: '-7.5px' 
            }}
          >
            <NodeConnector
              type="source"
              position={Position.Right}
              id="out:timeout"
              connected={connectedOutputs.includes('out:timeout')}
              label="Fluxo quando não responder"
            />
          </div>
        )}

        {/* Conteúdo do nó */}
        <div className="pt-3 pb-4 px-4 space-y-3">
          {/* Header: Ícone + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 border border-blue-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[14px] text-neutral-900 leading-tight">
              Pedir para escolher
            </h3>
          </div>

          {/* Mensagem inicial (apenas se existir) */}
          {value.headerRichText && value.headerRichText.trim().length > 0 && (
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-700">Mensagem inicial</Label>
              <div 
                className="text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDrawer(true);
                }}
              >
                <span className="line-clamp-2">
                  {htmlToPlainText(value.headerRichText)}
                </span>
              </div>
            </div>
          )}

          {/* Lista de opções como inputs */}
          <div className="space-y-2">
            {value.options.map((option, index) => {
              // Gerar prefixo (número + separador)
              const optionNumber = index + 1;
              let prefix = '';
              
              if (value.useEmojiNumbering) {
                // Emojis numéricos: 1️⃣ 2️⃣ 3️⃣ etc
                const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                prefix = emojiNumbers[index] || `${optionNumber}️⃣`;
              } else {
                prefix = optionNumber.toString();
              }
              
              // Adicionar separador
              const separatorMap: Record<Separator, string> = {
                'space': ' ',
                'dot': '. ',
                'colon': ': ',
                'dash': ' - ',
                'paren': ') ',
              };
              const separator = separatorMap[value.separator] || '. ';
              
              const displayText = prefix + separator + htmlToPlainText(option.labelRichText);
              
              return (
                <div 
                  key={option.id} 
                  className="relative"
                  ref={(el) => (optionRefs.current[index] = el)}
                >
                  <input
                    type="text"
                    value={displayText}
                    readOnly
                    className="w-full h-9 rounded-2xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDrawer(true);
                    }}
                    placeholder={`${prefix}${separator}Opção ${optionNumber}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Mensagem final (apenas se existir) */}
          {value.footerRichText && value.footerRichText.trim().length > 0 && (
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-700">Mensagem final</Label>
              <div 
                className="text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDrawer(true);
                }}
              >
                <span className="line-clamp-2">
                  {htmlToPlainText(value.footerRichText)}
                </span>
              </div>
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
                checked={value.flowInvalidEnabled}
                onCheckedChange={(checked) =>
                  handleValueChange({ ...value, flowInvalidEnabled: checked as boolean })
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
                checked={value.flowNoResponseEnabled}
                onCheckedChange={(checked) =>
                  handleValueChange({ ...value, flowNoResponseEnabled: checked as boolean })
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

          {/* Badge de validação */}
          {hasError && (
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
      <AskToChooseDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        value={value}
        onChange={handleValueChange}
      />
    </>
  );
});

AskToChooseNode.displayName = 'AskToChooseNode';

