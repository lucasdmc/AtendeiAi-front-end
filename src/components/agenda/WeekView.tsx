import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Agendamento {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  flag_id: string;
  status: string;
}

interface DayData {
  date: Date;
  agendamentos: Agendamento[];
}

interface Flag {
  id: string;
  name: string;
  color: string;
}

interface WeekViewProps {
  weekData: DayData[];
  flags: Flag[];
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ weekData, flags, onAgendamentoClick }) => {
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const getFlagColor = (flagId: string) => {
    const flag = flags.find(f => f.id === flagId);
    return flag?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7">
        {weekData.map((day, index) => (
          <div
            key={index}
            className={`
              border-r border-gray-200 last:border-r-0
              ${isToday(day.date) ? 'bg-blue-50' : ''}
            `}
          >
            {/* Header do dia */}
            <div className={`
              p-4 border-b border-gray-200 text-center
              ${isToday(day.date) ? 'bg-blue-100' : 'bg-gray-50'}
            `}>
              <div className="text-sm font-medium text-gray-700">
                {weekDays[index]}
              </div>
              <div className={`
                text-lg font-semibold mt-1
                ${isToday(day.date) ? 'text-blue-600' : 'text-gray-900'}
              `}>
                {day.date.getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {day.date.toLocaleDateString('pt-BR', { month: 'short' })}
              </div>
            </div>

            {/* Agendamentos do dia */}
            <div className="p-2 min-h-[400px]">
              <div className="space-y-2">
                {day.agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="p-2 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    style={{ borderLeftColor: getFlagColor(agendamento.flag_id) }}
                    onClick={() => onAgendamentoClick(agendamento)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {agendamento.horario_inicio} - {agendamento.horario_fim}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(agendamento.status)}`}
                      >
                        {agendamento.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {agendamento.paciente_nome}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {flags.find(f => f.id === agendamento.flag_id)?.name}
                    </div>
                  </div>
                ))}
                
                {day.agendamentos.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-sm">Nenhum agendamento</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;