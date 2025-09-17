import { useState, useMemo } from 'react';

interface Agendamento {
  id: string;
  paciente_nome: string;
  horario_inicio: string;
  horario_fim: string;
  flag_id: string;
  data: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'finalizado';
}

interface Flag {
  id: string;
  name: string;
  color: string;
}

type ViewType = 'semana' | 'mes' | 'ano';

export const useAgenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('mes');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  // Flags mock
  const flags: Flag[] = [
    { id: '1', name: 'Consulta', color: '#3B82F6' },
    { id: '2', name: 'Retorno', color: '#10B981' },
    { id: '3', name: 'Exame', color: '#F59E0B' },
    { id: '4', name: 'Cirurgia', color: '#EF4444' },
  ];

  // Dados mock para demonstração
  const mockAgendamentos: Agendamento[] = [
    {
      id: '1',
      paciente_nome: 'João Silva',
      horario_inicio: '09:00',
      horario_fim: '10:00',
      flag_id: '1',
      data: new Date().toISOString().split('T')[0],
      status: 'confirmado'
    },
    {
      id: '2',
      paciente_nome: 'Maria Santos',
      horario_inicio: '14:30',
      horario_fim: '15:30',
      flag_id: '2',
      data: new Date().toISOString().split('T')[0],
      status: 'agendado'
    },
    {
      id: '3',
      paciente_nome: 'Pedro Costa',
      horario_inicio: '16:00',
      horario_fim: '17:00',
      flag_id: '3',
      data: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
      status: 'agendado'
    }
  ];

  // Dados da semana
  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayAgendamentos = mockAgendamentos.filter(ag => ag.data === dateStr);
      
      weekDays.push({
        date,
        agendamentos: dayAgendamentos
      });
    }
    
    return weekDays;
  }, [currentDate]);

  // Dados do mês
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks = [];
    const currentWeekDate = new Date(startDate);
    
    while (currentWeekDate <= lastDay || currentWeekDate.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekDate);
        const dateStr = date.toISOString().split('T')[0];
        const dayAgendamentos = mockAgendamentos.filter(ag => ag.data === dateStr);
        
        week.push({
          date: new Date(date),
          agendamentos: dayAgendamentos,
          isCurrentMonth: date.getMonth() === month
        });
        
        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }
      weeks.push(week);
      
      if (currentWeekDate.getMonth() > month || currentWeekDate.getFullYear() > year) {
        break;
      }
    }
    
    return weeks;
  }, [currentDate]);

  // Dados do ano
  const yearData = useMemo(() => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(year, i, 1);
      const monthAgendamentos = mockAgendamentos.filter(ag => {
        const agDate = new Date(ag.data);
        return agDate.getFullYear() === year && agDate.getMonth() === i;
      });
      
      months.push({
        date: monthDate,
        agendamentos: monthAgendamentos
      });
    }
    
    return months;
  }, [currentDate]);

  const addAgendamento = (agendamentoData: Omit<Agendamento, 'id'>) => {
    const newAgendamento: Agendamento = {
      ...agendamentoData,
      id: Date.now().toString()
    };
    setAgendamentos(prev => [...prev, newAgendamento]);
  };

  const getFlagById = (flagId: string) => {
    return flags.find(flag => flag.id === flagId);
  };

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    weekData,
    monthData,
    yearData,
    flags,
    agendamentos,
    addAgendamento,
    getFlagById,
  };
};