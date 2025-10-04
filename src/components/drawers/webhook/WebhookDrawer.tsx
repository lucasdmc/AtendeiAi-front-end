/**
 * Drawer de configuração do Webhook
 */

import { useEffect, useState, useCallback } from 'react';
import { X, Trash2, HelpCircle, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  WebhookConfig,
  UrlParameter,
  HeaderParameter,
  ReturnMapping,
  HttpMethod,
  HTTP_METHOD_OPTIONS,
  SaveFieldTarget,
  SAVE_FIELD_TARGET_LABELS,
} from '@/types/webhookNode';
import { VariablesModal } from './VariablesModal';

interface WebhookDrawerProps {
  open: boolean;
  onClose: () => void;
  initialValue: WebhookConfig;
  onChange: (value: WebhookConfig) => void;
}

export function WebhookDrawer({
  open,
  onClose,
  initialValue,
  onChange,
}: WebhookDrawerProps) {
  const { toast } = useToast();
  const [localValue, setLocalValue] = useState<WebhookConfig>(initialValue);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [activeVariableField, setActiveVariableField] = useState<string | null>(null);

  // Sincronizar com o valor inicial quando o drawer abre
  useEffect(() => {
    if (open) {
      setLocalValue(initialValue);
    }
  }, [open, initialValue]);

  // Parse URL parameters from endpoint
  const parseUrlParameters = useCallback((url: string): UrlParameter[] => {
    try {
      const urlObj = new URL(url);
      const params: UrlParameter[] = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({
          id: `${key}-${Date.now()}-${Math.random()}`,
          key,
          value,
        });
      });
      return params;
    } catch {
      return [];
    }
  }, []);

  // Update URL with parameters
  const buildUrlWithParameters = useCallback(
    (baseUrl: string, params: UrlParameter[]): string => {
      try {
        const url = new URL(baseUrl);
        url.search = '';
        params.forEach((param) => {
          if (param.key && param.value) {
            url.searchParams.append(param.key, param.value);
          }
        });
        return url.toString();
      } catch {
        return baseUrl;
      }
    },
    []
  );

  // Handler para mudanças no endpoint
  const handleEndpointChange = useCallback(
    (newEndpoint: string) => {
      // Parse parameters from URL
      const parsedParams = parseUrlParameters(newEndpoint);
      
      setLocalValue((prev) => ({
        ...prev,
        endpoint: newEndpoint,
        urlParameters: parsedParams.length > 0 ? parsedParams : prev.urlParameters,
      }));
    },
    [parseUrlParameters]
  );

  // Handler para adicionar parâmetro de URL
  const handleAddUrlParameter = useCallback(() => {
    if (!localValue.endpoint?.trim()) {
      toast({
        title: 'Atenção',
        description: 'Informe o endpoint antes de adicionar parâmetros.',
        variant: 'default',
      });
      return;
    }

    const newParam: UrlParameter = {
      id: `param-${Date.now()}`,
      key: '',
      value: '',
    };

    setLocalValue((prev) => ({
      ...prev,
      urlParameters: [...prev.urlParameters, newParam],
    }));
  }, [localValue.endpoint]);

  // Handler para atualizar parâmetro de URL
  const handleUpdateUrlParameter = useCallback(
    (paramId: string, field: 'key' | 'value', newValue: string) => {
      setLocalValue((prev) => {
        const updated = prev.urlParameters.map((p) =>
          p.id === paramId ? { ...p, [field]: newValue } : p
        );

        // Reconstruir URL com os novos parâmetros
        const baseUrl = prev.endpoint.split('?')[0];
        const newEndpoint = buildUrlWithParameters(baseUrl, updated);

        return {
          ...prev,
          urlParameters: updated,
          endpoint: newEndpoint,
        };
      });
    },
    [buildUrlWithParameters]
  );

  // Handler para remover parâmetro de URL
  const handleRemoveUrlParameter = useCallback((paramId: string) => {
    setLocalValue((prev) => {
      const updated = prev.urlParameters.filter((p) => p.id !== paramId);
      
      // Reconstruir URL sem o parâmetro removido
      const baseUrl = prev.endpoint.split('?')[0];
      const newEndpoint = buildUrlWithParameters(baseUrl, updated);

      return {
        ...prev,
        urlParameters: updated,
        endpoint: newEndpoint,
      };
    });
  }, [buildUrlWithParameters]);

  // Handlers para Headers
  const handleAddHeader = useCallback(() => {
    const newHeader: HeaderParameter = {
      id: `header-${Date.now()}`,
      key: '',
      value: '',
    };

    setLocalValue((prev) => ({
      ...prev,
      headers: [...prev.headers, newHeader],
    }));
  }, []);

  const handleUpdateHeader = useCallback(
    (headerId: string, field: 'key' | 'value', newValue: string) => {
      setLocalValue((prev) => ({
        ...prev,
        headers: prev.headers.map((h) =>
          h.id === headerId ? { ...h, [field]: newValue } : h
        ),
      }));
    },
    []
  );

  const handleRemoveHeader = useCallback((headerId: string) => {
    setLocalValue((prev) => ({
      ...prev,
      headers: prev.headers.filter((h) => h.id !== headerId),
    }));
  }, []);

  // Handlers para Return Mappings
  const handleAddReturnMapping = useCallback(() => {
    const newMapping: ReturnMapping = {
      id: `return-${Date.now()}`,
      path: '',
      saveIn: 'context',
      fieldKey: '',
    };

    setLocalValue((prev) => ({
      ...prev,
      returnMappings: [...prev.returnMappings, newMapping],
    }));
  }, []);

  const handleUpdateReturnMapping = useCallback(
    (
      mappingId: string,
      field: 'path' | 'saveIn' | 'fieldKey',
      newValue: string | SaveFieldTarget
    ) => {
      setLocalValue((prev) => ({
        ...prev,
        returnMappings: prev.returnMappings.map((m) =>
          m.id === mappingId ? { ...m, [field]: newValue } : m
        ),
      }));
    },
    []
  );

  const handleRemoveReturnMapping = useCallback((mappingId: string) => {
    setLocalValue((prev) => ({
      ...prev,
      returnMappings: prev.returnMappings.filter((m) => m.id !== mappingId),
    }));
  }, []);

  // Handler para abrir modal de variáveis
  const handleOpenVariables = useCallback((fieldName: string) => {
    setActiveVariableField(fieldName);
    setShowVariablesModal(true);
  }, []);

  // Handler para inserir variável
  const handleInsertVariable = useCallback(
    (variable: string) => {
      // Implementar lógica para inserir variável no campo ativo
      console.log('Insert variable:', variable, 'into field:', activeVariableField);
      setShowVariablesModal(false);
    },
    [activeVariableField]
  );

  // Handler para confirmar
  const handleConfirm = useCallback(() => {
    // Validação
    if (!localValue.endpoint?.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O campo Endpoint é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    onChange(localValue);
    onClose();
  }, [localValue, onChange, onClose]);

  // Handler para fechar (auto-save)
  const handleClose = useCallback(() => {
    onChange(localValue);
    onClose();
  }, [localValue, onChange, onClose]);

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[540px] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-lg font-semibold">
              Chamar webhook
            </SheetTitle>
          </SheetHeader>

          {/* Body */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Endpoint */}
              <div className="space-y-2">
                <Label htmlFor="endpoint" className="text-sm font-medium text-neutral-700">
                  Endpoint <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endpoint"
                  type="url"
                  value={localValue.endpoint}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  placeholder="https://example.com/umbler_talk_bot_callback?auth=123abc"
                  className={cn(
                    'h-10',
                    !localValue.endpoint?.trim() && 'border-red-300'
                  )}
                />
                {!localValue.endpoint?.trim() && (
                  <p className="text-xs text-red-600">O campo Endpoint é obrigatório.</p>
                )}
              </div>

              {/* Método HTTP */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Método HTTP</Label>
                <Select
                  value={localValue.method}
                  onValueChange={(val) =>
                    setLocalValue({ ...localValue, method: val as HttpMethod })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHOD_OPTIONS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Parâmetros da URL */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-700">
                  Parâmetros da url
                </Label>

                {localValue.urlParameters.length > 0 && (
                  <div className="space-y-2">
                    {localValue.urlParameters.map((param) => (
                      <div key={param.id} className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-neutral-600">
                            Chave <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={param.key}
                            onChange={(e) =>
                              handleUpdateUrlParameter(param.id, 'key', e.target.value)
                            }
                            placeholder="opa"
                            className="h-9"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-neutral-600">
                            Valor <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={param.value}
                            onChange={(e) =>
                              handleUpdateUrlParameter(param.id, 'value', e.target.value)
                            }
                            placeholder="1324"
                            className="h-9"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-5 h-9 w-9"
                          onClick={() => handleRemoveUrlParameter(param.id)}
                        >
                          <Trash2 className="w-4 h-4 text-neutral-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  onClick={handleAddUrlParameter}
                  disabled={!localValue.endpoint?.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Parâmetro
                </Button>

                {!localValue.endpoint?.trim() && localValue.urlParameters.length === 0 && (
                  <p className="text-xs text-neutral-500">
                    Informe o endpoint antes de adicionar parâmetros.
                  </p>
                )}
              </div>

              <Separator />

              {/* Cabeçalho */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-700">Cabeçalho</Label>

                {localValue.headers.length > 0 && (
                  <div className="space-y-2">
                    {localValue.headers.map((header) => (
                      <div key={header.id} className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-neutral-600">
                            Chave <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={header.key}
                            onChange={(e) =>
                              handleUpdateHeader(header.id, 'key', e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-neutral-600">
                            Valor <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={header.value}
                            onChange={(e) =>
                              handleUpdateHeader(header.id, 'value', e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-5 h-9 w-9"
                          onClick={() => handleRemoveHeader(header.id)}
                        >
                          <Trash2 className="w-4 h-4 text-neutral-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  onClick={handleAddHeader}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Cabeçalho
                </Button>
              </div>

              <Separator />

              {/* Conteúdo (Body) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-neutral-700">Conteúdo</Label>
                  <button
                    className="text-neutral-500 hover:text-neutral-700"
                    onClick={()=> handleOpenVariables('body')}
                  >
                    {`{ }`}
                  </button>
                </div>
                <Textarea
                  value={localValue.body}
                  onChange={(e) =>
                    setLocalValue({ ...localValue, body: e.target.value })
                  }
                  placeholder={`Exemplo:\n{\n  "NomeCompleto": "{{Contato.NomeCompleto}}",\n  "Email": "{{Contato.Email}}",\n  "Numero": {{Contato.Numero}}\n}`}
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <Separator />

              {/* Retorno */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-neutral-700">Retorno</Label>
                  <button
                    className="text-neutral-500 hover:text-neutral-700"
                    onClick={() => setShowHelpModal(true)}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                {localValue.returnMappings.length > 0 && (
                  <div className="space-y-3">
                    {localValue.returnMappings.map((mapping) => (
                      <div key={mapping.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <Label className="text-xs text-neutral-600">
                            Caminho do valor retornado <span className="text-red-500">*</span>
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mt-1"
                            onClick={() => handleRemoveReturnMapping(mapping.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                          </Button>
                        </div>
                        <Input
                          value={mapping.path}
                          onChange={(e) =>
                            handleUpdateReturnMapping(mapping.id, 'path', e.target.value)
                          }
                          placeholder="Retorno."
                          className="h-9"
                        />
                        <div>
                          <Label className="text-xs text-neutral-600">Salvar no campo</Label>
                          <Select
                            value={mapping.saveIn}
                            onValueChange={(val) =>
                              handleUpdateReturnMapping(
                                mapping.id,
                                'saveIn',
                                val as SaveFieldTarget
                              )
                            }
                          >
                            <SelectTrigger className="h-9 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(SAVE_FIELD_TARGET_LABELS) as SaveFieldTarget[]).map(
                                (target) => (
                                  <SelectItem key={target} value={target}>
                                    {SAVE_FIELD_TARGET_LABELS[target]}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  onClick={handleAddReturnMapping}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Retorno
                </Button>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t">
            <Button
              onClick={handleConfirm}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={!localValue.endpoint?.trim()}
            >
              Confirmar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de ajuda */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Mais detalhes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-neutral-700">
            <p>
              Utilize <code className="bg-neutral-100 px-1 rounded">.{' '}</code> para
              acessar propriedades, e <code className="bg-neutral-100 px-1 rounded">[n]</code>{' '}
              para acessar posições de arrays, onde n é o índice. Exemplos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono">
              <li className="text-red-600">name</li>
              <li className="text-red-600">contact.name</li>
              <li className="text-red-600">contacts[0].name</li>
              <li className="text-red-600">contacts[0].profile.name</li>
              <li className="text-red-600">
                [0].name{' '}
                <span className="text-neutral-600">(se a raiz do JSON retornado for um array ao invés de objeto)</span>
              </li>
            </ul>
            <p>
              Se o caminho resultar em um array ou objeto ao invés de um valor, será salvo a
              representação JSON do array ou objeto.
            </p>
            <p>
              Acessar propriedades ou índices que não existem fará com que o mapeamento seja
              apenas ignorado. Diferenças de caracteres maiúsculos e minúsculos causarão o
              caminho não ser encontrado.
            </p>
          </div>
          <Button onClick={() => setShowHelpModal(false)} className="w-full">
            Ok
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal de variáveis */}
      <VariablesModal
        open={showVariablesModal}
        onClose={() => setShowVariablesModal(false)}
        onSelectVariable={handleInsertVariable}
      />
    </>
  );
}

