// Card individual de mídia com preview e ações
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Pencil,
  Copy,
  Trash2,
  GripVertical,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MediaItem } from './MediaSelector';

interface MediaCardProps {
  id: string;
  media: MediaItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  showDragHandle?: boolean;
}

export function MediaCard({
  id,
  media,
  onEdit,
  onDuplicate,
  onDelete,
  showDragHandle = true,
}: MediaCardProps) {
  // Configurar drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderMediaPreview = () => {
    // Placeholder se não houver URL
    if (!media.url) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded-lg">
          <ImageIcon className="w-16 h-16 text-neutral-400 mb-2" />
          <p className="text-sm text-neutral-500">{media.name || 'Selecionar mídia...'}</p>
        </div>
      );
    }

    switch (media.type) {
      case 'image':
        return (
          <div className="relative w-full h-48 bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src={media.url}
              alt={media.name || 'Imagem'}
              className="w-full h-full object-cover"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded-lg">
            <FileText className="w-16 h-16 text-red-500 mb-2" />
            <p className="text-sm text-neutral-700 font-medium truncate max-w-full px-4">
              {media.name || 'Documento PDF'}
            </p>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded-lg">
            <Music className="w-16 h-16 text-purple-500 mb-2" />
            <p className="text-sm text-neutral-700 font-medium truncate max-w-full px-4">
              {media.name || 'Arquivo de áudio'}
            </p>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded-lg">
            <Video className="w-16 h-16 text-blue-500 mb-2" />
            <p className="text-sm text-neutral-700 font-medium truncate max-w-full px-4">
              {media.name || 'Vídeo'}
            </p>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded-lg">
            <ImageIcon className="w-16 h-16 text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-500">Mídia</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Preview da mídia */}
      <div className="p-3">
        {renderMediaPreview()}
      </div>

      {/* Toolbar de ações */}
      <div className="border-t border-neutral-100 px-3 py-2 flex items-center justify-end bg-neutral-50 gap-1">
        <TooltipProvider delayDuration={300}>
          {/* Editar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
              >
                <Pencil className="w-4 h-4 text-neutral-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>

          {/* Drag handle */}
          {showDragHandle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1.5 hover:bg-neutral-200 rounded transition-colors cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Arrastar</TooltipContent>
            </Tooltip>
          )}

          {/* Copiar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDuplicate}
                className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-neutral-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Duplicar</TooltipContent>
          </Tooltip>

          {/* Deletar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

