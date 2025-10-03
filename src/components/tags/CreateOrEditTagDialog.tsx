import { useState, useEffect } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { ColorSwatches, TAG_COLORS } from '@/components/ui/color-swatches';
import { TagPill } from '@/components/ui/tag-pill';
import { Tag } from '@/services/tagService';

interface CreateOrEditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  tag?: Tag | null;
  onSubmit: (data: { name: string; description?: string; emoji?: string; color: string }) => void;
}

export function CreateOrEditTagDialog({
  open,
  onOpenChange,
  mode,
  tag,
  onSubmit,
}: CreateOrEditTagDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState<string>('');
  const [color, setColor] = useState(TAG_COLORS[0].value);

  // Resetar campos quando o modal abrir/fechar ou quando o tag mudar
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && tag) {
        setName(tag.name);
        setDescription(tag.description || '');
        setEmoji(tag.emoji || '');
        setColor(tag.color);
      } else {
        setName('');
        setDescription('');
        setEmoji('');
        setColor(TAG_COLORS[0].value);
      }
    }
  }, [open, mode, tag]);

  const handleSubmit = () => {
    if (!name.trim() || name.length > 30) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      emoji: emoji || undefined,
      color,
    });

    // Resetar após submit
    setName('');
    setDescription('');
    setEmoji('');
    setColor(TAG_COLORS[0].value);
  };

  const isValid = name.trim().length > 0 && name.length <= 30;
  const remainingChars = 30 - name.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Criar etiqueta' : 'Editar etiqueta'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome com emoji prefix */}
          <div>
            <Label htmlFor="tag-name" className="text-sm font-medium text-slate-700">
              Nome <span className="text-slate-400">(Máximo 30 caracteres)</span>
            </Label>
            <div className="mt-1 flex items-center gap-2">
              <EmojiPicker onChange={setEmoji}>
                <button
                  type="button"
                  className="h-11 w-11 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Selecionar emoji"
                >
                  {emoji ? (
                    <span className="text-xl">{emoji}</span>
                  ) : (
                    <TagIcon className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </EmojiPicker>
              <div className="flex-1 relative">
                <Input
                  id="tag-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setName(e.target.value);
                    }
                  }}
                  placeholder="Nome da etiqueta"
                  className="pr-12"
                  maxLength={30}
                />
                {name.length > 0 && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                    remainingChars < 5 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {remainingChars}
                  </span>
                )}
              </div>
            </div>
            {name.length > 0 && name.length > 30 && (
              <p className="text-xs text-red-500 mt-1">
                O nome deve ter no máximo 30 caracteres
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="tag-description" className="text-sm font-medium text-slate-700">
              Descrição <span className="text-slate-400">(opcional)</span>
            </Label>
            <Textarea
              id="tag-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para esta etiqueta"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Paleta de cores */}
          <ColorSwatches value={color} onChange={setColor} />

          {/* Preview */}
          {name && (
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Prévia
              </Label>
              <div className="flex items-center">
                <TagPill name={name} emoji={emoji} color={color} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {mode === 'create' ? 'Criar' : 'Editar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

