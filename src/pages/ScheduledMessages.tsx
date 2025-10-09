import React, { useState, useEffect } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare,
  Edit,
  X,
  RotateCcw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Copy,
  User,
  FilterX
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { ScheduledMessageDrawer } from '@/components/ScheduledMessages/ScheduledMessageDrawer';
import { 
  useGlobalScheduledMessages,
  useCancelGlobalScheduledMessage,
  useDuplicateGlobalScheduledMessage,
  type GlobalScheduledMessage
} from '@/hooks/useScheduledMessagesGlobal';

const ScheduledMessages: React.FC = () => {
  const { selectedInstitution } = useInstitution();
  
  // Estados
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>('all');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editingMessage, setEditingMessage] = useState<GlobalScheduledMessage | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Hooks
  const { 
    data: messagesData, 
    isLoading, 
    error, 
    refetch 
  } = useGlobalScheduledMessages({
    institution_id: selectedInstitution?._id || '',
    limit: 100
  });

  const cancelMessageMutation = useCancelGlobalScheduledMessage();
  const duplicateMessageMutation = useDuplicateGlobalScheduledMessage();

  const messages = messagesData?.messages || [];
  const total = messagesData?.total || 0;

  // Filtrar mensagens localmente
  const filteredMessages = messages.filter((message: GlobalScheduledMessage) => {
    const matchesSearch = searchTerm === '' || 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.conversation_id.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.conversation_id.customer_phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const messageDate = new Date(message.scheduled_at);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return messageDate.toDateString() === today.toDateString();
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return messageDate.toDateString() === tomorrow.toDateString();
        case 'week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return messageDate >= today && messageDate <= nextWeek;
        case 'month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          return messageDate >= today && messageDate <= nextMonth;
        case 'custom':
          if (dateRangeStart && dateRangeEnd) {
            const startDate = new Date(dateRangeStart);
            startDate.setHours(0, 0, 0, 0); // Início do dia
            const endDate = new Date(dateRangeEnd);
            endDate.setHours(23, 59, 59, 999); // Final do dia
            return messageDate >= startDate && messageDate <= endDate;
          } else if (dateRangeStart) {
            // Apenas data inicial selecionada
            const startDate = new Date(dateRangeStart);
            startDate.setHours(0, 0, 0, 0);
            return messageDate >= startDate;
          } else if (dateRangeEnd) {
            // Apenas data final selecionada
            const endDate = new Date(dateRangeEnd);
            endDate.setHours(23, 59, 59, 999);
            return messageDate <= endDate;
          }
          return true;
        default:
          return true;
      }
    })();

    const matchesRecurrence = recurrenceFilter === 'all' || (() => {
      switch (recurrenceFilter) {
        case 'none':
          return !message.recurrence || message.recurrence.type === 'none';
        case 'daily':
          return message.recurrence?.type === 'daily';
        case 'weekly':
          return message.recurrence?.type === 'weekly';
        case 'monthly':
          return message.recurrence?.type === 'monthly';
        case 'custom':
          return message.recurrence?.type === 'custom';
        case 'recurring':
          return message.recurrence && message.recurrence.type !== 'none';
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate && matchesRecurrence;
  });

  // Handlers
  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages(prev => [...prev, messageId]);
    } else {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(filteredMessages.map((m: GlobalScheduledMessage) => m._id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleCancelMessage = (messageId: string) => {
    cancelMessageMutation.mutate(messageId);
  };

  const handleEditMessage = (message: GlobalScheduledMessage) => {
    setEditingMessage(message);
    setShowEditDrawer(true);
  };

  const handleDuplicateMessage = (messageId: string) => {
    duplicateMessageMutation.mutate(messageId);
  };

  const handleBulkCancel = () => {
    selectedMessages.forEach(messageId => {
      cancelMessageMutation.mutate(messageId);
    });
    setSelectedMessages([]);
    setShowBulkActions(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
    setRecurrenceFilter('all');
  };

  // Funções auxiliares
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { 
        variant: 'secondary' as const, 
        icon: Clock, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 border-gray-200'
      },
      sent: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        color: 'text-green-600',
        bgColor: 'bg-green-100 border-green-200'
      },
      cancelled: { 
        variant: 'outline' as const, 
        icon: XCircle, 
        color: 'text-white',
        bgColor: 'bg-black border-black'
      },
      failed: { 
        variant: 'destructive' as const, 
        icon: AlertCircle, 
        color: 'text-red-600',
        bgColor: 'bg-red-100 border-red-200'
      },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge 
        variant={config.variant} 
        className={`flex items-center gap-1 ${config.bgColor} ${config.color}`}
      >
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status === 'pending' && 'Pendente'}
        {status === 'sent' && 'Enviado'}
        {status === 'cancelled' && 'Cancelado'}
        {status === 'failed' && 'Falhou'}
      </Badge>
    );
  };

  const getRecurrenceBadge = (message: GlobalScheduledMessage) => {
    if (!message.is_recurring || !message.recurrence) {
      return <Badge variant="outline">Única</Badge>;
    }

    const { type } = message.recurrence;
    const labels = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
      weekdays: 'Dias úteis',
      custom: 'Personalizada'
    };

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <RotateCcw className="h-3 w-3" />
        {labels[type as keyof typeof labels] || 'Recorrente'}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // const formatDateOnly = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('pt-BR', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric'
  //   });
  // };

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove @s.whatsapp.net e outros sufixos do WhatsApp
    const cleanPhone = phone.replace(/@.*$/, '');
    
    // Se não começar com +, adiciona + no início
    const phoneWithPlus = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    
    // Formato brasileiro: +55 XX XXXXX-XXXX ou +55 XX XXXX-XXXX
    if (phoneWithPlus.startsWith('+55') && phoneWithPlus.length >= 13) {
      const numbers = phoneWithPlus.slice(3); // Remove +55
      if (numbers.length === 11) {
        // Celular: +55 XX XXXXX-XXXX
        return `+55 ${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      } else if (numbers.length === 10) {
        // Fixo: +55 XX XXXX-XXXX
        return `+55 ${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      }
    }
    
    // Para outros países ou formatos não reconhecidos, retorna com espaços básicos
    if (phoneWithPlus.length > 4) {
      return phoneWithPlus.replace(/(\+\d{1,3})(\d+)/, '$1 $2');
    }
    
    return phoneWithPlus;
  };

  const getRecipientDisplay = (conversation: GlobalScheduledMessage['conversation_id']) => {
    if (conversation.conversation_type === 'group') {
      return conversation.group_name || 'Grupo sem nome';
    }
    return conversation.customer_name || formatPhoneNumber(conversation.customer_phone);
  };

  const getCreatedByDisplay = (createdBy: string) => {
    // Se for um ID de usuário, poderia fazer uma busca para pegar o nome
    // Por enquanto, vamos mostrar uma versão mais amigável
    if (!createdBy) return 'Sistema';
    
    // Se parecer com um ID (ObjectId do MongoDB), mostrar como "Usuário"
    if (createdBy.match(/^[0-9a-fA-F]{24}$/)) {
      return 'Usuário';
    }
    
    // Caso contrário, mostrar o valor como está
    return createdBy;
  };

  // Efeito para mostrar/ocultar ações em lote
  useEffect(() => {
    setShowBulkActions(selectedMessages.length > 0);
  }, [selectedMessages]);

  return (
    <div className="h-full flex bg-gray-50">
      {/* Área principal */}
      <div className="flex-1 p-8 bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mensagens Programadas
          </h1>
          <p className="text-gray-600">
            Gerencie e acompanhe suas mensagens agendadas
          </p>
          <div className="mt-2 flex items-center space-x-2 flex-wrap">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              📅 Total: {total}
            </div>
            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
              ⏳ Pendentes: {messages.filter((m: GlobalScheduledMessage) => m.status === 'pending').length}
            </div>
            <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full border border-green-200">
              ✅ Enviadas: {messages.filter((m: GlobalScheduledMessage) => m.status === 'sent').length}
            </div>
            <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">
              ❌ Falhou: {messages.filter((m: GlobalScheduledMessage) => m.status === 'failed').length}
            </div>
            <div className="text-xs bg-black text-white px-2 py-1 rounded-full border border-black">
              🚫 Canceladas: {messages.filter((m: GlobalScheduledMessage) => m.status === 'cancelled').length}
            </div>
          </div>
        </div>

        {/* Ações principais */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShowCreateDrawer(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Mensagem Agendada
            </Button>
            
            {showBulkActions && (
              <div className="flex items-center space-x-2 bg-white border rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600">
                  {selectedMessages.length} selecionada(s)
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkCancel}
                  disabled={cancelMessageMutation.isPending}
                >
                  {cancelMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Cancelar Selecionadas
                </Button>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurrenceFilter} onValueChange={setRecurrenceFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Recorrência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="none">Única</SelectItem>
              <SelectItem value="recurring">Recorrente</SelectItem>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="custom">Personalizada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(value) => {
            setDateFilter(value);
            if (value !== 'custom') {
              setDateRangeStart('');
              setDateRangeEnd('');
            }
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Data de envio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="tomorrow">Amanhã</SelectItem>
              <SelectItem value="week">Próximos 7 dias</SelectItem>
              <SelectItem value="month">Próximos 30 dias</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Campos de range de data quando "custom" está selecionado */}
          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-40"
                placeholder="Data inicial"
              />
              <span className="text-gray-500">até</span>
              <Input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-40"
                placeholder="Data final"
                min={dateRangeStart}
              />
            </div>
          )}

          {/* Botão Limpar Filtros */}
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || recurrenceFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}

          <div className="text-sm text-gray-500">
            {filteredMessages.length} de {messages.length} mensagens
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Carregando mensagens...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <span className="ml-2 text-red-600">Erro ao carregar mensagens</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || recurrenceFilter !== 'all'
                    ? 'Tente ajustar os filtros para encontrar mensagens.'
                    : 'Comece criando sua primeira mensagem agendada.'}
                </p>
                {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && recurrenceFilter === 'all' && (
                  <Button onClick={() => setShowCreateDrawer(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mensagem Agendada
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Agendado por</TableHead>
                    <TableHead>Agendado em</TableHead>
                    <TableHead>Agendado para</TableHead>
                    <TableHead>Recorrência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message: GlobalScheduledMessage) => (
                    <TableRow key={message._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMessages.includes(message._id)}
                          onCheckedChange={(checked) => 
                            handleSelectMessage(message._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {message.conversation_id.conversation_type === 'group' ? (
                              <Users className="h-4 w-4 text-gray-600" />
                            ) : (
                              <span className="text-xs font-medium text-gray-600">
                                {getRecipientDisplay(message.conversation_id).charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getRecipientDisplay(message.conversation_id)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPhoneNumber(message.conversation_id.customer_phone)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-900 truncate">
                                  {truncateText(message.content)}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-sm whitespace-pre-wrap">{message.content}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Agendado por */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {getCreatedByDisplay(message.created_by)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Agendado em */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {message.created_at ? formatDateTime(message.created_at) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Agendado para */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {message.is_recurring && message.next_execution 
                              ? formatDateTime(message.next_execution)
                              : formatDateTime(message.scheduled_at)
                            }
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getRecurrenceBadge(message)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMessage(message)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {message.status === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleCancelMessage(message._id)}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateMessage(message._id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Histórico
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drawer para criação */}
      <ScheduledMessageDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        mode="create"
      />

      {/* Drawer para edição */}
      <ScheduledMessageDrawer
        isOpen={showEditDrawer}
        onClose={() => {
          setShowEditDrawer(false);
          setEditingMessage(null);
        }}
        mode="edit"
        message={editingMessage}
      />
    </div>
  );
};

export default ScheduledMessages;

