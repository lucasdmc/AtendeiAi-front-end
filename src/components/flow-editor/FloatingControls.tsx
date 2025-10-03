// Controles flutuantes de zoom e workspace
import { RotateCcw, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface FloatingControlsProps {
  showGrid: boolean;
  snapToGrid: boolean;
  showAlignmentGuides: boolean;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleAlignmentGuides: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onClearCanvas: () => void;
}

export function FloatingControls({
  showGrid,
  snapToGrid,
  showAlignmentGuides,
  onResetView,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onToggleSnap,
  onToggleAlignmentGuides,
  onExportJSON,
  onImportJSON,
  onClearCanvas,
}: FloatingControlsProps) {
  return (
    <>
      {/* Zoom controls - Centro inferior */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 p-1 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onResetView}
                className="rounded-full size-9 hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Resetar visualização</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                className="rounded-full size-9 hover:bg-slate-100"
              >
                <ZoomOut className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Menos zoom (Ctrl + Scroll)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomIn}
                className="rounded-full size-9 hover:bg-slate-100"
              >
                <ZoomIn className="w-4 h-4 text-slate-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mais zoom (Ctrl + Scroll)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Workspace settings - Canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-40">
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-11 shadow-lg bg-white hover:bg-slate-50"
                  >
                    <Grid3x3 className="w-5 h-5 text-slate-600" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Área de trabalho</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent className="w-64" align="end" side="top">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-900">Área de trabalho</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid" className="text-sm cursor-pointer">
                    Mostrar grade
                  </Label>
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={onToggleGrid}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-to-grid" className="text-sm cursor-pointer">
                    Magnetismo
                  </Label>
                  <Switch
                    id="snap-to-grid"
                    checked={snapToGrid}
                    onCheckedChange={onToggleSnap}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="alignment-guides" className="text-sm cursor-pointer">
                    Guias de alinhamento
                  </Label>
                  <Switch
                    id="alignment-guides"
                    checked={showAlignmentGuides}
                    onCheckedChange={onToggleAlignmentGuides}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={onExportJSON}
                >
                  Exportar JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={onImportJSON}
                >
                  Importar JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700"
                  onClick={onClearCanvas}
                >
                  Limpar canvas
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

