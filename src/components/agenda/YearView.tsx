import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Agendamento {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  flag_id: string;
}

interface MonthData {
  date: Date;
  agendamentos: Agendamento[];
}

interface YearViewProps {
  yearData: MonthData[];
  onMonthClick: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ yearData, onMonthClick }) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-3 gap-6">
        {yearData.map((month, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onMonthClick(month.date)}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[month.date.getMonth()]}
              </h3>
              <p className="text-sm text-gray-500">
                {month.date.getFullYear()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agendamentos:</span>
                <Badge variant="secondary">
                  {month.agendamentos.length}
                </Badge>
              </div>

              {month.agendamentos.length > 0 && (
                <div className="space-y-1">
                  {month.agendamentos.slice(0, 3).map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="text-xs p-2 bg-blue-50 text-blue-800 rounded"
                    >
                      {agendamento.paciente_nome} - {agendamento.horario_inicio}
                    </div>
                  ))}
                  {month.agendamentos.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{month.agendamentos.length - 3} mais
                    </div>
                  )}
                </div>
              )}

              {month.agendamentos.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-2">
                  Nenhum agendamento
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearView;