// Drawer lateral para editar mensagens do nó
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCard } from '@/components/messages/MessageCard';
import { MediaCard } from '@/components/messages/MediaCard';
import { MediaSelector, MediaItem } from '@/components/messages/MediaSelector';

export interface MessageBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface MediaBlock extends Omit<MediaItem, 'type'> {
  type: 'image' | 'pdf' | 'audio' | 'video';
  blockType: 'media'; // Distinguir de blocos de texto
}

export type ContentBlock = MessageBlock | MediaBlock;

export interface SendMessageValue {
  blocks?: ContentBlock[];
  variables?: string[];
}

interface MessagesDrawerProps {
  open: boolean;
  onClose: () => void;
  value: SendMessageValue;
  onChange: (value: SendMessageValue) => void;
}

// Modifier customizado: restringe movimento apenas ao eixo vertical
const restrictToVerticalAxis = ({ transform }: any) => {
  return {
    ...transform,
    x: 0,
  };
};

export function MessagesDrawer({
  open,
  onClose,
  value,
  onChange,
}: MessagesDrawerProps) {
  // Inicializar blocos (mensagens + mídias unificados)
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    if (value.blocks && value.blocks.length > 0) {
      return value.blocks;
    }
    return [{ id: `msg-${Date.now()}`, type: 'text', content: '' }];
  });

  // State do modal de seleção de mídia
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Atualizar blocos no value
  const updateBlocks = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    onChange({ ...value, blocks: newBlocks });
  };

  // Adicionar nova mensagem
  const handleAddMessage = () => {
    const newMessage: MessageBlock = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: '',
    };
    updateBlocks([...blocks, newMessage]);
  };

  // Atualizar conteúdo de uma mensagem
  const handleMessageChange = (id: string, content: string) => {
    const updated = blocks.map((block) =>
      block.id === id && block.type === 'text' ? { ...block, content } : block
    );
    updateBlocks(updated);
  };

  // Duplicar bloco (mensagem ou mídia)
  const handleDuplicateBlock = (id: string) => {
    const blockIndex = blocks.findIndex((b) => b.id === id);
    if (blockIndex !== -1) {
      const original = blocks[blockIndex];
      const duplicate: ContentBlock = {
        ...original,
        id: `${original.type}-${Date.now()}`,
      };
      const updated = [
        ...blocks.slice(0, blockIndex + 1),
        duplicate,
        ...blocks.slice(blockIndex + 1),
      ];
      updateBlocks(updated);
    }
  };

  // Deletar bloco
  const handleDeleteBlock = (id: string) => {
    const remaining = blocks.filter((b) => b.id !== id);
    if (remaining.length === 0) {
      // Não permitir deletar todos os blocos, criar uma mensagem vazia
      updateBlocks([{ id: `msg-${Date.now()}`, type: 'text', content: '' }]);
    } else {
      updateBlocks(remaining);
    }
  };

  // Abrir modal para adicionar mídia (cria placeholder primeiro)
  const handleAddMedia = () => {
    // Criar placeholder de mídia imediatamente
    const placeholderMedia: MediaBlock = {
      id: `media-${Date.now()}`,
      type: 'image', // tipo padrão, será substituído ao selecionar
      blockType: 'media',
      url: '',
      name: 'Selecionar mídia...',
    };
    updateBlocks([...blocks, placeholderMedia]);
    
    // Abrir modal para selecionar
    setEditingBlockId(placeholderMedia.id);
    setShowMediaSelector(true);
  };

  // Abrir modal para editar mídia
  const handleEditMedia = (id: string) => {
    setEditingBlockId(id);
    setShowMediaSelector(true);
  };

  // Selecionar mídia (substituir placeholder ou editar existente)
  const handleSelectMedia = (media: MediaItem) => {
    if (editingBlockId) {
      // Substituir bloco existente com a mídia selecionada
      const updated = blocks.map((block) =>
        block.id === editingBlockId
          ? { ...media, id: block.id, blockType: 'media' as const }
          : block
      );
      updateBlocks(updated);
    }
  };

  // Configurar sensores de drag
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reordenar blocos (mensagens e mídias unificados)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const reordered = arrayMove(blocks, oldIndex, newIndex);
      updateBlocks(reordered);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-neutral-900">
            Mensagens
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {/* Título da seção */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">
                Escreva uma mensagem
              </h3>
            </div>

            {/* Lista unificada de blocos (mensagens + mídias) */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {blocks.map((block) =>
                    block.type === 'text' ? (
                      <MessageCard
                        key={block.id}
                        id={block.id}
                        value={block.content}
                        onChange={(content) => handleMessageChange(block.id, content)}
                        onDuplicate={() => handleDuplicateBlock(block.id)}
                        onDelete={() => handleDeleteBlock(block.id)}
                        placeholder="Clique para editar..."
                        showDragHandle={blocks.length > 1}
                      />
                    ) : (
                      <MediaCard
                        key={block.id}
                        id={block.id}
                        media={{
                          id: block.id,
                          type: block.type,
                          url: block.url,
                          name: block.name,
                        }}
                        onEdit={() => handleEditMedia(block.id)}
                        onDuplicate={() => handleDuplicateBlock(block.id)}
                        onDelete={() => handleDeleteBlock(block.id)}
                        showDragHandle={blocks.length > 1}
                      />
                    )
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Botões de ação */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMessage}
                className="text-sm font-medium"
              >
                + Adicionar mensagem
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMedia}
                className="text-sm font-medium"
              >
                + Adicionar mídia
              </Button>
            </div>

            {/* Dica de variáveis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> Use o botão "Usar campo" na toolbar para
                inserir variáveis como <code className="bg-blue-100 px-1 py-0.5 rounded">@nome_cliente</code> ou{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded">@telefone</code>.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Modal de seleção de mídia */}
      <MediaSelector
        open={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={handleSelectMedia}
      />
    </Sheet>
  );
}

