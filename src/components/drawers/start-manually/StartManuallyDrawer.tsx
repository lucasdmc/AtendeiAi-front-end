// Drawer de configuração "Iniciar manualmente"
import { useState, useEffect } from 'react';
import { X, HelpCircle, Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export type ManualStartVariable = {
  id: string;
  type: 'text' | 'number' | 'time' | 'date';
  name: string;
  example?: string;
};

export type StartManuallyValue = {
  title: string;
  unlisted: boolean;
  variables: ManualStartVariable[];
};

interface StartManuallyDrawerProps {
  open: boolean;
  onClose: () => void;
  value: StartManuallyValue;
  onChange: (value: StartManuallyValue) => void;
}

export function StartManuallyDrawer({
  open,
  onClose,
  value,
  onChange,
}: StartManuallyDrawerProps) {
  const [localValue, setLocalValue] = useState<StartManuallyValue>(value);

  // Sincronizar com prop externa
  useEffect(() => {
    if (open) {
      setLocalValue(value);
    }
  }, [open, value]);

  const handleConfirm = () => {
    // Validação básica
    if (!localValue.title.trim()) {
      return;
    }

    // Validar variáveis
    const hasInvalidVariable = localValue.variables.some(
      (v) => !v.name.trim()
    );
    if (hasInvalidVariable) {
      return;
    }

    onChange(localValue);
    onClose();
  };

  const addVariable = () => {
    const newVariable: ManualStartVariable = {
      id: `var-${Date.now()}`,
      type: 'text',
      name: '',
      example: '',
    };
    setLocalValue({
      ...localValue,
      variables: [...localValue.variables, newVariable],
    });
  };

  const removeVariable = (id: string) => {
    setLocalValue({
      ...localValue,
      variables: localValue.variables.filter((v) => v.id !== id),
    });
  };

  const updateVariable = (
    id: string,
    field: keyof ManualStartVariable,
    newValue: string
  ) => {
    setLocalValue({
      ...localValue,
      variables: localValue.variables.map((v) =>
        v.id === id ? { ...v, [field]: newValue } : v
      ),
    });
  };

  const isValid =
    localValue.title.trim() &&
    localValue.variables.every((v) => v.name.trim());

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[520px] p-0 flex flex-col"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-neutral-900">
              Iniciar manualmente
            </SheetTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-neutral-700">
                Título <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  value={localValue.title}
                  onChange={(e) =>
                    setLocalValue({ ...localValue, title: e.target.value })
                  }
                  placeholder="Digite o título"
                  className={cn(
                    "h-10 rounded-2xl pr-10 transition-colors",
                    localValue.title.trim()
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : "border-neutral-200"
                  )}
                  aria-required="true"
                />
                {localValue.title.trim() && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Não listado */}
            <div className="flex items-center gap-3">
              <Switch
                id="unlisted"
                checked={localValue.unlisted}
                onCheckedChange={(checked) =>
                  setLocalValue({ ...localValue, unlisted: checked })
                }
              />
              <Label
                htmlFor="unlisted"
                className="text-[14px] font-semibold text-neutral-900 cursor-pointer"
              >
                Não listado
              </Label>
            </div>

            {/* Variáveis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-neutral-900">
                  Variáveis
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0.5 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-neutral-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <p className="text-xs">
                        É possível adicionar variáveis personalizadas que podem ser
                        utilizadas ao longo da interação com o bot. Esses valores são
                        escolhidos no momento da execução manual deste chatbot.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Lista de variáveis */}
              <div className="space-y-4">
                {localValue.variables.map((variable, index) => (
                  <div
                    key={variable.id}
                    className="p-4 border border-neutral-200 rounded-xl space-y-3 bg-neutral-50"
                  >
                    {/* Tipo e Nome */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tipo */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`var-type-${variable.id}`}
                          className="text-xs text-neutral-700"
                        >
                          Tipo <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={variable.type}
                          onValueChange={(value) =>
                            updateVariable(
                              variable.id,
                              'type',
                              value as ManualStartVariable['type']
                            )
                          }
                        >
                          <SelectTrigger
                            id={`var-type-${variable.id}`}
                            className="h-9 rounded-2xl border-neutral-200 bg-white"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="time">Tempo</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Nome */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`var-name-${variable.id}`}
                            className="text-xs text-neutral-700"
                          >
                            Nome <span className="text-red-500">*</span>
                          </Label>
                          <button
                            type="button"
                            onClick={() => removeVariable(variable.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            aria-label={`Excluir variável ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            id={`var-name-${variable.id}`}
                            value={variable.name}
                            onChange={(e) =>
                              updateVariable(variable.id, 'name', e.target.value)
                            }
                            placeholder="Digite o nome"
                            className={cn(
                              "h-9 rounded-2xl bg-white pr-9 transition-colors",
                              variable.name.trim()
                                ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                                : "border-neutral-200"
                            )}
                            aria-required="true"
                          />
                          {variable.name.trim() && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Exemplo */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`var-example-${variable.id}`}
                        className="text-xs text-neutral-700"
                      >
                        Exemplo
                      </Label>
                      <div className="relative">
                        <Input
                          id={`var-example-${variable.id}`}
                          value={variable.example || ''}
                          onChange={(e) =>
                            updateVariable(variable.id, 'example', e.target.value)
                          }
                          placeholder="Digite um exemplo"
                          className={cn(
                            "h-9 rounded-2xl bg-white pr-9 transition-colors",
                            variable.example && variable.example.trim()
                              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                              : "border-neutral-200"
                          )}
                        />
                        {variable.example && variable.example.trim() && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar variável */}
              <button
                type="button"
                onClick={addVariable}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Variável
              </button>
            </div>
          </div>
        </ScrollArea>

        {/* Footer: Confirmar */}
        <div className="px-6 py-4 border-t border-neutral-200">
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full h-11 rounded-full bg-[#517CF6] hover:bg-[#4169E8] text-white font-medium disabled:opacity-60"
          >
            Confirmar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

