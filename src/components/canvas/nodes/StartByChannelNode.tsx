// Nó "Iniciar por um canal" do canvas
import { useState, useEffect, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeConnector } from './parts/NodeConnector';
import { ChannelSelect, Channel } from './parts/ChannelSelect';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';

export interface StartByChannelData {
  channelIds?: string[];
  onChange?: (channelIds: string[]) => void;
  getActiveChannels?: () => Promise<Channel[]>;
}

export const StartByChannelNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as StartByChannelData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(nodeData.channelIds || []);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Verificar se o conector de saída está conectado (observando edges diretamente)
  const isConnected = useStore((store) => 
    store.edges.some(edge => edge.source === id)
  );

  // Carrega canais ativos
  useEffect(() => {
    if (nodeData.getActiveChannels) {
      setIsLoadingChannels(true);
      nodeData.getActiveChannels()
        .then(setChannels)
        .catch((err: Error) => {
          console.error('Erro ao carregar canais:', err);
          setChannels([]); // Fallback para array vazio
        })
        .finally(() => {
          setIsLoadingChannels(false);
        });
    }
  }, [nodeData.getActiveChannels]);

  // Atualiza seleção quando data muda
  useEffect(() => {
    if (nodeData.channelIds) {
      setSelectedChannels(nodeData.channelIds);
    }
  }, [nodeData.channelIds]);

  const handleChannelChange = (ids: string[]) => {
    console.log('🔄 StartByChannelNode - handleChannelChange:', { nodeId: id, ids });
    setSelectedChannels(ids);
    
    if (nodeData.onChange) {
      console.log('🔄 StartByChannelNode - Calling onChange callback');
      nodeData.onChange(ids);
    } else {
      console.warn('⚠️ StartByChannelNode - onChange callback not available');
    }
  };

  const hasError = selectedChannels.length === 0;

  // Duplicar nó
  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    // Criar efeito cascata: offsets pequenos e incrementais
    const cascadeOffset = 12; // 12px por duplicação
    
    // Contar quantos nós já existem nesta "pilha"
    let stackCount = 0;
    nodes.forEach((node) => {
      const dx = Math.abs(node.position.x - currentNode.position.x);
      const dy = Math.abs(node.position.y - currentNode.position.y);
      // Se está muito próximo (dentro de uma cascata), contar
      if (dx < 150 && dy < 150 && dx === dy) {
        stackCount++;
      }
    });
    
    // Calcular posição em cascata
    const offset = cascadeOffset * (stackCount + 1);
    const newPosition = {
      x: currentNode.position.x + offset,
      y: currentNode.position.y + offset,
    };

    const newNode = {
      ...currentNode,
      id: `${currentNode.type}-${Date.now()}`,
      position: newPosition,
      selected: false,
    };

    setNodes([...nodes, newNode]);
    pushHistory();
  };

  // Excluir nó
  const handleDelete = () => {
    const nodes = getNodes();
    setNodes(nodes.filter((n) => n.id !== id));
    pushHistory();
  };

  const nodeInfo = {
    title: 'Iniciar por um canal',
    description: `Esta ação ocorrerá toda vez que um contato enviar uma mensagem para os canais especificados e não há nenhuma conversa já aberta com ele no canal onde a mensagem foi enviada.

Se já tem um chat aberto (até mesmo um que foi aberto manualmente e não tem nenhuma mensagem ainda), independente de quanto tempo está ocioso, o evento não será invocado.

O funcionamento desse bloco é sujeito a o status de ativado/desativado do bot. Se quiser testar o seu bot sem ativá-lo para novos chats do canal selecionado, você pode usar um bloco de início manual ao invés de/em conjunto com esse bloco e invocá-lo manualmente em seus chats, pois não são afetados pelo status de ativação do bot.`,
  };

  return (
    <>
      <div
        role="group"
        aria-labelledby="start-by-channel-title"
        className={cn(
          'group relative bg-white rounded-2xl border transition-all',
          'shadow-[0_2px_8px_rgba(16,24,40,0.06)]',
          'cursor-move',
          // Estado selecionado
          selected && 'ring-2 ring-[#4F8DF6] ring-offset-2 ring-offset-[#EFF3FF]',
          // Borda normal
          !selected && 'border-neutral-200',
        )}
        style={{ width: NODE_TOKENS.WIDTH }}
      >
        {/* Menu de ações flutuante */}
        <NodeActionsMenu
          nodeId={id}
          onShowInfo={() => setShowInfo(true)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      {/* Conector de saída (lado direito) */}
      <NodeConnector
        type="source"
        position={Position.Right}
        id="output"
        connected={isConnected}
        label="Saída do bloco: Iniciar por um canal"
        className="!-right-[7.5px] !top-[50%] !-translate-y-1/2"
      />

      {/* Conteúdo do nó */}
      <div className="p-4 space-y-3">
        {/* Header: Ícone + Título */}
        <div className="flex items-center gap-2">
          <MessageCircle 
            size={20} 
            className="text-emerald-500 flex-shrink-0" 
            aria-hidden="true"
          />
          <h3 
            id="start-by-channel-title"
            className="font-semibold text-[14px] text-neutral-900 leading-tight"
          >
            Iniciar por um canal
          </h3>
        </div>

        {/* Label do campo */}
        <p className="text-[14px] text-neutral-700 leading-6">
          Selecione um ou mais canais
        </p>

        {/* Select de canais */}
        <ChannelSelect
          channels={channels}
          selectedIds={selectedChannels}
          onChange={handleChannelChange}
          placeholder={isLoadingChannels ? "Carregando canais..." : "Selecione"}
        />

        {/* Mensagem de erro */}
        {hasError && (
          <div
            role="alert"
            aria-live="polite"
            className={cn(
              'rounded-xl px-3 py-2.5',
              'flex items-start gap-2',
              'shadow-[0_1px_4px_rgba(16,24,40,0.04)]'
            )}
            style={{
              backgroundColor: NODE_TOKENS.ERROR_BG,
              border: `1px solid ${NODE_TOKENS.ERROR_BORDER}`,
            }}
          >
            <AlertCircle 
              className="h-4 w-4 text-neutral-700 flex-shrink-0 mt-0.5" 
              aria-hidden="true"
            />
            <p className="text-[13px] leading-5 text-neutral-700">
              É necessário selecionar um canal
            </p>
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

StartByChannelNode.displayName = 'StartByChannelNode';

