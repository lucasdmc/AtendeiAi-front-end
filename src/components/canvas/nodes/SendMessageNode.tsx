// Nó "Enviar mensagem" do canvas
import { useState, useEffect, memo } from 'react';
import { NodeProps, Position, useReactFlow, useStore } from '@xyflow/react';
import { MessageSquareText, AlertCircle, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeConnector } from './parts/NodeConnector';
import { NodeActionsMenu } from './parts/NodeActionsMenu';
import { NodeInfoDialog } from './parts/NodeInfoDialog';
import { NODE_TOKENS } from './styles';
import { useEditorStore } from '@/stores/editorStore';
import { MessagesDrawer, SendMessageValue } from '@/components/drawers/messages/MessagesDrawer';

export interface SendMessageData {
  value?: SendMessageValue;
  onChange?: (value: SendMessageValue) => void;
}

export const SendMessageNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as SendMessageData;
  const { getNodes, setNodes } = useReactFlow();
  const pushHistory = useEditorStore((state) => state.pushHistory);
  
  const [value, setValue] = useState<SendMessageValue>(nodeData.value || { blocks: [{ id: `msg-${Date.now()}`, type: 'text', content: '' }] });
  const [showInfo, setShowInfo] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Verificar se os conectores estão conectados (observando edges diretamente)
  const isConnectedIn = useStore((store) => 
    store.edges.some(edge => edge.target === id)
  );
  const isConnectedOut = useStore((store) => 
    store.edges.some(edge => edge.source === id)
  );

  // Atualizar valor quando data mudar
  useEffect(() => {
    if (nodeData.value) {
      setValue(nodeData.value);
    }
  }, [nodeData.value]);

  // Validação - verificar se há algum bloco com conteúdo
  const hasContent = value.blocks && value.blocks.some(block => {
    if (block.type === 'text') {
      return block.content.trim().length > 0;
    } else if ('blockType' in block && block.blockType === 'media') {
      return block.url && block.url.trim().length > 0; // Considera preenchido se tiver URL
    }
    return false;
  });
  const hasError = !hasContent;

  // Duplicar nó
  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const cascadeOffset = 12;
    let stackCount = 0;
    nodes.forEach((node) => {
      const dx = Math.abs(node.position.x - currentNode.position.x);
      const dy = Math.abs(node.position.y - currentNode.position.y);
      if (dx < 150 && dy < 150 && dx === dy) {
        stackCount++;
      }
    });
    
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

  // Abrir drawer
  const handleOpenDrawer = () => {
    setShowDrawer(true);
  };

  // Atualizar valor do drawer
  const handleValueChange = (newValue: SendMessageValue) => {
    console.log(`🔄 [SEND MESSAGE NODE] Recebendo mudança do drawer:`, {
      nodeId: id,
      newValue,
      hasOnChange: !!nodeData.onChange,
      blocksCount: newValue.blocks?.length || 0
    });
    
    setValue(newValue);
    
    if (nodeData.onChange) {
      console.log(`📤 [SEND MESSAGE NODE] Chamando onChange callback`);
      nodeData.onChange(newValue);
    } else {
      console.warn(`⚠️ [SEND MESSAGE NODE] onChange callback não definido! Atualizando nó manualmente...`);
      
      // Fallback: atualizar o nó diretamente
      const nodes = getNodes();
      const updatedNodes = nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, value: newValue } } : n
      );
      setNodes(updatedNodes);
      pushHistory();
    }
  };

  const nodeInfo = {
    title: 'Enviar mensagens',
    description: `Este bloco envia uma ou mais mensagens de texto ou mídia para o contato.

Você pode usar variáveis como @nome_cliente, @telefone, etc. para personalizar as mensagens.

As mensagens suportam formatação simples (negrito, itálico, listas).`,
  };

  // Renderizar ícone de mídia por tipo
  const renderMediaIcon = (type: string) => {
    const iconProps = { className: "w-8 h-8" };
    switch (type) {
      case 'image':
        return <ImageIcon {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <FileText {...iconProps} className="w-8 h-8 text-red-500" />;
      case 'audio':
        return <Music {...iconProps} className="w-8 h-8 text-purple-500" />;
      case 'video':
        return <Video {...iconProps} className="w-8 h-8 text-blue-500" />;
      default:
        return <ImageIcon {...iconProps} className="w-8 h-8 text-neutral-400" />;
    }
  };

  return (
    <>
      <div
        role="group"
        aria-labelledby="send-message-title"
        className={cn(
          'group relative bg-white rounded-2xl border transition-all',
          'shadow-[0_2px_8px_rgba(16,24,40,0.06)]',
          'cursor-move',
          selected && 'ring-2 ring-[#4F8DF6] ring-offset-2 ring-offset-[#EFF3FF]',
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

        {/* Conector de entrada (lado esquerdo, na altura do título) */}
        <NodeConnector
          type="target"
          position={Position.Left}
          id="input"
          connected={isConnectedIn}
          label="Entrada do bloco: Enviar mensagens"
          className="!-left-[7.5px] !top-[24px]"
        />

        {/* Conector de saída (lado direito, na altura do título) */}
        <NodeConnector
          type="source"
          position={Position.Right}
          id="output"
          connected={isConnectedOut}
          label="Saída do bloco: Enviar mensagens"
          className="!-right-[7.5px] !top-[24px]"
        />

        {/* Conteúdo do nó */}
        <div className="p-3.5 space-y-3">
          {/* Header: Badge + Título */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 border border-emerald-300 rounded-md px-1.5 py-0.5 flex items-center justify-center">
              <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 
              id="send-message-title"
              className="font-semibold text-[14px] text-neutral-900 leading-tight"
            >
              Enviar mensagens
            </h3>
          </div>

          {/* Preview de mensagens (bubbles separados) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDrawer();
            }}
            className={cn(
              'w-full min-h-[44px] space-y-2 rounded-2xl border border-neutral-200',
              'bg-white p-2',
              'hover:bg-neutral-50 transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
            )}
            role="button"
            tabIndex={0}
          >
            {/* Blocos unificados (mensagens + mídias) */}
            {value.blocks && value.blocks.length > 0 ? (
              value.blocks.map((block) => {
                if (block.type === 'text') {
                  return (
                    <div
                      key={block.id}
                      className={cn(
                        'px-3 py-2 rounded-xl bg-neutral-100',
                        'text-sm',
                        block.content.trim() ? 'text-neutral-700' : 'text-neutral-400',
                        'break-words'
                      )}
                    >
                      {block.content.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                      ) : (
                        'Clique para editar...'
                      )}
                    </div>
                  );
                } else if ('blockType' in block && block.blockType === 'media') {
                  return (
                    <div
                      key={block.id}
                      className="rounded-xl bg-neutral-100 overflow-hidden"
                    >
                      {!block.url ? (
                        // Placeholder de mídia
                        <div className="flex flex-col items-center justify-center h-24 bg-neutral-50">
                          <ImageIcon className="w-8 h-8 text-neutral-400 mb-1" />
                          <p className="text-xs text-neutral-400">Selecionar mídia...</p>
                        </div>
                      ) : block.type === 'image' ? (
                        <img 
                          src={block.url} 
                          alt={block.name || 'Imagem'} 
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-24 bg-neutral-50">
                          {renderMediaIcon(block.type)}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <div className="px-3 py-2 text-sm text-neutral-500">
                Digite aqui a mensagem que será enviada pelo bot.
              </div>
            )}
          </div>

          {/* Chip de erro */}
          {hasError && (
            <div className="bg-[#FDECEC] border border-[#F9D6D6] text-neutral-700 rounded-xl px-3 py-2 shadow-[0_1px_3px_rgba(16,24,40,.05)] flex items-start gap-2">
              <AlertCircle 
                className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" 
                aria-hidden="true"
              />
              <p className="text-[13px] leading-5">
                É obrigatório uma mensagem ou mídia
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

      {/* Drawer de mensagens */}
      <MessagesDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        value={value}
        onChange={handleValueChange}
      />
    </>
  );
});

SendMessageNode.displayName = 'SendMessageNode';

