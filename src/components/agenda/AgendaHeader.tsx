import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

interface AgendaHeaderProps {
  currentDate: Date;
  view: 'semana' | 'mes' | 'ano';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'semana' | 'mes' | 'ano') => void;
  onNewAgendamento: () => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onNewAgendamento
}) => {
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'semana':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'mes':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'ano':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'semana':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'mes':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'ano':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatTitle = () => {
    switch (view) {
      case 'semana':
        return `Semana de ${currentDate.toLocaleDateString('pt-BR')}`;
      case 'mes':
        return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      case 'ano':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Calendar className="h-4 w-4 mr-2" />
            Hoje
          </Button>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 capitalize">
          {formatTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={view} onValueChange={onViewChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mês</SelectItem>
            <SelectItem value="ano">Ano</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onNewAgendamento}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
};

export default AgendaHeader;