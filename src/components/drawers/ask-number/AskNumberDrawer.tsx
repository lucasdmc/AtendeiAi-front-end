/**
 * Drawer de configuração: Perguntar por um número
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AskNumberConfig, NumberFormat, NumberValidationType } from '@/types/askNumber';
import { CompactRichEditor } from '../ask-to-choose/CompactRichEditor';

interface Field {
  key: string;
  type: string;
  label: string;
}

interface AskNumberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AskNumberConfig;
  onChange: (cfg: AskNumberConfig) => void;
  availableFields?: Field[];
  onCreateField?: (field: { key: string; type: string }) => void;
}

const FORMAT_LABELS: Record<NumberFormat, string> = {
  auto: 'Auto',
  decimals: 'Decimais',
  whole: 'Números inteiros',
};

const VALIDATION_LABELS: Record<NumberValidationType, string> = {
  none: 'Nenhuma',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  crm: 'CRM',
  telefone: 'Telefone',
  cep: 'CEP',
  'cartao-credito': 'Cartão de crédito',
  regex: 'Regex customizado',
};

export function AskNumberDrawer({
  open,
  onOpenChange,
  value,
  onChange,
  availableFields = [],
  onCreateField,
}: AskNumberDrawerProps) {
  const [localValue, setLocalValue] = useState<AskNumberConfig>(value);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('Number');
  const [newFieldError, setNewFieldError] = useState('');

  // Sincronizar com valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-save quando localValue muda
  useEffect(() => {
    if (open) {
      onChange(localValue);
    }
  }, [localValue, open, onChange]);

  // Salvar ao fechar
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      onChange(localValue);
      onOpenChange(false);
    }
  };

  // Criar novo campo
  const handleCreateField = () => {
    const slugRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!newFieldKey || !slugRegex.test(newFieldKey)) {
      setNewFieldError('Nome inválido. Use apenas letras, números e underscore. Deve começar com letra ou underscore.');
      return;
    }

    const exists = availableFields.some((f) => f.key === newFieldKey);
    if (exists) {
      setNewFieldError('Já existe um campo com este nome.');
      return;
    }

    if (onCreateField) {
      onCreateField({ key: newFieldKey, type: newFieldType });
    }

    setLocalValue({
      ...localValue,
      targetField: { key: newFieldKey, type: newFieldType },
    });

    setShowNewField(false);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('Number');
    setNewFieldError('');
    setFieldOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            Perguntar por um número
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Mensagem */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Mensagem
              </Label>
              <CompactRichEditor
                value={localValue.headerRichText || ''}
                onChange={(val) => setLocalValue({ ...localValue, headerRichText: val })}
                placeholder="Escreva a pergunta para o contato…"
                minHeight="100px"
              />
            </div>

            <Separator />

            {/* Salvar resposta em um campo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Salvar resposta em um campo
                </Label>

                <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={fieldOpen}
                      className="w-[280px] justify-between"
                    >
                      {localValue.targetField.key
                        ? availableFields.find((f) => f.key === localValue.targetField.key)?.label || localValue.targetField.key
                        : 'Selecione um campo...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Buscar campo..." />
                      <CommandList>
                        <CommandEmpty>Nenhum campo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {availableFields.map((field) => (
                            <CommandItem
                              key={field.key}
                              value={field.key}
                              onSelect={() => {
                                setLocalValue({
                                  ...localValue,
                                  targetField: { key: field.key, type: field.type },
                                });
                                setFieldOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  localValue.targetField.key === field.key ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{field.label}</div>
                                <div className="text-xs text-neutral-500">{field.key} • {field.type}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>

                      {/* Botão para criar novo campo */}
                      <div className="border-t p-2">
                        {!showNewField ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-blue-600"
                            onClick={() => setShowNewField(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Criar novo campo
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="nome_do_campo"
                                value={newFieldKey}
                                onChange={(e) => {
                                  setNewFieldKey(e.target.value);
                                  setNewFieldError('');
                                }}
                                className="h-8 text-sm"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setShowNewField(false);
                                  setNewFieldKey('');
                                  setNewFieldLabel('');
                                  setNewFieldError('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Label (opcional)"
                              value={newFieldLabel}
                              onChange={(e) => setNewFieldLabel(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Select value={newFieldType} onValueChange={setNewFieldType}>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Number">Number</SelectItem>
                                <SelectItem value="Text">Text</SelectItem>
                              </SelectContent>
                            </Select>
                            {newFieldError && (
                              <p className="text-xs text-red-600">{newFieldError}</p>
                            )}
                            <Button
                              size="sm"
                              className="w-full h-8"
                              onClick={handleCreateField}
                            >
                              Criar campo
                            </Button>
                          </div>
                        )}
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {!localValue.targetField.key && (
                <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1.5">
                  ⚠️ Selecione um campo para salvar a resposta do contato.
                </p>
              )}
            </div>

            <Separator />

            {/* Format */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Formato
                </Label>
                <Select
                  value={localValue.format}
                  onValueChange={(val) =>
                    setLocalValue({ ...localValue, format: val as NumberFormat })
                  }
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prefix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Adicionar prefixo
                </Label>
                <Input
                  placeholder="Ex: $, %"
                  value={localValue.prefix || ''}
                  onChange={(e) =>
                    setLocalValue({ ...localValue, prefix: e.target.value })
                  }
                  className="w-[280px]"
                />
              </div>
            </div>

            {/* Min/Max values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">
                  Valor mínimo
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localValue.minValue ?? ''}
                  onChange={(e) =>
                    setLocalValue({
                      ...localValue,
                      minValue: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">
                  Valor máximo
                </Label>
                <Input
                  type="number"
                  placeholder="99999"
                  value={localValue.maxValue ?? ''}
                  onChange={(e) =>
                    setLocalValue({
                      ...localValue,
                      maxValue: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Validação */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Validação
                </Label>
                <Select
                  value={localValue.validation?.type || 'none'}
                  onValueChange={(val) => {
                    const type = val as NumberValidationType;
                    setLocalValue({
                      ...localValue,
                      validation: type === 'none' ? undefined : { type, customRegex: '' },
                    });
                  }}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VALIDATION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {localValue.validation?.type === 'regex' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700">
                    Expressão regular
                  </Label>
                  <Input
                    placeholder="Ex: ^\d{3}-\d{2}-\d{4}$"
                    value={localValue.validation?.customRegex || ''}
                    onChange={(e) =>
                      setLocalValue({
                        ...localValue,
                        validation: { type: 'regex', customRegex: e.target.value },
                      })
                    }
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500">
                    Digite uma expressão regular válida para validar a resposta.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Fluxos opcionais */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-neutral-700">
                Fluxos opcionais
              </Label>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="invalid-flow"
                  checked={localValue.invalidFlowEnabled}
                  onCheckedChange={(checked) =>
                    setLocalValue({ ...localValue, invalidFlowEnabled: !!checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="invalid-flow"
                    className="text-sm text-neutral-900 cursor-pointer"
                  >
                    Ativar fluxo para resposta inválida
                  </Label>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Após 3 tentativas inválidas, seguir por este fluxo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="timeout-flow"
                  checked={localValue.noResponseEnabled}
                  onCheckedChange={(checked) =>
                    setLocalValue({ ...localValue, noResponseEnabled: !!checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="timeout-flow"
                    className="text-sm text-neutral-900 cursor-pointer"
                  >
                    Ativar fluxo se o contato não responder
                  </Label>

                  {localValue.noResponseEnabled && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        value={localValue.noResponseDelayValue ?? ''}
                        onChange={(e) =>
                          setLocalValue({
                            ...localValue,
                            noResponseDelayValue: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-20"
                      />
                      <Select
                        value={localValue.noResponseDelayUnit || 'minutes'}
                        onValueChange={(val) =>
                          setLocalValue({
                            ...localValue,
                            noResponseDelayUnit: val as 'minutes' | 'hours',
                          })
                        }
                      >
                        <SelectTrigger className="w-28">
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
