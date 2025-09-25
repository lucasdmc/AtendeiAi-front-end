import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Clock, X, Edit } from 'lucide-react';

interface ScheduledMessageBadgeProps {
  scheduleDate: string;
  scheduleTime: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
  };
  onEdit?: () => void;
  onCancel?: () => void;
}

export const ScheduledMessageBadge: React.FC<ScheduledMessageBadgeProps> = ({
  scheduleDate,
  scheduleTime,
  recurrence,
  onEdit,
  onCancel
}) => {
  const formatScheduleDisplay = (): string => {
    const date = new Date(`${scheduleDate}T${scheduleTime}`);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecurrenceText = (): string => {
    if (!recurrence || recurrence.type === 'none') return '';
    
    switch (recurrence.type) {
      case 'daily': return ' • Diário';
      case 'weekly': return ' • Semanal';
      case 'monthly': return ' • Mensal';
      case 'yearly': return ' • Anual';
      case 'weekdays': return ' • Dias úteis';
      case 'custom': return ' • Personalizado';
      default: return '';
    }
  };

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-blue-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            Agendada para {formatScheduleDisplay()}{getRecurrenceText()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            title="Editar agendamento"
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
        
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            title="Cancelar envio"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
