/**
 * Drawer de configuração: Perguntar por uma data
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
import { AskDateConfig, DateFormat } from '@/types/askDate';
import { CompactRichEditor } from '../ask-to-choose/CompactRichEditor';
import { getDateFormatExample } from '@/lib/dateValidators';

interface AskDateDrawerProps {
  open: boolean;
  onClose: () => void;
  value: AskDateConfig;
  onChange: (value: AskDateConfig) => void;
}

// Mock de campos disponíveis
const MOCK_FIELDS = [
  { key: 'data_nascimento', label: 'Data de Nascimento', type: 'Date' },
  { key: 'data_agendamento', label: 'Data de Agendamento', type: 'Date' },
  { key: 'data_vencimento', label: 'Data de Vencimento', type: 'Date' },
];

const DATE_FORMATS: DateFormat[] = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
  'DD-MM-YYYY',
  'MM-DD-YYYY',
  'YYYY-MM-DD',
];

export function AskDateDrawer({
  open,
  onClose,
  value,
  onChange,
}: AskDateDrawerProps) {
  const [localValue, setLocalValue] = useState<AskDateConfig>(value);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
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
    const slugRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!newFieldKey || !slugRegex.test(newFieldKey)) {
      setNewFieldError('Nome inválido. Use apenas letras, números e underscore. Deve começar com letra ou underscore.');
      return;
    }

    const exists = MOCK_FIELDS.some((f) => f.key === newFieldKey);
    if (exists) {
      setNewFieldError('Já existe um campo com este nome.');
      return;
    }

    const newField = {
      key: newFieldKey,
      label: newFieldLabel || newFieldKey,
      type: 'Date',
    };
    MOCK_FIELDS.push(newField);

    setLocalValue({
      ...localValue,
      targetField: { key: newField.key, type: newField.type },
    });

    setShowNewField(false);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldError('');
    setFieldOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            Perguntar por uma data
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

            {/* Formato da data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-neutral-700">
                  Formato da data
                </Label>
                <Select
                  value={localValue.dateFormat}
                  onValueChange={(val) =>
                    setLocalValue({ ...localValue, dateFormat: val as DateFormat })
                  }
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format} (Ex: {getDateFormatExample(format)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-neutral-500">
                O usuário deve digitar a data neste formato. O WhatsApp não exibe um seletor de calendário.
              </p>
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
                placeholder="Mensagem enviada quando a data for inválida… (ex: Por favor, digite uma data válida no formato DD/MM/YYYY.)"
                minHeight="80px"
              />
              <p className="text-xs text-neutral-500">
                Esta mensagem será enviada até 3 vezes quando o contato fornecer uma data inválida.
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

