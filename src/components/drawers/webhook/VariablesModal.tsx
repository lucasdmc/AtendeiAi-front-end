/**
 * Modal de seleção de variáveis para o Webhook
 */

import { useState } from 'react';
import { Search, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Variáveis mockadas (mesmas do contexto/contato)
const MOCK_VARIABLES = [
  '{{Contexto.DataAtualUTC}}',
  '{{Conversa.Id}}',
  '{{Conversa.DataDeCriacaoUTC}}',
  '{{Atendente.PrimeiroNome}}',
  '{{Atendente.NomeCompleto}}',
  '{{Atendente.Email}}',
  '{{Contato.Id}}',
  '{{Contato.PrimeiroNome}}',
  '{{Contato.NomeCompleto}}',
  '{{Contato.Numero}}',
  '{{Contato.Email}}',
  '{{Contato.Rua}}',
  '{{Contato.Complemento}}',
  '{{Contato.Cidade}}',
  '{{Contato.Estado}}',
  '{{Contato.CEP}}',
  '{{Contato.Pais}}',
];

interface VariablesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectVariable: (variable: string) => void;
}

export function VariablesModal({
  open,
  onClose,
  onSelectVariable,
}: VariablesModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVariables = MOCK_VARIABLES.filter((v) =>
    v.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast({
      title: 'Copiado!',
      description: `A variável ${variable} foi copiada para a área de transferência.`,
    });
  };

  const handleSelectVariable = (variable: string) => {
    onSelectVariable(variable);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Variáveis</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Pesquisar variável"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Lista de variáveis */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="p-2 space-y-1">
            {filteredVariables.map((variable, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded hover:bg-neutral-50 cursor-pointer group"
                onClick={() => handleSelectVariable(variable)}
              >
                <span className="text-sm font-mono text-pink-600">
                  {variable}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyVariable(variable);
                  }}
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                </Button>
              </div>
            ))}

            {filteredVariables.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-sm">
                Nenhuma variável encontrada
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

