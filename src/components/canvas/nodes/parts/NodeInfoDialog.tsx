// Modal de informações do nó
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NodeInfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function NodeInfoDialog({
  open,
  onClose,
  title,
  description,
}: NodeInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">ℹ️</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 text-sm text-neutral-600 leading-relaxed">
          {description.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

