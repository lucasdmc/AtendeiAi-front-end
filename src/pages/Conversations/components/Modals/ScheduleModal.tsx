import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { 
  Calendar, 
  Clock, 
  X,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  Repeat
} from 'lucide-react';
import { useConversationsContext } from '../../context';

interface ScheduleData {
  date: string;
  time: string;
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
    interval?: number;
    unit?: 'days' | 'weeks' | 'months' | 'years';
    daysOfWeek?: string[];
    end?: {
      mode: 'never' | 'date' | 'after';
      date?: string;
      occurrences?: number;
    };
  };
}

interface ScheduleModalProps {
  onSchedule?: (scheduleData: ScheduleData) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ onSchedule }) => {
  const { 
    scheduleModalOpen, 
    setScheduleModalOpen,
    setScheduleData
  } = useConversationsContext();

  const [formData, setFormData] = useState<ScheduleData>({
    date: '',
    time: '',
    recurrence: {
      type: 'none'
    }
  });

  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);

  // Obter data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];
  
  // Obter horário atual + 5 minutos para pré-definição
  const now = new Date();
  const futureTime = new Date(now.getTime() + 5 * 60000); // +5 minutos
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const defaultTime = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`;

  // Inicializar valores padrão quando o modal abre
  useEffect(() => {
    if (scheduleModalOpen && !formData.date) {
      setFormData(prev => ({
        ...prev,
        date: today,
        time: defaultTime
      }));
    }
  }, [scheduleModalOpen, today, defaultTime, formData.date]);

  // Validações
  const isValidDate = formData.date && formData.date >= today;
  const isValidTime = formData.time && (formData.date > today || formData.time > currentTime);
  const canSchedule = isValidDate && isValidTime;

  const handleSchedule = () => {
    if (!canSchedule) return;

    console.log('📅 [SCHEDULE MODAL] Definindo agendamento:', formData);
    
    // Definir dados de agendamento no contexto
    setScheduleData(formData);
    
    // Fechar modal
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      date: '',
      time: '',
      recurrence: { type: 'none' }
    });
    setShowCustomRecurrence(false);
    setScheduleModalOpen(false);
  };

  const handleRecurrenceChange = (value: string) => {
    const newRecurrence = { ...formData.recurrence, type: value as any };
    
    // Se selecionou "custom", mostrar área personalizada
    if (value === 'custom') {
      setShowCustomRecurrence(true);
      newRecurrence.interval = 1;
      newRecurrence.unit = 'weeks';
      newRecurrence.daysOfWeek = [getDayOfWeek(formData.date)];
      newRecurrence.end = { mode: 'never' };
    } else {
      setShowCustomRecurrence(false);
      // Limpar campos personalizados
      delete newRecurrence.interval;
      delete newRecurrence.unit;
      delete newRecurrence.daysOfWeek;
      delete newRecurrence.end;
    }

    setFormData(prev => ({ ...prev, recurrence: newRecurrence }));
  };

  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return 'DOM';
    const date = new Date(dateString);
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return days[date.getDay()];
  };

  const getRecurrenceLabel = (type: string, date: string): string => {
    switch (type) {
      case 'daily': return 'Todos os dias';
      case 'weekly': return `Semanal: ${getDayOfWeek(date) === 'DOM' ? 'Domingo' : 
                                       getDayOfWeek(date) === 'SEG' ? 'Segunda' :
                                       getDayOfWeek(date) === 'TER' ? 'Terça' :
                                       getDayOfWeek(date) === 'QUA' ? 'Quarta' :
                                       getDayOfWeek(date) === 'QUI' ? 'Quinta' :
                                       getDayOfWeek(date) === 'SEX' ? 'Sexta' : 'Sábado'}`;
      case 'monthly': return 'Mensal: no mesmo dia';
      case 'yearly': return 'Anual: mesma data';
      case 'weekdays': return 'Todos os dias úteis (segunda a sexta-feira)';
      case 'custom': return 'Personalizar...';
      default: return 'Não se repete';
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

  return (
    <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendar envio da mensagem
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full"
            />
            {formData.date && !isValidDate && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                Data não pode ser no passado
              </div>
            )}
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full"
            />
            {formData.time && formData.date && !isValidTime && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                Hora não pode ser no passado
              </div>
            )}
          </div>

          {/* Recorrência */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recorrência
            </Label>
            <Select
              value={formData.recurrence.type}
              onValueChange={handleRecurrenceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não se repete</SelectItem>
                <SelectItem value="daily">Todos os dias</SelectItem>
                <SelectItem value="weekly">{getRecurrenceLabel('weekly', formData.date)}</SelectItem>
                <SelectItem value="monthly">Mensal: no mesmo dia</SelectItem>
                <SelectItem value="yearly">Anual: mesma data</SelectItem>
                <SelectItem value="weekdays">Todos os dias úteis (segunda a sexta-feira)</SelectItem>
                <SelectItem value="custom">Personalizar...</SelectItem>
              </SelectContent>
            </Select>

            {/* Área de Recorrência Personalizada */}
            {showCustomRecurrence && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Recorrência Personalizada</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomRecurrence(false)}
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

                {/* Repetir em (se unidade = semanas) */}
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
                        min={formData.date}
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
          </div>

          {/* Preview do agendamento */}
          {canSchedule && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-2">
                    Configuração do Agendamento
                  </h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(formData.date).toLocaleDateString('pt-BR')} às {formData.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      <span>{getRecurrenceLabel(formData.recurrence.type, formData.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSchedule}
              disabled={!canSchedule}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Definir envio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
