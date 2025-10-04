// Drawer de configuração do nó "Pedir para escolher"
import { useState, useEffect } from 'react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator as SeparatorUI } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import type { AskToChooseValue, OptionItem, Separator } from '@/components/canvas/nodes/AskToChooseNode';
import { CompactRichEditor } from './CompactRichEditor';

// Modifier customizado: restringe movimento apenas ao eixo vertical
const restrictToVerticalAxis = ({ transform }: any) => {
  return {
    ...transform,
    x: 0,
  };
};

interface AskToChooseDrawerProps {
  open: boolean;
  onClose: () => void;
  value: AskToChooseValue;
  onChange: (value: AskToChooseValue) => void;
}

interface OptionItemCardProps {
  option: OptionItem;
  index: number;
  onUpdate: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

function OptionItemCard({ option, index, onUpdate, onDelete, canDelete }: OptionItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-neutral-200 rounded-lg p-3 space-y-2"
    >
      {/* Header com drag handle, número e deletar */}
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Número da opção */}
        <span className="text-sm font-semibold text-neutral-900">
          Opção {index + 1}
        </span>

        {/* Espaço flexível */}
        <div className="flex-1" />

        {/* Botão deletar */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-100"
          onClick={() => onDelete(option.id)}
          disabled={!canDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Editor de texto rico (mais compacto) */}
      <CompactRichEditor
        value={option.labelRichText}
        onChange={(val) => onUpdate(option.id, val)}
        placeholder="Digite o rótulo da opção..."
        minHeight="40px"
      />
    </div>
  );
}

export function AskToChooseDrawer({
  open,
  onClose,
  value,
  onChange,
}: AskToChooseDrawerProps) {
  const [localValue, setLocalValue] = useState<AskToChooseValue>(value);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sincronizar com prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Salvar automaticamente quando localValue mudar
  useEffect(() => {
    if (open) {
      onChange(localValue);
    }
  }, [localValue, open, onChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localValue.options.findIndex((opt) => opt.id === active.id);
      const newIndex = localValue.options.findIndex((opt) => opt.id === over.id);

      setLocalValue({
        ...localValue,
        options: arrayMove(localValue.options, oldIndex, newIndex),
      });
    }
  };

  const addOption = () => {
    const newId = `${Date.now()}`;
    setLocalValue({
      ...localValue,
      options: [
        ...localValue.options,
        { id: newId, labelRichText: `Opção ${localValue.options.length + 1}` },
      ],
    });
  };

  const updateOption = (id: string, label: string) => {
    setLocalValue({
      ...localValue,
      options: localValue.options.map((opt) =>
        opt.id === id ? { ...opt, labelRichText: label } : opt
      ),
    });
  };

  const deleteOption = (id: string) => {
    if (localValue.options.length <= 1) return; // Manter ao menos 1 opção

    setLocalValue({
      ...localValue,
      options: localValue.options.filter((opt) => opt.id !== id),
    });
  };

  // Salvar ao fechar
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      onChange(localValue);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            Pedir para escolher
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Mensagem inicial (Header) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Mensagem inicial (opcional)
              </Label>
              <CompactRichEditor
                value={localValue.headerRichText || ''}
                onChange={(val) => setLocalValue({ ...localValue, headerRichText: val })}
                placeholder="Escreva o enunciado da pergunta (opcional)"
                minHeight="100px"
              />
            </div>

            <SeparatorUI />

            {/* Opções de numeração */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emoji-numbering" className="text-sm font-medium text-neutral-700">
                  Usar emoji na numeração
                </Label>
                <Switch
                  id="emoji-numbering"
                  checked={localValue.useEmojiNumbering}
                  onCheckedChange={(checked) =>
                    setLocalValue({ ...localValue, useEmojiNumbering: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Separador entre número e rótulo
                </Label>
                <Select
                  value={localValue.separator}
                  onValueChange={(val: Separator) =>
                    setLocalValue({ ...localValue, separator: val })
                  }
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="space">Nenhum (espaço)</SelectItem>
                    <SelectItem value="dot">ponto (.)</SelectItem>
                    <SelectItem value="colon">dois pontos (:)</SelectItem>
                    <SelectItem value="dash">traço (-)</SelectItem>
                    <SelectItem value="paren">fecha parêntese ())</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SeparatorUI />

            {/* Lista de opções */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-neutral-700">
                Opções
              </Label>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={localValue.options.map((opt) => opt.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {localValue.options.map((option, index) => (
                      <OptionItemCard
                        key={option.id}
                        option={option}
                        index={index}
                        onUpdate={updateOption}
                        onDelete={deleteOption}
                        canDelete={localValue.options.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex justify-end">
                <button
                  onClick={addOption}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Opção
                </button>
              </div>
            </div>

            <SeparatorUI />

            {/* Mensagem final (Footer) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Mensagem final (opcional)
              </Label>
              <CompactRichEditor
                value={localValue.footerRichText || ''}
                onChange={(val) => setLocalValue({ ...localValue, footerRichText: val })}
                placeholder="Mensagem de encerramento (opcional)"
                minHeight="100px"
              />
            </div>

            <SeparatorUI />

            {/* Fluxos opcionais */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-neutral-700">
                Fluxos opcionais
              </Label>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="flow-invalid"
                  checked={localValue.flowInvalidEnabled}
                  onCheckedChange={(checked) =>
                    setLocalValue({ ...localValue, flowInvalidEnabled: checked as boolean })
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="flow-invalid"
                  className="text-sm text-neutral-700 leading-relaxed cursor-pointer"
                >
                  Ativar fluxo para resposta inválida
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="flow-timeout"
                    checked={localValue.flowNoResponseEnabled}
                    onCheckedChange={(checked) =>
                      setLocalValue({ ...localValue, flowNoResponseEnabled: checked as boolean })
                    }
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="flow-timeout"
                    className="text-sm text-neutral-700 leading-relaxed cursor-pointer"
                  >
                    Ativar fluxo se o contato não responder em
                  </Label>
                </div>

                {localValue.flowNoResponseEnabled && (
                  <div className="ml-6 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      value={localValue.noResponseDelayValue || 15}
                      onChange={(e) =>
                        setLocalValue({
                          ...localValue,
                          noResponseDelayValue: parseInt(e.target.value) || 15,
                        })
                      }
                      className="h-9 w-24"
                    />
                    <Select
                      value={localValue.noResponseDelayUnit || 'minutes'}
                      onValueChange={(val: 'minutes' | 'hours') =>
                        setLocalValue({ ...localValue, noResponseDelayUnit: val })
                      }
                    >
                      <SelectTrigger className="h-9 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

