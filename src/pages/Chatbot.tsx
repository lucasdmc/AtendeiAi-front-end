import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import {
  Search,
  Plus,
  GripVertical,
  Pencil,
  Trash,
  BarChart,
  Copy,
  Play,
  Pause,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { ChannelChip } from '@/components/chatbots/ChannelChip';
import { EmptyState } from '@/components/chatbots/EmptyState';
import { Chatbot as ChatbotType, Channel } from '@/types/chatbot';
import { chatbotsService } from '@/services/chatbotsService';
import { channelsService } from '@/services/channelsService';

// Configurar dayjs
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// Componente de linha sortable
interface SortableRowProps {
  chatbot: ChatbotType;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onReport: () => void;
  onClone: () => void;
  onDelete: () => void;
}

function SortableRow({
  chatbot,
  isSelected,
  onSelect,
  onToggleActive,
  onEdit,
  onReport,
  onClone,
  onDelete,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chatbot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const createdDate = dayjs(chatbot.createdAt);
  const updatedDate = dayjs(chatbot.updatedAt);
  const canActivate = chatbot.channels.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[48px_48px_1fr_200px_180px_180px_140px_200px] items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
    >
      {/* Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </div>

      {/* Drag Handle */}
      <div className="flex items-center justify-center">
        <button
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Nome */}
      <div className="text-slate-900 font-medium">{chatbot.name}</div>

      {/* Canais */}
      <div className="flex gap-2 flex-wrap">
        {chatbot.channels.length > 0 ? (
          chatbot.channels.map((channel) => (
            <ChannelChip key={channel.id} channel={channel} />
          ))
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </div>

      {/* Criado em */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm text-slate-600 cursor-help">
              {createdDate.fromNow()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{createdDate.format('DD/MM/YYYY HH:mm:ss')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Atualizado em */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm text-slate-600 cursor-help">
              {updatedDate.fromNow()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{updatedDate.format('DD/MM/YYYY HH:mm:ss')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Execuções hoje */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-900">{chatbot.runsToday}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-0.5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Total de execuções iniciadas nas últimas 24 horas.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 justify-end">
        {/* Relatório */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onReport}
                className="p-1.5 hover:bg-slate-100 rounded"
                aria-label="Relatório"
              >
                <BarChart className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Relatório</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Editar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-slate-100 rounded"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Ativar/Pausar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleActive}
                disabled={!canActivate}
                className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={chatbot.active ? 'Pausar' : 'Ativar'}
              >
                {chatbot.active ? (
                  <Pause className="h-4 w-4 text-slate-500" />
                ) : (
                  <Play className="h-4 w-4 text-slate-500" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {!canActivate ? (
                <div>
                  <p className="font-semibold mb-1">Ativar</p>
                  <p className="text-xs">
                    O status de ativado/desativado é relevante apenas em bots que estejam
                    configurados para iniciar junto com novas conversas de canais. Veja a
                    documentação dos blocos de Início para mais informações
                  </p>
                </div>
              ) : (
                <p>{chatbot.active ? 'Pausar' : 'Ativar'}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Clonar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClone}
                className="p-1.5 hover:bg-slate-100 rounded"
                aria-label="Clonar"
              >
                <Copy className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clonar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Excluir */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-slate-100 rounded"
                aria-label="Excluir"
              >
                <Trash className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados principais
  const [chatbots, setChatbots] = useState<ChatbotType[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [selectedChatbots, setSelectedChatbots] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingChatbots, setDeletingChatbots] = useState<ChatbotType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar dados do backend
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log('🔄 Carregando chatbots e canais do backend...');
      
      // Carregar chatbots e canais em paralelo
      const [chatbotsResponse, channelsResponse] = await Promise.all([
        chatbotsService.list(),
        channelsService.list()
      ]);

        console.log('✅ Dados carregados:', {
          chatbots: chatbotsResponse.items?.length || 0,
          channels: Array.isArray(channelsResponse) ? channelsResponse.length : 0
        });

      // Mapear chatbots para o formato esperado
        const mappedChatbots = (chatbotsResponse.items || []).map((chatbot: any) => ({
        id: chatbot.id,
        name: chatbot.name,
        channels: chatbot.channels || [],
        createdAt: chatbot.created_at,
        updatedAt: chatbot.updated_at,
        runsToday: chatbot.runs_today || 0,
        active: chatbot.active || false,
        order: chatbot.order || 0,
      }));

      // Mapear canais para o formato esperado
      const channelsData = Array.isArray(channelsResponse) ? channelsResponse : [];
      const mappedChannels = channelsData.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        kind: channel.type || channel.kind,
      }));

      setChatbots(mappedChatbots);
      setChannels(mappedChannels);

      toast({
        title: "Dados atualizados",
        description: `${mappedChatbots.length} chatbots e ${mappedChannels.length} canais carregados.`,
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Carregar dados na inicialização
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Remover dependência de loadData para evitar loops

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar chatbots
  const filteredChatbots = useMemo(() => {
    let result = [...chatbots];

    // Filtro de busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((bot) =>
        bot.name.toLowerCase().includes(search)
      );
    }

    // Filtro de canal
    if (selectedChannelId && selectedChannelId !== 'all') {
      result = result.filter((bot) =>
        bot.channels.some((c) => c.id === selectedChannelId)
      );
    }

    return result;
  }, [chatbots, searchTerm, selectedChannelId]);

  // Handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedChatbots(filteredChatbots.map((b) => b.id));
    } else {
      setSelectedChatbots([]);
    }
  }, [filteredChatbots]);

  const handleSelectChatbot = useCallback((botId: string, checked: boolean) => {
    if (checked) {
      setSelectedChatbots((prev) => [...prev, botId]);
    } else {
      setSelectedChatbots((prev) => prev.filter((id) => id !== botId));
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setChatbots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Atualizar ordem no backend (optimistic update)
        const orderedIds = newOrder.map((b) => b.id);
        chatbotsService.reorder(orderedIds).catch(() => {
          toast({
            title: 'Erro ao reordenar',
            description: 'Não foi possível salvar a nova ordem.',
            variant: 'destructive',
          });
          setChatbots(items);
        });

        toast({
          title: 'Ordem atualizada',
          description: 'A ordem dos chatbots foi alterada com sucesso.',
        });

        return newOrder;
      });
    }
  }, [toast]);

  const handleToggleActive = useCallback(async (botId: string) => {
    const bot = chatbots.find((b) => b.id === botId);
    if (!bot) return;

    try {
      if (bot.active) {
        await chatbotsService.pause(botId);
      } else {
        await chatbotsService.activate(botId);
      }

      setChatbots((prev) =>
        prev.map((b) => (b.id === botId ? { ...b, active: !b.active } : b))
      );

      toast({
        title: bot.active ? 'Chatbot pausado' : 'Chatbot ativado',
        description: `O chatbot foi ${bot.active ? 'pausado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [chatbots, toast]);

  const handleClone = useCallback(async (botId: string) => {
    try {
      const result = await chatbotsService.clone(botId);
      
      toast({
        title: 'Chatbot clonado',
        description: 'O chatbot foi clonado com sucesso.',
      });

      // Navegar para edição do novo chatbot
      navigate(`/chatbots/${result.id}/edit`);
    } catch (error) {
      toast({
        title: 'Erro ao clonar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [navigate, toast]);

  const handleDelete = useCallback(async () => {
    try {
      const ids = deletingChatbots.map((b) => b.id);

      if (ids.length === 1) {
        await chatbotsService.remove(ids[0]);
      } else {
        await chatbotsService.removeBulk(ids);
      }

      setChatbots((prev) => prev.filter((b) => !ids.includes(b.id)));
      setSelectedChatbots([]);
      setIsDeleteModalOpen(false);
      setDeletingChatbots([]);

      toast({
        title: 'Excluído com sucesso',
        description: `${ids.length} chatbot(s) foram excluídos.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [deletingChatbots, toast]);

  const openDeleteModal = useCallback((bot: ChatbotType) => {
    setDeletingChatbots([bot]);
    setIsDeleteModalOpen(true);
  }, []);

  const openBulkDeleteModal = useCallback(() => {
    const botsToDelete = chatbots.filter((b) => selectedChatbots.includes(b.id));
    setDeletingChatbots(botsToDelete);
    setIsDeleteModalOpen(true);
  }, [chatbots, selectedChatbots]);

  const handleCreateNew = () => {
    navigate('/settings/chatbots/editor');
  };

  const allSelected = selectedChatbots.length === filteredChatbots.length && filteredChatbots.length > 0;
  const someSelected = selectedChatbots.length > 0 && selectedChatbots.length < filteredChatbots.length;
  const showEmptyState = chatbots.length === 0 && !searchTerm && selectedChannelId === 'all' && !isLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FD]">
        <div className="px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-slate-900 mb-1">Chatbots</h1>
            <p className="text-slate-500">
              Aqui você consegue criar e gerenciar os chatbots da sua organização.
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 p-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mr-3" />
              <span className="text-slate-600">Carregando chatbots...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FD]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Chatbots</h1>
          <p className="text-slate-500">
            Aqui você consegue criar e gerenciar os chatbots da sua organização.
          </p>
        </div>

        {/* Card principal */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 relative">
          {/* Barra de controles */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-100">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Filtro de canais */}
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger className="w-[200px] h-10">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mostrar todos os canais</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    <div className="flex items-center gap-2">
                      <ChannelChip channel={channel} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão Atualizar */}
            <Button
              variant="outline"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            {/* Botão Novo */}
            <Button onClick={handleCreateNew} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Novo chatbot
            </Button>
          </div>

          {/* Conteúdo: Empty State ou Tabela */}
          {showEmptyState ? (
            <EmptyState onCreateClick={handleCreateNew} />
          ) : (
            <>
              {/* Header da tabela */}
              <div className="grid grid-cols-[48px_48px_1fr_200px_180px_180px_140px_200px] items-center px-4 py-3 text-slate-500 text-sm font-medium border-b border-slate-100">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(ref) => {
                      if (ref) {
                        (ref as any).indeterminate = someSelected;
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <GripVertical className="h-4 w-4 text-slate-300" />
                </div>
                <div>Nome</div>
                <div>Canais</div>
                <div>Criado em</div>
                <div>Atualizado em</div>
                <div>Execuções hoje</div>
                <div className="text-right">Ações</div>
              </div>

              {/* Corpo da tabela */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredChatbots.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredChatbots.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-slate-500">
                      <div className="text-center">
                        <p className="mb-2">Nenhum chatbot encontrado para os filtros selecionados.</p>
                      </div>
                    </div>
                  ) : (
                    filteredChatbots.map((bot) => (
                      <SortableRow
                        key={bot.id}
                        chatbot={bot}
                        isSelected={selectedChatbots.includes(bot.id)}
                        onSelect={(checked) => handleSelectChatbot(bot.id, checked)}
                        onToggleActive={() => handleToggleActive(bot.id)}
                        onEdit={() => navigate(`/settings/chatbots/editor/${bot.id}`)}
                        onReport={() => navigate(`/chatbots/${bot.id}/report`)}
                        onClone={() => handleClone(bot.id)}
                        onDelete={() => openDeleteModal(bot)}
                      />
                    ))
                  )}
                </SortableContext>
              </DndContext>
            </>
          )}

          {/* Barra flutuante de ações em massa */}
          {selectedChatbots.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {selectedChatbots.length} selecionado{selectedChatbots.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteModal}
                className="h-9"
              >
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Modal de exclusão */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Excluir chatbot</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-slate-700">
              Tem certeza que deseja excluir {deletingChatbots.length} chatbot(s)?
              Esta ação não pode ser desfeita.
            </p>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingChatbots([]);
                }}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
