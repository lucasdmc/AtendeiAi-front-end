import React, { useState } from 'react';
import { useAgenda } from '@/hooks/useAgenda';
import AgendaHeader from '@/components/agenda/AgendaHeader';
import WeekView from '@/components/agenda/WeekView';
import MonthView from '@/components/agenda/MonthView';
import YearView from '@/components/agenda/YearView';
import AgendamentoModal from '@/components/agenda/AgendamentoModal';

const Agenda: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    view,
    setView,
    weekData,
    monthData,
    yearData,
    flags,
    addAgendamento,
    getFlagById,
  } = useAgenda();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleNewAgendamento = () => {
    setSelectedDate(currentDate);
    setIsModalOpen(true);
  };

  const handleAgendamentoSubmit = (agendamentoData: any) => {
    addAgendamento(agendamentoData);
    alert('Agendamento criado com sucesso!');
  };

  const handleDayClick = (date: Date) => {
    if (view === 'mes') {
      setCurrentDate(date);
      setView('semana');
    }
  };

  const handleMonthClick = (date: Date) => {
    if (view === 'ano') {
      setCurrentDate(date);
      setView('mes');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'semana':
        return (
          <WeekView
            weekData={weekData}
            flags={flags}
            onAgendamentoClick={(agendamento) => {
              const flag = getFlagById(agendamento.flag_id);
              alert(`${agendamento.paciente_nome} - ${agendamento.horario_inicio} (${flag?.name})`);
            }}
          />
        );
      case 'mes':
        return (
          <MonthView
            monthData={monthData}
            currentDate={currentDate}
            onDayClick={handleDayClick}
          />
        );
      case 'ano':
        return (
          <YearView
            yearData={yearData}
            onMonthClick={handleMonthClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie agendamentos por semana, mês ou ano
        </p>
      </div>

      <AgendaHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onNewAgendamento={handleNewAgendamento}
      />

      <div className="mb-6">
        {renderView()}
      </div>

      <AgendamentoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAgendamentoSubmit}
        flags={flags}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Agenda;