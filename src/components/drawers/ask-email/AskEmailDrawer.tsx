// Drawer de configuração do nó "Perguntar por um e-mail"
import { useState, useEffect } from 'react';
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
import { CompactRichEditor } from '../ask-to-choose/CompactRichEditor';

export type FieldType = 'Text' | 'Number' | 'Email' | 'Phone' | 'Date' | 'File' | 'Address';

export interface AskEmailConfig {
  headerRichText: string;
  validationErrorMessage: string;
  targetField: { key: string; type: FieldType };
  invalidFlowEnabled: boolean;
  noResponseEnabled: boolean;
  noResponseDelayValue?: number;
  noResponseDelayUnit?: 'minutes' | 'hours';
}

interface AskEmailDrawerProps {
  open: boolean;
  onClose: () => void;
  value: AskEmailConfig;
  onChange: (value: AskEmailConfig) => void;
}

// Mock de campos disponíveis
const MOCK_FIELDS = [
  { key: 'email', label: 'E-mail', type: 'Email' },
  { key: 'name', label: 'Nome', type: 'Text' },
  { key: 'phone', label: 'Telefone', type: 'Phone' },
  { key: 'company', label: 'Empresa', type: 'Text' },
  { key: 'notes', label: 'Observações', type: 'Text' },
];

export function AskEmailDrawer({
  open,
  onClose,
  value,
  onChange,
}: AskEmailDrawerProps) {
  const [localValue, setLocalValue] = useState<AskEmailConfig>(value);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('Email');
  const [newFieldError, setNewFieldError] = useState('');

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

  // Salvar ao fechar
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      onChange(localValue);
      onClose();
    }
  };

  // Criar novo campo
  const handleCreateField = () => {
    // Validar nome do campo
    const slugRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!newFieldKey || !slugRegex.test(newFieldKey)) {
      setNewFieldError('Nome inválido. Use apenas letras, números e underscore. Deve começar com letra ou underscore.');
      return;
    }

    // Verificar se já existe
    const exists = MOCK_FIELDS.some((f) => f.key === newFieldKey);
    if (exists) {
      setNewFieldError('Já existe um campo com este nome.');
      return;
    }

    // Criar e selecionar
    const newField = {
      key: newFieldKey,
      label: newFieldLabel || newFieldKey,
      type: newFieldType,
    };
    MOCK_FIELDS.push(newField);

    setLocalValue({
      ...localValue,
      targetField: { key: newField.key, type: newField.type },
    });

    // Resetar formulário
    setShowNewField(false);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('Email');
    setNewFieldError('');
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            Perguntar por um e-mail
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Mensagem (pergunta) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Mensagem
              </Label>
              <CompactRichEditor
                value={localValue.headerRichText || ''}
                onChange={(val) => setLocalValue({ ...localValue, headerRichText: val })}
                placeholder="Escreva a pergunta para o contato… (ex: Qual é o seu e-mail?)"
                minHeight="80px"
              />
            </div>

            <Separator />

            {/* Mensagem de erro de validação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-neutral-700">
                  Mensagem de erro de validação
                </Label>
                {!localValue.invalidFlowEnabled && (
                  <span className="text-xs text-orange-600 font-medium">Obrigatório</span>
                )}
              </div>
              <CompactRichEditor
                value={localValue.validationErrorMessage || ''}
                onChange={(val) => setLocalValue({ ...localValue, validationErrorMessage: val })}
                placeholder="Mensagem enviada quando o e-mail for inválido… (ex: Por favor, digite um e-mail válido.)"
                minHeight="80px"
              />
              <p className="text-xs text-neutral-500">
                Esta mensagem será enviada até 3 vezes quando o contato fornecer um e-mail inválido.
                {localValue.invalidFlowEnabled && ' Após 3 tentativas, seguirá para o fluxo alternativo.'}
              </p>
            </div>

            <Separator />

            {/* Salvar resposta em um campo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Salvar resposta em um campo
                </Label>

                {/* Combobox para selecionar campo */}
                <Popover open={fieldOpen} onOpenChange={setFieldOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={fieldOpen}
                      className="w-[280px] justify-between"
                    >
                      {localValue.targetField.key
                        ? MOCK_FIELDS.find((f) => f.key === localValue.targetField.key)?.label || localValue.targetField.key
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
                          {MOCK_FIELDS.map((field) => (
                            <CommandItem
                              key={field.key}
                              value={field.key}
                              onSelect={() => {
                                setLocalValue({
                                  ...localValue,
                                  targetField: { key: field.key, type: field.type as FieldType },
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
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Criar novo campo */}
              {!showNewField ? (
                <button
                  onClick={() => setShowNewField(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar novo campo
                </button>
              ) : (
                <div className="border border-neutral-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Novo campo</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setShowNewField(false);
                        setNewFieldError('');
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-key" className="text-xs">
                      Nome (slug)
                    </Label>
                    <Input
                      id="field-key"
                      value={newFieldKey}
                      onChange={(e) => {
                        setNewFieldKey(e.target.value);
                        setNewFieldError('');
                      }}
                      placeholder="ex: email_alternativo"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-label" className="text-xs">
                      Rótulo (opcional)
                    </Label>
                    <Input
                      id="field-label"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="ex: E-mail alternativo"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-type" className="text-xs">
                      Tipo
                    </Label>
                    <Select
                      value={newFieldType}
                      onValueChange={(val) => setNewFieldType(val as FieldType)}
                    >
                      <SelectTrigger id="field-type" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Phone">Phone</SelectItem>
                        <SelectItem value="Date">Date</SelectItem>
                        <SelectItem value="File">File</SelectItem>
                        <SelectItem value="Address">Address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newFieldError && (
                    <p className="text-xs text-red-600">{newFieldError}</p>
                  )}

                  <Button
                    size="sm"
                    onClick={handleCreateField}
                    className="w-full"
                  >
                    Criar e selecionar
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Fluxos opcionais */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-neutral-700">
                Fluxos opcionais
              </Label>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="flow-invalid"
                    checked={localValue.invalidFlowEnabled}
                    onCheckedChange={(checked) =>
                      setLocalValue({ ...localValue, invalidFlowEnabled: checked as boolean })
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <Label
                      htmlFor="flow-invalid"
                      className="text-sm text-neutral-700 leading-relaxed cursor-pointer"
                    >
                      Ativar fluxo para e-mail inválido
                    </Label>
                    {localValue.invalidFlowEnabled ? (
                      <p className="text-xs text-neutral-500 mt-1">
                        Após 3 tentativas inválidas, seguir por este fluxo alternativo.
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 mt-1">
                        Sem fluxo alternativo, o bot enviará a mensagem de erro até 3 vezes e continuará aguardando.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="flow-timeout"
                      checked={localValue.noResponseEnabled}
                      onCheckedChange={(checked) =>
                        setLocalValue({ ...localValue, noResponseEnabled: checked as boolean })
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

                  {localValue.noResponseEnabled && (
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

