// Toolbar principal do editor
import { Plus, Lightbulb, Undo2, Redo2, Save, Pencil, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorToolbarProps {
  flowName: string;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onOpenBlocks: () => void;
  onOpenIdeas: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onRename: () => void;
  onTestFlow: () => void;
  isSaving?: boolean;
}

export function EditorToolbar({
  flowName,
  isDirty,
  canUndo,
  canRedo,
  onOpenBlocks,
  onOpenIdeas,
  onUndo,
  onRedo,
  onSave,
  onRename,
  onTestFlow,
  isSaving,
}: EditorToolbarProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Selecionar bloco */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenBlocks}
                className="rounded-full size-9 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Selecionar bloco de ação</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Template de bots */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenIdeas}
                className="rounded-full size-9 shadow-sm"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Template de bots</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Desfazer */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="rounded-full size-9 shadow-sm"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Refazer */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="rounded-full size-9 shadow-sm"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refazer (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Salvar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onSave}
                disabled={isSaving}
                className="rounded-full size-9 shadow-sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Salvar (Ctrl+S)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Testar fluxo */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                onClick={onTestFlow}
                className="rounded-full size-9 shadow-sm bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Testar Fluxo</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Indicador de estado */}
        <div
          className={`
            ml-2 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5
            ${
              isDirty
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }
          `}
        >
          {isDirty ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              Alterações não salvas
            </>
          ) : (
            <>
              <span className="text-emerald-600">✓</span>
              Todas as alterações salvas
            </>
          )}
        </div>

        {/* Nome do fluxo */}
        <button
          onClick={onRename}
          className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
        >
          <span className="text-sm font-medium text-slate-900">{flowName}</span>
          <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

