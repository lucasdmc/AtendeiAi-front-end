import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  Search,
  Plus,
  Pencil,
  Trash,
  Radio,
  Smartphone,
  MessageCircle,
  Mail,
  Send,
  Music,
  Phone,
  RefreshCw,
  Wifi,
  WifiOff,
  Power,
  PowerOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { channelsService } from '@/services/channelsService';

// Tipos
interface Channel {
  id: string;
  name: string;
  kind: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'sms' | 'tiktok' | 'phone';
  active: boolean;
  verified: boolean;
  config?: any;
  stats?: {
    messages_sent: number;
    messages_received: number;
    conversations_started: number;
    last_activity: string;
  };
  session_id?: string;
  session_type?: string;
  session_status?: 'connecting' | 'connected' | 'disconnected' | 'error';
  phone_number?: string; // Número do telefone da sessão
  created_at: string;
  updated_at: string;
}

// Configuração dos tipos de canal
const channelTypes = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  instagram: {
    icon: MessageCircle,
    label: 'Instagram DM',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  sms: {
    icon: Smartphone,
    label: 'SMS',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  tiktok: {
    icon: Music,
    label: 'TikTok',
    color: 'bg-black',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  phone: {
    icon: Phone,
    label: 'Ligação Telefônica',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

// Status dos canais baseado na session_status e active
const getChannelStatus = (channel: Channel) => {
  if (!channel.active) return 'disabled';
  if (!channel.session_status || channel.session_status === 'disconnected') return 'offline';
  if (channel.session_status === 'connected') return 'online';
  if (channel.session_status === 'connecting') return 'offline';
  if (channel.session_status === 'error') return 'offline';
  return 'offline';
};

const statusConfig = {
  online: {
    label: 'Online',
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
    variant: 'default' as const
  },
  offline: {
    label: 'Offline',
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    variant: 'destructive' as const
  },
  disabled: {
    label: 'Desabilitado',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    variant: 'secondary' as const
  }
};

interface ChannelRowProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onRestart: () => void;
  onReconnect: () => void;
}

function ChannelRow({ channel, isSelected, onSelect, onEdit, onDelete, onDeactivate, onReactivate, onRestart, onReconnect }: ChannelRowProps) {
  const channelConfig = channelTypes[channel.kind] || channelTypes.whatsapp;
  const status = getChannelStatus(channel);
  const statusInfo = statusConfig[status];
  const IconComponent = channelConfig.icon;

  // Formatação do número de telefone
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '-';
    // Remove o + e formata como (XX) XXXXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) { // +55XXXXXXXXXXX
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <div className="flex items-center gap-6 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
      {/* 1. Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="shrink-0"
      />

      {/* 2. Nome do canal - alinhado à esquerda */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-medium text-slate-900 truncate">{channel.name}</h3>
      </div>

      {/* 3. Tipo do canal (Logo + Nome) - centralizado */}
      <div className="flex items-center justify-center gap-2 w-48 shrink-0">
        <div className={`p-1.5 rounded ${channelConfig.bgColor} ${channelConfig.borderColor} border`}>
          <IconComponent className={`w-4 h-4 ${channelConfig.color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-sm text-slate-700 truncate">{channelConfig.label}</span>
      </div>

      {/* 4. Número do telefone - centralizado */}
      <div className="w-40 shrink-0 text-center">
        <span className="text-sm text-slate-600">
          {formatPhoneNumber(channel.phone_number)}
        </span>
      </div>

      {/* 5. Badge com status - centralizado */}
      <div className="flex items-center justify-center w-32 shrink-0">
        <Badge variant={statusInfo.variant} className={`${statusInfo.color} border`}>
          <div className={`w-2 h-2 rounded-full ${statusInfo.dot} mr-1.5`} />
          {statusInfo.label}
        </Badge>
      </div>

      {/* 6. Ações - todos os botões como ícones */}
      <div className="flex items-center justify-center gap-1 w-48 shrink-0">
        {/* Botões de conexão baseados no status */}
        {status === 'online' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRestart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <WifiOff className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desconectar sessão</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {status === 'offline' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReconnect}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Wifi className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Conectar (abrir modal de sincronização)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {status === 'disabled' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReactivate}
                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                >
                  <Power className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reativar canal</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Separador visual */}
        <div className="w-px h-4 bg-slate-200 mx-1" />

        {/* Ações de edição */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar canal</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {channel.active && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeactivate}
                  className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                >
                  <PowerOff className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desativar canal</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir canal</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function Channels() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  
  // Estados principais
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  // Carregar canais do backend
  const loadChannels = useCallback(async (force = false) => {
    // Evitar múltiplas requisições simultâneas
    if (isLoadingRef) {
      console.log('Requisição já em andamento, ignorando...');
      return;
    }
    
    if (!force && hasLoaded) {
      console.log('Dados já carregados, ignorando...');
      return;
    }
    
    try {
      console.log('Iniciando carregamento de canais para instituição:', selectedInstitution?.name);
      setIsLoadingRef(true);
      setLoading(true);
      
      if (!selectedInstitution?._id) {
        console.log('Nenhuma instituição selecionada, não carregando canais');
        return;
      }
      
      const channelsData = await channelsService.list(selectedInstitution._id);
      console.log('Canais carregados:', channelsData.length);
      
      setChannels(channelsData as Channel[]);
      setHasLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      toast({
        title: "Erro ao carregar canais",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingRef(false);
    }
  }, [selectedInstitution, toast, hasLoaded, isLoadingRef]);

  // Reset hasLoaded quando a instituição mudar
  useEffect(() => {
    console.log('Instituição mudou, resetando hasLoaded');
    setHasLoaded(false);
  }, [selectedInstitution?._id]);

  // Carregar canais na inicialização e quando a instituição mudar
  useEffect(() => {
    console.log('useEffect executado - hasLoaded:', hasLoaded, 'isLoadingRef:', isLoadingRef, 'selectedInstitution:', selectedInstitution?.name);
    if (selectedInstitution?._id && !isLoadingRef && !hasLoaded) {
      loadChannels();
    }
  }, [selectedInstitution?._id, hasLoaded, isLoadingRef, loadChannels]);

  // Filtrar canais
  const filteredChannels = useMemo(() => {
    let filtered = channels;
    
    if (!showInactive) {
      filtered = filtered.filter(channel => channel.active);
    }
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(search) ||
        channelTypes[channel.kind]?.label.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [channels, searchTerm, showInactive]);

  // Handlers de seleção
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedChannels(filteredChannels.map(c => c.id));
    } else {
      setSelectedChannels([]);
    }
  }, [filteredChannels]);

  const handleSelectChannel = useCallback((channelId: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels(prev => [...prev, channelId]);
    } else {
      setSelectedChannels(prev => prev.filter(id => id !== channelId));
    }
  }, []);

  // Handlers de ações
  const handleNewChannel = () => {
    navigate('/settings/channels/new');
  };

  const handleEditChannel = (channelId: string) => {
    // Implementar edição
    console.log('Edit channel:', channelId);
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      if (!selectedInstitution?._id) {
        toast({
          title: "Instituição não selecionada",
          description: "Por favor, selecione uma instituição antes de excluir o canal.",
          variant: "destructive",
        });
        return;
      }

      await channelsService.delete(channelId, selectedInstitution._id);
      toast({
        title: "Canal excluído",
        description: "Canal foi excluído com sucesso.",
      });
      // Recarregar lista
      loadChannels(true);
    } catch (error) {
      console.error('Erro ao excluir canal:', error);
      toast({
        title: "Erro ao excluir canal",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateChannel = async (channelId: string) => {
    try {
      if (!selectedInstitution?._id) {
        toast({
          title: "Instituição não selecionada",
          description: "Por favor, selecione uma instituição antes de desativar o canal.",
          variant: "destructive",
        });
        return;
      }

      await channelsService.deactivate(channelId, selectedInstitution._id);
      toast({
        title: "Canal desativado",
        description: "Canal foi desativado com sucesso. Sessão desconectada se estava ativa.",
      });
      loadChannels(true);
    } catch (error) {
      console.error('Erro ao desativar canal:', error);
      toast({
        title: "Erro ao desativar canal",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleReactivateChannel = async (channelId: string) => {
    try {
      if (!selectedInstitution?._id) {
        toast({
          title: "Instituição não selecionada",
          description: "Por favor, selecione uma instituição antes de reativar o canal.",
          variant: "destructive",
        });
        return;
      }

      await channelsService.activate(channelId, selectedInstitution._id);
      toast({
        title: "Canal reativado",
        description: "Canal foi reativado com sucesso.",
      });
      loadChannels(true);
    } catch (error) {
      console.error('Erro ao reativar canal:', error);
      toast({
        title: "Erro ao reativar canal",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleRestartSession = async (channelId: string) => {
    try {
      if (!selectedInstitution?._id) {
        toast({
          title: "Instituição não selecionada",
          description: "Por favor, selecione uma instituição antes de desconectar a sessão.",
          variant: "destructive",
        });
        return;
      }

      await channelsService.disconnectSession(channelId, selectedInstitution._id);
      toast({
        title: "Sessão desconectada",
        description: "A sessão foi desconectada com sucesso.",
      });
      // Recarregar lista para refletir o novo status
      loadChannels(true);
    } catch (error) {
      console.error('Erro ao desconectar sessão:', error);
      toast({
        title: "Erro ao desconectar sessão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleReconnectChannel = (channelId: string) => {
    // Encontrar o canal para obter suas informações
    const channel = channels.find(c => c.id === channelId);
    
    if (channel) {
      navigate(`/settings/channels/sync`, { 
        state: { 
          channelName: channel.name,
          channelType: channel.kind === 'whatsapp' ? 'whatsapp-business' : channel.kind,
          channelId: channelId
        }
      });
    }
  };

  // Estados de seleção
  const allSelected = selectedChannels.length === filteredChannels.length && filteredChannels.length > 0;
  const someSelected = selectedChannels.length > 0 && selectedChannels.length < filteredChannels.length;

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button 
              onClick={() => navigate('/settings')}
              className="hover:text-slate-700 transition-colors"
            >
              Configurações
            </button>
            <span>/</span>
            <span>Canais de atendimento</span>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Canais de atendimento</h1>
          <p className="text-slate-500">
            Aqui você consegue criar ou gerenciar os canais que sua organização usa para se comunicar com os seus contatos.
          </p>
        </div>

        {/* Card principal */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
          {/* Header do card */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-inactive"
                    checked={showInactive}
                    onCheckedChange={(checked) => setShowInactive(checked === true)}
                  />
                  <label htmlFor="show-inactive" className="text-sm text-slate-600">
                    Mostrar desativados
                  </label>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadChannels(true)}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                <Button onClick={handleNewChannel} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo canal
                </Button>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Carregando canais...</p>
              </div>
            ) : (
              <>
                {/* Header da tabela */}
                <div className="flex items-center gap-6 p-4 bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-600">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) (el as any).indeterminate = someSelected;
                    }}
                    onCheckedChange={handleSelectAll}
                    className="shrink-0"
                  />
                  <div className="flex-1 text-left">Nome</div>
                  <div className="w-48 shrink-0 text-center">Tipo</div>
                  <div className="w-40 shrink-0 text-center">Telefone</div>
                  <div className="w-32 shrink-0 text-center">Status</div>
                  <div className="w-48 shrink-0 text-center">Ações</div>
                </div>

                {/* Linhas da tabela */}
                <div>
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map((channel) => (
                      <ChannelRow
                        key={channel.id}
                        channel={channel}
                        isSelected={selectedChannels.includes(channel.id)}
                        onSelect={(checked) => handleSelectChannel(channel.id, checked)}
                        onEdit={() => handleEditChannel(channel.id)}
                        onDelete={() => handleDeleteChannel(channel.id)}
                        onDeactivate={() => handleDeactivateChannel(channel.id)}
                        onReactivate={() => handleReactivateChannel(channel.id)}
                        onRestart={() => handleRestartSession(channel.id)}
                        onReconnect={() => handleReconnectChannel(channel.id)}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Radio className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        Nenhum canal encontrado
                      </h3>
                      <p className="text-slate-500 mb-4">
                        {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando seu primeiro canal de atendimento.'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={handleNewChannel} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo canal
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}