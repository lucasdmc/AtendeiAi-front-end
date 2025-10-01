import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  MessageSquare,
  Send,
  Repeat,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge'; // Removido pois não está sendo usado
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Checkbox } from '@/components/ui/checkbox'; // Removido pois não está sendo usado
import { 
  useCreateGlobalScheduledMessage,
  useUpdateGlobalScheduledMessage,
  useContacts,
  type GlobalScheduledMessage,
  type CreateScheduledMessageData,
  type UpdateScheduledMessageData
} from '@/hooks/useScheduledMessagesGlobal';

interface ScheduledMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  message?: GlobalScheduledMessage | null;
}

interface RecipientData {
  id?: string;
  name?: string;
  phone: string;
}

interface RecurrenceData {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
  interval?: number;
  unit?: 'days' | 'weeks' | 'months' | 'years';
  daysOfWeek?: string[];
  end?: {
    mode: 'never' | 'date' | 'after';
    date?: string;
    occurrences?: number;
  };
}

interface FormData {
  recipients: RecipientData[];
  content: string;
  scheduled_at: string;
  recurrence: RecurrenceData;
}

export const ScheduledMessageDrawer: React.FC<ScheduledMessageDrawerProps> = ({
  isOpen,
  onClose,
  mode,
  message
}) => {
  // Estados
  const [formData, setFormData] = useState<FormData>({
    recipients: [],
    content: '',
    scheduled_at: '',
    recurrence: { type: 'none' }
  });
  
  const [contactSearch, setContactSearch] = useState('');
  const [showRecurrenceConfig, setShowRecurrenceConfig] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minDateTime, setMinDateTime] = useState('');

  // Hooks
  const { data: contacts = [] } = useContacts(contactSearch);
  const createMutation = useCreateGlobalScheduledMessage();
  const updateMutation = useUpdateGlobalScheduledMessage();

  // Inicializar formulário
  useEffect(() => {
    // Atualizar o valor mínimo de data/hora sempre que o drawer abrir
    const now = new Date();
    const minTime = new Date(now.getTime() + 60000); // +1 minuto
    setMinDateTime(minTime.toISOString().slice(0, 16));

    if (mode === 'edit' && message) {
      setFormData({
        recipients: [{
          id: message.conversation_id._id,
          name: message.conversation_id.customer_name,
          phone: message.conversation_id.customer_phone
        }],
        content: message.content,
        scheduled_at: new Date(message.scheduled_at).toISOString().slice(0, 16),
        recurrence: message.recurrence || { type: 'none' }
      });
      setShowRecurrenceConfig(message.is_recurring);
    } else {
      // Valores padrão para criação
      const futureTime = new Date(now.getTime() + 5 * 60000); // +5 minutos (valor padrão confortável)
      
      setFormData({
        recipients: [],
        content: '',
        scheduled_at: futureTime.toISOString().slice(0, 16),
        recurrence: { type: 'none' }
      });
      setShowRecurrenceConfig(false);
    }
    setErrors({});
  }, [mode, message, isOpen]);

  // Validação
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.recipients.length === 0) {
      newErrors.recipients = 'Selecione pelo menos um destinatário';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Digite o conteúdo da mensagem';
    }

    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Selecione data e hora';
    } else {
      const scheduledDate = new Date(formData.scheduled_at);
      const now = new Date();
      // Permitir agendamento a partir de 1 minuto no futuro
      const minFutureTime = new Date(now.getTime() + 60000); // +1 minuto
      if (scheduledDate < minFutureTime) {
        newErrors.scheduled_at = 'Data deve ser pelo menos 1 minuto no futuro';
      }
    }

    if (formData.recurrence.type === 'custom') {
      if (!formData.recurrence.interval || formData.recurrence.interval < 1) {
        newErrors.recurrence = 'Intervalo deve ser maior que 0';
      }
      if (formData.recurrence.unit === 'weeks' && (!formData.recurrence.daysOfWeek || formData.recurrence.daysOfWeek.length === 0)) {
        newErrors.recurrence = 'Selecione pelo menos um dia da semana';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleAddRecipient = (recipient: RecipientData) => {
    const exists = formData.recipients.some(r => r.phone === recipient.phone);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipient]
      }));
    }
  };

  const handleRemoveRecipient = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.phone !== phone)
    }));
  };

  const handleAddManualPhone = () => {
    if (manualPhone.trim()) {
      const phone = manualPhone.trim();
      if (phone.match(/^\+?[\d\s\-\(\)]+$/)) {
        handleAddRecipient({ phone });
        setManualPhone('');
      }
    }
  };

  const handleRecurrenceTypeChange = (type: string) => {
    const newRecurrence: RecurrenceData = { type: type as any };
    
    if (type === 'custom') {
      setShowRecurrenceConfig(true);
      newRecurrence.interval = 1;
      newRecurrence.unit = 'weeks';
      newRecurrence.daysOfWeek = [];
      newRecurrence.end = { mode: 'never' };
    } else {
      setShowRecurrenceConfig(type !== 'none');
    }

    setFormData(prev => ({
      ...prev,
      recurrence: newRecurrence
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = {
      recipients: formData.recipients,
      content: formData.content,
      scheduled_at: formData.scheduled_at,
      recurrence: formData.recurrence.type !== 'none' ? formData.recurrence : undefined
    };

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(submitData as CreateScheduledMessageData);
      } else if (message) {
        await updateMutation.mutateAsync({
          messageId: message._id,
          data: {
            content: formData.content,
            scheduled_at: formData.scheduled_at,
            recurrence: formData.recurrence.type !== 'none' ? formData.recurrence : undefined
          } as UpdateScheduledMessageData
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  const daysOfWeek = [
    { key: 'DOM', label: 'D', full: 'Domingo' },
    { key: 'SEG', label: 'S', full: 'Segunda' },
    { key: 'TER', label: 'T', full: 'Terça' },
    { key: 'QUA', label: 'Q', full: 'Quarta' },
    { key: 'QUI', label: 'Q', full: 'Quinta' },
    { key: 'SEX', label: 'S', full: 'Sexta' },
    { key: 'SAB', label: 'S', full: 'Sábado' }
  ];

  const getRecurrenceLabel = (type: string): string => {
    const labels = {
      none: 'Não se repete',
      daily: 'Todos os dias',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
      weekdays: 'Dias úteis (seg-sex)',
      custom: 'Personalizada'
    };
    return labels[type as keyof typeof labels] || 'Não se repete';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-[480px] h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nova Mensagem Agendada' : 'Editar Mensagem'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'create' 
                  ? 'Configure sua mensagem para envio automático' 
                  : 'Atualize os dados da mensagem agendada'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Destinatários */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4" />
              Destinatários
            </Label>
            
            {/* Lista de destinatários selecionados */}
            {formData.recipients.length > 0 && (
              <div className="space-y-2">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {recipient.name || 'Contato sem nome'}
                      </div>
                      <div className="text-sm text-gray-600">{recipient.phone}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(recipient.phone)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Buscar contatos */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {contactSearch && contacts.length > 0 && (
                <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleAddRecipient(contact)}
                    >
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-gray-600">{contact.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar número manual */}
            <div className="flex gap-2">
              <Input
                placeholder="Ex: +55 47 99999-9999"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddManualPhone()}
              />
              <Button variant="outline" onClick={handleAddManualPhone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {errors.recipients && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.recipients}
              </div>
            )}
          </div>

          {/* Mensagem */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <MessageSquare className="h-4 w-4" />
              Mensagem
            </Label>
            <Textarea
              placeholder="Digite sua mensagem..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formData.content.length}/1000 caracteres</span>
              {errors.content && (
                <span className="text-red-600">{errors.content}</span>
              )}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Calendar className="h-4 w-4" />
              Agendamento
            </Label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              min={minDateTime}
            />
            {errors.scheduled_at && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.scheduled_at}
              </div>
            )}
          </div>

          {/* Recorrência */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Repeat className="h-4 w-4" />
              Recorrência
            </Label>
            
            <Select
              value={formData.recurrence.type}
              onValueChange={handleRecurrenceTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não se repete</SelectItem>
                <SelectItem value="daily">Todos os dias</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="weekdays">Dias úteis (segunda a sexta)</SelectItem>
                <SelectItem value="custom">Personalizada</SelectItem>
              </SelectContent>
            </Select>

            {/* Configuração personalizada de recorrência */}
            {showRecurrenceConfig && formData.recurrence.type === 'custom' && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Configuração Personalizada</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecurrenceConfig(false)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>

                {/* Repetir a cada */}
                <div className="space-y-2">
                  <Label>Repetir a cada</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={formData.recurrence.interval || 1}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          interval: parseInt(e.target.value) || 1
                        }
                      }))}
                      className="w-20"
                    />
                    <Select
                      value={formData.recurrence.unit || 'weeks'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          unit: value as any
                        }
                      }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">dias</SelectItem>
                        <SelectItem value="weeks">semanas</SelectItem>
                        <SelectItem value="months">meses</SelectItem>
                        <SelectItem value="years">anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dias da semana (se unidade = semanas) */}
                {formData.recurrence.unit === 'weeks' && (
                  <div className="space-y-2">
                    <Label>Repetir em</Label>
                    <div className="flex gap-1">
                      {daysOfWeek.map((day, index) => (
                        <Button
                          key={index}
                          variant={formData.recurrence.daysOfWeek?.includes(day.key) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const currentDays = formData.recurrence.daysOfWeek || [];
                            const newDays = currentDays.includes(day.key)
                              ? currentDays.filter(d => d !== day.key)
                              : [...currentDays, day.key];
                            
                            setFormData(prev => ({
                              ...prev,
                              recurrence: {
                                ...prev.recurrence,
                                daysOfWeek: newDays
                              }
                            }));
                          }}
                          className="w-8 h-8 p-0"
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Término da recorrência */}
                <div className="space-y-3">
                  <Label>Término da recorrência</Label>
                  <RadioGroup
                    value={formData.recurrence.end?.mode || 'never'}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      recurrence: {
                        ...prev.recurrence,
                        end: { ...prev.recurrence.end, mode: value as any }
                      }
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="never" id="never" />
                      <Label htmlFor="never">Nunca</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="date" id="end-date" />
                      <Label htmlFor="end-date">Em</Label>
                      <Input
                        type="date"
                        value={formData.recurrence.end?.date || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: {
                            ...prev.recurrence,
                            end: { 
                              mode: prev.recurrence.end?.mode || 'never',
                              ...prev.recurrence.end, 
                              date: e.target.value 
                            }
                          }
                        }))}
                        disabled={formData.recurrence.end?.mode !== 'date'}
                        className="flex-1"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="after" id="after" />
                      <Label htmlFor="after">Após</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.recurrence.end?.occurrences || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: {
                            ...prev.recurrence,
                            end: { 
                              mode: prev.recurrence.end?.mode || 'never',
                              ...prev.recurrence.end, 
                              occurrences: parseInt(e.target.value) || 1 
                            }
                          }
                        }))}
                        disabled={formData.recurrence.end?.mode !== 'after'}
                        className="w-20"
                      />
                      <Label>ocorrências</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {errors.recurrence && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.recurrence}
              </div>
            )}
          </div>

          {/* Preview */}
          {formData.content && formData.recipients.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-2">
                    Preview da Mensagem
                  </h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>
                      <strong>Para:</strong> {formData.recipients.map(r => r.name || r.phone).join(', ')}
                    </div>
                    <div>
                      <strong>Quando:</strong> {new Date(formData.scheduled_at).toLocaleString('pt-BR')}
                    </div>
                    <div>
                      <strong>Recorrência:</strong> {getRecurrenceLabel(formData.recurrence.type)}
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200 mt-3">
                      <div className="text-gray-900 whitespace-pre-wrap">{formData.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {mode === 'create' ? 'Agendar Mensagem' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
