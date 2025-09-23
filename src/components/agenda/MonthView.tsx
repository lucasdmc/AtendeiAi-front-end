import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Agendamento {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  flag_id: string;
}

interface DayData {
  date: Date;
  agendamentos: Agendamento[];
  isCurrentMonth: boolean;
}

interface MonthViewProps {
  monthData: DayData[][];
  currentDate: Date;
  onDayClick: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ monthData, onDayClick }) => {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7">
        {monthData.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`
                min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday(day.date) ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDayClick(day.date)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`
                    text-sm font-medium
                    ${isToday(day.date) ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                    ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  `}
                >
                  {day.date.getDate()}
                </span>
                {day.agendamentos.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {day.agendamentos.length}
                  </Badge>
                )}
              </div>

              {/* Agendamentos do dia */}
              <div className="space-y-1">
                {day.agendamentos.slice(0, 3).map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                  >
                    {agendamento.horario_inicio} - {agendamento.paciente_nome}
                  </div>
                ))}
                {day.agendamentos.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{day.agendamentos.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthView;