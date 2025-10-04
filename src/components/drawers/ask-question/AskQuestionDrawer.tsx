// Drawer de configuração do nó "Fazer uma pergunta"
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

export type ValidationKind = 'none' | 'regex' | 'text_length';
export type FieldType = 'Text' | 'Number' | 'Email' | 'Phone' | 'Date' | 'File' | 'Address';

export interface AskQuestionConfig {
  headerRichText: string;
  targetField: { key: string; type: FieldType };
  validation: {
    kind: ValidationKind;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  invalidFlowEnabled: boolean;
  noResponseEnabled: boolean;
  noResponseDelayValue?: number;
  noResponseDelayUnit?: 'minutes' | 'hours';
}

interface AskQuestionDrawerProps {
  open: boolean;
  onClose: () => void;
  value: AskQuestionConfig;
  onChange: (value: AskQuestionConfig) => void;
}

// Mock de campos disponíveis
const MOCK_FIELDS = [
  { key: 'name', label: 'Nome', type: 'Text' },
  { key: 'email', label: 'E-mail', type: 'Email' },
  { key: 'phone', label: 'Telefone', type: 'Phone' },
  { key: 'company', label: 'Empresa', type: 'Text' },
  { key: 'notes', label: 'Observações', type: 'Text' },
];

export function AskQuestionDrawer({
  open,
  onClose,
  value,
  onChange,
}: AskQuestionDrawerProps) {
  const [localValue, setLocalValue] = useState<AskQuestionConfig>(value);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('Text');
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
    setNewFieldType('Text');
    setNewFieldError('');
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            Fazer uma pergunta
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
                      placeholder="ex: idade, cidade"
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
                      placeholder="ex: Idade do cliente"
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
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
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

            {/* Validação */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Validação (opcional)
                </Label>

                <Select
                  value={localValue.validation.kind}
                  onValueChange={(val: ValidationKind) =>
                    setLocalValue({
                      ...localValue,
                      validation: { kind: val },
                    })
                  }
                >
                  <SelectTrigger className="h-9 w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="regex">Regex (expressão regular)</SelectItem>
                    <SelectItem value="text_length">Tamanho do texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos condicionais por tipo de validação */}
              {localValue.validation.kind === 'regex' && (
                <div className="space-y-2">
                  <Label htmlFor="regex-pattern" className="text-xs">
                    Padrão (regex)
                  </Label>
                  <Input
                    id="regex-pattern"
                    value={localValue.validation.pattern || ''}
                    onChange={(e) =>
                      setLocalValue({
                        ...localValue,
                        validation: { ...localValue.validation, pattern: e.target.value },
                      })
                    }
                    placeholder="ex: ^[0-9]{5}$"
                    className="h-9 font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500">
                    Use expressões regulares JavaScript. Ex: <code className="bg-neutral-100 px-1 rounded">^[A-Z][a-z]+$</code> valida nomes iniciando com maiúscula.
                  </p>
                </div>
              )}

              {localValue.validation.kind === 'text_length' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min-length" className="text-xs">
                      Mínimo de caracteres
                    </Label>
                    <Input
                      id="min-length"
                      type="number"
                      min={1}
                      max={2000}
                      value={localValue.validation.minLength || ''}
                      onChange={(e) =>
                        setLocalValue({
                          ...localValue,
                          validation: {
                            ...localValue.validation,
                            minLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      placeholder="ex: 3"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-length" className="text-xs">
                      Máximo de caracteres
                    </Label>
                    <Input
                      id="max-length"
                      type="number"
                      min={1}
                      max={2000}
                      value={localValue.validation.maxLength || ''}
                      onChange={(e) =>
                        setLocalValue({
                          ...localValue,
                          validation: {
                            ...localValue.validation,
                            maxLength: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      placeholder="ex: 100"
                      className="h-9"
                    />
                  </div>
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
                      Ativar fluxo para resposta inválida
                    </Label>
                    {localValue.invalidFlowEnabled && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Após 3 tentativas inválidas, seguir por este fluxo.
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

