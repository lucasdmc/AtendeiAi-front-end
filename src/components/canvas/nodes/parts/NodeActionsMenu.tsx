// Menu de ações flutuante para nós do canvas
import { useState } from 'react';
import { Info, Copy, CopyPlus, Trash2, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NodeActionsMenuProps {
  nodeId: string;
  onShowInfo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  className?: string;
}

export function NodeActionsMenu({
  nodeId,
  onShowInfo,
  onDuplicate,
  onDelete,
  className,
}: NodeActionsMenuProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(nodeId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar ID:', err);
    }
  };

  return (
    <div
      className={cn(
        'absolute -top-12 left-0',
        'bg-white rounded-lg shadow-lg border border-neutral-200',
        'flex items-center gap-1 px-2 py-1.5',
        'z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Botão Info */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowInfo();
              }}
              className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Clique para ver mais detalhes"
            >
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Clique para ver mais detalhes</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Copiar ID */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId();
              }}
              className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label={isCopied ? 'Id copiado!' : 'Copiar Id'}
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-600" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isCopied ? 'Id copiado!' : 'Copiar Id'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Duplicar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Duplicar bloco (Ctrl+O, Ctrl+P)"
            >
              <CopyPlus className="w-4 h-4 text-neutral-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Duplicar bloco (Ctrl+O, Ctrl+P)</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Excluir */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              aria-label="Excluir"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Excluir</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

