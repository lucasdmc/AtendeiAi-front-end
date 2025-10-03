import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

dayjs.extend(customParseFormat);

export type PresetKey =
  | 'last7d' | 'last15d' | 'last30d'
  | 'lastMonth' | 'lastBimester'
  | 'lastQuarter' | 'lastSemester';

export type DateRange = { start: string; end: string };

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presetsEnabled?: PresetKey[];
  minDateTime?: string;
  maxDateTime?: string;
  className?: string;
}

const PRESETS: Record<PresetKey, string> = {
  last7d: 'Últimos 7 dias',
  last15d: 'Últimos 15 dias',
  last30d: 'Últimos 30 dias',
  lastMonth: 'Último mês',
  lastBimester: 'Último bimestre',
  lastQuarter: 'Último quarter',
  lastSemester: 'Último semestre',
};

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function DateRangePicker({
  value,
  onChange,
  presetsEnabled = ['last7d', 'last15d', 'last30d', 'lastMonth', 'lastBimester', 'lastQuarter', 'lastSemester'],
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'calendar'>('calendar');
  const [viewMonth, setViewMonth] = useState(dayjs(value.end));
  
  // Estados temporários para edição
  const [tempStart, setTempStart] = useState(value.start);
  const [tempEnd, setTempEnd] = useState(value.end);

  const formatDateRange = () => {
    const start = dayjs(value.start).format('DD/MM/YYYY HH:mm:ss');
    const end = dayjs(value.end).format('DD/MM/YYYY HH:mm:ss');
    return `${start} - ${end}`;
  };

  const handlePresetClick = (preset: PresetKey) => {
    const now = dayjs();
    let start: dayjs.Dayjs;

    switch (preset) {
      case 'last7d':
        start = now.subtract(7, 'day');
        break;
      case 'last15d':
        start = now.subtract(15, 'day');
        break;
      case 'last30d':
        start = now.subtract(30, 'day');
        break;
      case 'lastMonth':
        start = now.subtract(1, 'month').startOf('month');
        break;
      case 'lastBimester':
        start = now.subtract(2, 'month');
        break;
      case 'lastQuarter':
        start = now.subtract(3, 'month');
        break;
      case 'lastSemester':
        start = now.subtract(6, 'month');
        break;
    }

    onChange({
      start: start.startOf('second').toISOString(),
      end: now.startOf('second').toISOString(),
    });
    setOpen(false);
  };

  const handleApply = () => {
    onChange({
      start: tempStart,
      end: tempEnd,
    });
    setOpen(false);
  };

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = viewMonth.startOf('month');
    const lastDayOfMonth = viewMonth.endOf('month');
    const startWeekDay = firstDayOfMonth.day();
    const daysInMonth = lastDayOfMonth.date();

    const days: Array<{ date: dayjs.Dayjs; isCurrentMonth: boolean }> = [];

    // Dias do mês anterior
    const prevMonthDays = startWeekDay;
    const prevMonth = viewMonth.subtract(1, 'month');
    const prevMonthLastDay = prevMonth.endOf('month').date();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.date(prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: viewMonth.date(i),
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    const nextMonth = viewMonth.add(1, 'month');
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: nextMonth.date(i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewMonth]);

  const handleDayClick = (date: dayjs.Dayjs) => {
    const clickedDate = date.startOf('day');
    const currentStart = dayjs(tempStart).startOf('day');

    // Se clicar em uma data, definir como início do range
    // Se clicar novamente, definir como fim
    if (clickedDate.isSame(currentStart) || clickedDate.isBefore(currentStart)) {
      setTempStart(date.hour(dayjs(tempStart).hour()).minute(dayjs(tempStart).minute()).second(dayjs(tempStart).second()).toISOString());
    } else {
      setTempEnd(date.hour(dayjs(tempEnd).hour()).minute(dayjs(tempEnd).minute()).second(dayjs(tempEnd).second()).toISOString());
    }
  };

  const isDateInRange = (date: dayjs.Dayjs) => {
    const d = date.startOf('day');
    const start = dayjs(tempStart).startOf('day');
    const end = dayjs(tempEnd).startOf('day');
    return d.isAfter(start) && d.isBefore(end) || d.isSame(start) || d.isSame(end);
  };

  const isDateStart = (date: dayjs.Dayjs) => {
    return date.startOf('day').isSame(dayjs(tempStart).startOf('day'));
  };

  const isDateEnd = (date: dayjs.Dayjs) => {
    return date.startOf('day').isSame(dayjs(tempEnd).startOf('day'));
  };

  const years = Array.from({ length: 36 }, (_, i) => 2000 + i);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesSeconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 justify-start text-left font-normal min-w-[400px]',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="text-sm">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-full mb-4">
            <button
              onClick={() => setActiveTab('presets')}
              className={cn(
                'flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeTab === 'presets'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Intervalos
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={cn(
                'flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Calendário
            </button>
          </div>

          {/* Aba Intervalos */}
          {activeTab === 'presets' && (
            <div className="space-y-1">
              {presetsEnabled.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {PRESETS[preset]}
                </button>
              ))}
            </div>
          )}

          {/* Aba Calendário */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Campos de Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Data inicial
                  </label>
                  <input
                    type="text"
                    value={dayjs(tempStart).format('DD/MM/YYYY HH:mm:ss')}
                    readOnly
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Data final
                  </label>
                  <input
                    type="text"
                    value={dayjs(tempEnd).format('DD/MM/YYYY HH:mm:ss')}
                    readOnly
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              {/* Controles do Calendário */}
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={viewMonth.year().toString()}
                  onValueChange={(year) => setViewMonth(viewMonth.year(parseInt(year)))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={viewMonth.month().toString()}
                  onValueChange={(month) => setViewMonth(viewMonth.month(parseInt(month)))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendário */}
              <div>
                {/* Header */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((day, i) => (
                    <div
                      key={i}
                      className="h-9 flex items-center justify-center text-xs font-medium text-slate-600"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, i) => {
                    const isInRange = isDateInRange(day.date);
                    const isStart = isDateStart(day.date);
                    const isEnd = isDateEnd(day.date);
                    const isToday = day.date.isSame(dayjs(), 'day');

                    return (
                      <button
                        key={i}
                        onClick={() => handleDayClick(day.date)}
                        className={cn(
                          'h-9 flex items-center justify-center text-sm relative',
                          !day.isCurrentMonth && 'text-slate-400',
                          day.isCurrentMonth && 'text-slate-900',
                          isInRange && !isStart && !isEnd && 'bg-blue-50',
                          (isStart || isEnd) && 'bg-blue-600 text-white rounded-full font-medium',
                          isToday && !isStart && !isEnd && 'border border-blue-300 rounded-full',
                          'hover:bg-slate-100 transition-colors cursor-pointer'
                        )}
                      >
                        {day.date.date()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletores de Hora/Min/Seg */}
              <div className="flex items-center justify-center gap-2">
                <Select
                  value={dayjs(tempStart).hour().toString().padStart(2, '0')}
                  onValueChange={(h) => setTempStart(dayjs(tempStart).hour(parseInt(h)).toISOString())}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-slate-400">:</span>
                <Select
                  value={dayjs(tempStart).minute().toString().padStart(2, '0')}
                  onValueChange={(m) => setTempStart(dayjs(tempStart).minute(parseInt(m)).toISOString())}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutesSeconds.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-slate-400">:</span>
                <Select
                  value={dayjs(tempStart).second().toString().padStart(2, '0')}
                  onValueChange={(s) => setTempStart(dayjs(tempStart).second(parseInt(s)).toISOString())}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutesSeconds.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Aplicar */}
              <Button onClick={handleApply} className="w-full rounded-full h-10 bg-blue-600 hover:bg-blue-700">
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

