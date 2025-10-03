import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AgentSelect } from '@/components/activity-logs/AgentSelect';
import { ActivitySelect } from '@/components/activity-logs/ActivitySelect';
import { DateRangePicker } from '@/components/activity-logs/DateRangePicker';
import { ActivityLog, Agent, ActivityType } from '@/types/activityLogs';
import { Link } from 'react-router-dom';

// Configurar dayjs
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// Dados mock
const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Edna',
    avatarUrl: undefined,
    isYou: false,
  },
  {
    id: '2',
    name: 'EdnadePaula',
    avatarUrl: undefined,
    isYou: false,
  },
  {
    id: '3',
    name: 'Marcos',
    avatarUrl: undefined,
    isYou: false,
  },
  {
    id: '4',
    name: 'PauloRobertoBJunior',
    avatarUrl: undefined,
    isYou: true,
  },
];

const MOCK_LOGS: ActivityLog[] = [
  {
    id: '1',
    type: 'TAG_CREATED',
    message: 'Criou a etiqueta',
    createdAt: dayjs().subtract(19, 'minutes').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'Nova etiqueta',
      url: '/settings/tags',
    },
  },
  {
    id: '2',
    type: 'CONVERSATION_FINISHED',
    message: 'Finalizou a',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'conversa',
      url: '/conversations',
    },
  },
  {
    id: '3',
    type: 'CHATBOT_ENABLED',
    message: 'Ativou o chatbot',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'Fluxo',
      url: '/chatbot',
    },
  },
  {
    id: '4',
    type: 'CHATBOT_UPDATED',
    message: 'Atualizou um',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'chatbot',
      url: '/chatbot',
    },
  },
  {
    id: '5',
    type: 'CONVERSATION_STARTED',
    message: 'Criou uma',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'conversa',
      url: '/conversations',
    },
  },
  {
    id: '6',
    type: 'CONVERSATION_STARTED',
    message: 'Criou a',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'conversa',
      url: '/conversations',
    },
  },
  {
    id: '7',
    type: 'MARKETING_NOTIFICATIONS',
    message: 'Notificações de marketing',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
  },
  {
    id: '8',
    type: 'CHANNEL_CREATED',
    message: 'Canal criado',
    createdAt: dayjs().subtract(3, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
  },
  {
    id: '9',
    type: 'PAYMENT_RECEIVED',
    message: 'Pagamento recebido',
    createdAt: dayjs().subtract(4, 'hours').toISOString(),
    actor: MOCK_AGENTS[2],
  },
  {
    id: '10',
    type: 'QUICK_REPLY_CREATED',
    message: 'Criou uma resposta rápida',
    createdAt: dayjs().subtract(5, 'hours').toISOString(),
    actor: MOCK_AGENTS[1],
  },
  {
    id: '11',
    type: 'SECTOR_UPDATED',
    message: 'Atualizou o setor',
    createdAt: dayjs().subtract(6, 'hours').toISOString(),
    actor: MOCK_AGENTS[0],
    resource: {
      label: 'Comercial',
      url: '/settings/departments',
    },
  },
  {
    id: '12',
    type: 'TAG_DELETED',
    message: 'Deletou a etiqueta',
    createdAt: dayjs().subtract(7, 'hours').toISOString(),
    actor: MOCK_AGENTS[3],
    resource: {
      label: 'Urgente',
      url: '/settings/tags',
    },
  },
];

export default function ActivityLogs() {
  const navigate = useNavigate();

  // Estados dos filtros
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [dateRange, setDateRange] = useState({
    start: dayjs().subtract(7, 'days').startOf('second').toISOString(),
    end: dayjs().startOf('second').toISOString(),
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    let result = [...MOCK_LOGS];

    if (selectedAgentIds.length > 0) {
      result = result.filter((log) => selectedAgentIds.includes(log.actor.id));
    }

    if (selectedActivities.length > 0) {
      result = result.filter((log) => selectedActivities.includes(log.type));
    }

    // Filtrar por data
    result = result.filter((log) => {
      const logDate = dayjs(log.createdAt);
      return logDate.isAfter(dayjs(dateRange.start)) && logDate.isBefore(dayjs(dateRange.end));
    });

    return result;
  }, [selectedAgentIds, selectedActivities, dateRange]);

  // Paginar logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleClearFilters = useCallback(() => {
    setSelectedAgentIds([]);
    setSelectedActivities([]);
    setDateRange({
      start: dayjs().subtract(7, 'days').startOf('second').toISOString(),
      end: dayjs().startOf('second').toISOString(),
    });
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback((range: { start: string; end: string }) => {
    setDateRange(range);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FD]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button
              onClick={() => navigate('/settings')}
              className="hover:text-slate-700 transition-colors"
            >
              Configurações
            </button>
            <span>/</span>
            <span>Logs de atividade</span>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">
            Logs de atividade
          </h1>
          <p className="text-slate-500">
            Aqui você encontra o registro de todas as atividades realizadas pelos usuários.
          </p>
        </div>

        {/* Card principal */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          {/* Filtros */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-100">
            <AgentSelect
              agents={MOCK_AGENTS}
              value={selectedAgentIds}
              onChange={setSelectedAgentIds}
            />
            <ActivitySelect
              value={selectedActivities}
              onChange={setSelectedActivities}
            />
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Tabela */}
          <div>
            {/* Header da tabela */}
            <div className="grid grid-cols-[1fr_2fr_200px] items-center px-6 py-3 text-slate-500 text-sm font-medium border-b border-slate-100">
              <div>Atendente</div>
              <div>Atividade</div>
              <div>Data</div>
            </div>

            {/* Corpo da tabela */}
            <div>
              {paginatedLogs.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  <div className="text-center">
                    <p className="mb-2">Nenhum registro para os filtros selecionados.</p>
                    <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              ) : (
                paginatedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-[1fr_2fr_200px] items-center px-6 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    {/* Coluna 1 - Atendente */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.actor.avatarUrl} alt={log.actor.name} />
                        <AvatarFallback className="text-xs">
                          {log.actor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-900">{log.actor.name}</span>
                        {log.actor.isYou && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 text-xs px-2 py-0"
                          >
                            Você
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Coluna 2 - Atividade */}
                    <div className="text-sm text-slate-700">
                      {log.message}
                      {log.resource && (
                        <>
                          {' '}
                          {log.resource.url ? (
                            <Link
                              to={log.resource.url}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {log.resource.label}
                            </Link>
                          ) : (
                            <span className="text-blue-600 font-medium">
                              {log.resource.label}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Coluna 3 - Data */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm text-slate-600 cursor-help">
                            {dayjs(log.createdAt).fromNow()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paginação */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                Exibindo {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredLogs.length)} de{' '}
                {filteredLogs.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!hasPrevPage}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNextPage}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
