// Modal para renomear fluxo
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameDialogProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function RenameDialog({ open, currentName, onClose, onSave }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(currentName);
    setError('');
  }, [currentName, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    onSave(name.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar nome do chatbot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Digite o nome do fluxo"
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

