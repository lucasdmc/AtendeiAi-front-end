import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  GripVertical,
  MoreVertical,
  Settings2,
  CircleX,
  X,
  Check,
  User,
  Shield,
  Crown,
  Users2,
  AlertTriangle,
  Mail,
  CircleHelp,
  ChevronsUpDown
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';

// Tipos
type Permission = 'MEMBER' | 'OPERATOR' | 'ADMIN' | 'OWNER';
type Reassignment = 'OFF' | 'AUTO' | 'ALWAYS';
type AgentStatus = 'online' | 'offline' | 'disabled';
type AccessAllFlag = 'ALL_CURRENT_AND_FUTURE';

interface Agent {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  isYou?: boolean;
  status: AgentStatus;
  permission: Permission;
  reassignment: Reassignment;
  order: number;
}

interface Sector {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
}

interface InviteAccess {
  sectors: AccessAllFlag | string[];
  channels: AccessAllFlag | string[];
  qrChannels: string[];
  reports: 'OWN' | 'ALL';
}

interface InviteAccessState {
  allowAllSectors: boolean;
  selectedSectorIds: string[];
  allowAllChannels: boolean;
  selectedChannelIds: string[];
  selectedQrChannelIds: string[];
  reportsAccess: 'OWN' | 'ALL';
  contactsAccess: 'ALLOWED_CHANNELS' | 'ALL';
  quickRepliesAccess: 'CREATE_EDIT_PLUS_1' | 'CREATE_EDIT' | 'DELETE';
  additionalPermissions: string[];
}

// Dados dos selects
const permissionOptions = [
  {
    value: 'MEMBER' as Permission,
    icon: User,
    title: 'Membro',
    description: 'Não é capaz de alterar nenhuma configuração, e não consegue enviar mensagens para contatos.'
  },
  {
    value: 'OPERATOR' as Permission,
    icon: Users2,
    title: 'Operador',
    description: 'É capaz de enviar mensagens para contatos e pode alterar configurações básicas que são úteis aos atendentes.'
  },
  {
    value: 'ADMIN' as Permission,
    icon: Shield,
    title: 'Admin',
    description: 'Tem todas as permissões na ferramenta, porém não tem acesso ao painel financeiro.'
  },
  {
    value: 'OWNER' as Permission,
    icon: Crown,
    title: 'Proprietário',
    description: 'Tem todas as permissões na ferramenta e tem acesso ao painel financeiro.'
  }
];

const reassignmentOptions = [
  {
    value: 'OFF' as Reassignment,
    icon: CircleX,
    title: 'Desligada',
    description: 'Nunca será removido automaticamente dos chats.'
  },
  {
    value: 'AUTO' as Reassignment,
    icon: Settings2,
    title: 'Automática',
    description: 'Será removido se estiver offline; no Umbler Talk, app fechado/minimizado/aba inativa = offline.'
  },
  {
    value: 'ALWAYS' as Reassignment,
    icon: AlertTriangle,
    title: 'Sempre',
    description: 'Será sempre removido do chat ao chegar nova mensagem, online ou não.'
  }
];

// Dados mock
const mockSectors: Sector[] = [
  { id: 's1', name: 'Geral' },
  { id: 's2', name: 'Comercial' },
  { id: 's3', name: 'Suporte' }
];

const mockChannels: Channel[] = [
  { id: 'c1', name: 'Vendas' },
  { id: 'c2', name: 'Suporte' },
  { id: 'c3', name: 'WhatsApp 01' }
];

const reportsOptions = [
  {
    value: 'OWN' as const,
    title: 'Relatórios do próprio atendente',
    description: 'Acesso apenas aos próprios relatórios'
  },
  {
    value: 'ALL' as const,
    title: 'Todos os relatórios',
    description: 'Acesso a todos os relatórios da organização'
  }
];

const contactsOptions = [
  {
    value: 'ALLOWED_CHANNELS' as const,
    title: 'Contatos em canais que o atendente tem acesso',
    description: 'Acesso limitado aos contatos dos canais permitidos'
  },
  {
    value: 'ALL' as const,
    title: 'Todos os contatos',
    description: 'Acesso a todos os contatos da organização'
  }
];

const quickRepliesOptions = [
  {
    value: 'CREATE_EDIT_PLUS_1' as const,
    title: 'Criar, Editar, + 1',
    description: 'Pode criar, editar suas respostas e usar todas'
  },
  {
    value: 'CREATE_EDIT' as const,
    title: 'Criar, Editar',
    description: 'Pode criar e editar apenas suas respostas'
  },
  {
    value: 'DELETE' as const,
    title: 'Deletar',
    description: 'Pode deletar respostas rápidas'
  }
];

// Lista de permissões adicionais
const additionalPermissions = [
  { id: 'templates', label: 'Permitir ações em templates' },
  { id: 'notes', label: 'Permitir apagar mensagens/notas' },
  { id: 'tags', label: 'Permitir ações em etiquetas' },
  { id: 'sectors', label: 'Permitir ações em setores' },
  { id: 'channels', label: 'Permitir ações em canais' },
  { id: 'chatbots', label: 'Permitir ações em chatbots' },
  { id: 'ai_agents', label: 'Permitir ações em agentes de ia' },
  { id: 'attendants', label: 'Permitir ações em atendentes' },
  { id: 'invite_attendants', label: 'Permitir convidar atendentes' },
  { id: 'webhooks', label: 'Permitir ações em webhooks' },
  { id: 'organizations', label: 'Permitir ações em organizações' },
  { id: 'custom_fields', label: 'Permitir ações em campos personalizados' },
  { id: 'bulk_send', label: 'Permitir envios em massa' },
  { id: 'contact_board', label: 'Permitir ações em board de contatos' },
  { id: 'contacts', label: 'Permitir ações em contatos' },
  { id: 'chat_with_ias', label: 'Permitir chat com ias' },
  { id: 'scheduled_messages', label: 'Permitir visualização geral de mensagens agendadas' },
  { id: 'attendant_groups', label: 'Permitir ações em grupos entre atendentes' }
];

// Função para converter estado interno para payload de saída
function toInviteAccessState(state: InviteAccessState): InviteAccess {
  return {
    sectors: state.allowAllSectors ? 'ALL_CURRENT_AND_FUTURE' : state.selectedSectorIds,
    channels: state.allowAllChannels ? 'ALL_CURRENT_AND_FUTURE' : state.selectedChannelIds,
    qrChannels: state.selectedQrChannelIds,
    reports: state.reportsAccess,
  };
}

// Componente multi-select para setores/canais
interface MultiSelectProps {
  items: Sector[] | Channel[];
  selectedIds: string[];
  allowAll: boolean;
  onSelectionChange: (selectedIds: string[], allowAll: boolean) => void;
  placeholder: string;
  allLabel: string;
}

function MultiSelect({ 
  items, 
  selectedIds, 
  allowAll, 
  onSelectionChange, 
  placeholder,
  allLabel 
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleToggleItem = (itemId: string) => {
    const newSelectedIds = selectedIds.includes(itemId)
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];
    
    onSelectionChange(newSelectedIds, false);
  };

  const handleToggleAll = () => {
    onSelectionChange([], !allowAll);
  };

  const handleClearSelection = () => {
    onSelectionChange([], false);
  };

  const getDisplayText = () => {
    if (allowAll) {
      return allLabel;
    }
    
    if (selectedIds.length === 0) {
      return placeholder;
    }
    
    if (selectedIds.length <= 2) {
      return items
        .filter(item => selectedIds.includes(item.id))
        .map(item => item.name)
        .join(', ');
    }
    
    const firstTwo = items
      .filter(item => selectedIds.includes(item.id))
      .slice(0, 2)
      .map(item => item.name)
      .join(', ');
    
    return `${firstTwo} +${selectedIds.length - 2}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleToggleItem(item.id)}
                  className="flex items-center gap-2"
                >
                  <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                    selectedIds.includes(item.id) && !allowAll ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  }`}>
                    {selectedIds.includes(item.id) && !allowAll && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {item.name}
                </CommandItem>
              ))}
              <CommandItem
                onSelect={handleToggleAll}
                className="flex items-center gap-2 border-t mt-2 pt-2"
              >
                <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                  allowAll ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                }`}>
                  {allowAll && <Check className="h-3 w-3 text-white" />}
                </div>
                {allLabel}
              </CommandItem>
            </CommandGroup>
          </CommandList>
          {selectedIds.length > 0 && !allowAll && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Componente de Select customizado
interface CustomSelectProps {
  value: Permission | Reassignment;
  options: typeof permissionOptions | typeof reassignmentOptions;
  onValueChange: (value: Permission | Reassignment) => void;
  disabled?: boolean;
}

function CustomSelect({ value, options, onValueChange, disabled }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full h-11">
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2">
              <selectedOption.icon className="h-4 w-4" />
              <span>{selectedOption.title}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="py-3">
            <div className="flex items-start gap-3">
              <option.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{option.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 max-w-xs">
                  {option.description}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Componente de linha sortable
interface SortableRowProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdatePermission: (permission: Permission) => void;
  onUpdateReassignment: (reassignment: Reassignment) => void;
  onDeactivate: () => void;
}

function SortableRow({ 
  agent, 
  isSelected, 
  onSelect, 
  onUpdatePermission, 
  onUpdateReassignment, 
  onDeactivate 
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isDisabled = agent.status === 'disabled';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[48px_48px_1.5fr_1fr_1fr_120px] items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${
        isDisabled ? 'opacity-60' : ''
      }`}
    >
      {/* Coluna 1 - Checkbox */}
      <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelect(!!checked)}
                      disabled={isDisabled}
                    />
      </div>

      {/* Coluna 2 - Handle de arrastar */}
      <div className="flex items-center justify-center">
        <button
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
          disabled={isDisabled}
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Coluna 3 - Atendente */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agent.photoUrl} alt={agent.name} />
            <AvatarFallback className="bg-slate-100 text-slate-600">
              {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div 
            className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
              agent.status === 'online' ? 'bg-green-500' : 'bg-slate-400'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{agent.name}</span>
            {agent.isYou && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5"
                    >
                      Você
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Esta é a sua conta</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-sm text-slate-500 truncate">{agent.email}</div>
        </div>
      </div>

      {/* Coluna 4 - Permissão */}
      <div>
        <CustomSelect
          value={agent.permission}
          options={permissionOptions}
          onValueChange={(value) => onUpdatePermission(value as Permission)}
          disabled={isDisabled}
        />
      </div>

      {/* Coluna 5 - Reatribuição */}
      <div>
        <CustomSelect
          value={agent.reassignment}
          options={reassignmentOptions}
          onValueChange={(value) => onUpdateReassignment(value as Reassignment)}
          disabled={isDisabled}
        />
      </div>

      {/* Coluna 6 - Ações */}
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings2 className="h-4 w-4 mr-2" />
              Editar permissões
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeactivate} className="text-red-600">
              <CircleX className="h-4 w-4 mr-2" />
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Attendants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'EdnadePaula',
      email: 'ednadepaulasp@gmail.com',
      status: 'online',
      permission: 'OPERATOR',
      reassignment: 'OFF',
      order: 0
    },
    {
      id: '2',
      name: 'PauloRobertoBJunior',
      email: 'pauloroberto.batistamail@gmail.com',
      isYou: true,
      status: 'offline',
      permission: 'OWNER',
      reassignment: 'OFF',
      order: 1
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'invite'>('list');
  
  // Estados dos modais
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivatingAgent, setDeactivatingAgent] = useState<Agent | null>(null);
  
  // Estados do formulário de convite
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<Permission>('OPERATOR');
  const [useDefaultConfig, setUseDefaultConfig] = useState(true);
  const [advancedAccess, setAdvancedAccess] = useState<InviteAccessState>({
    allowAllSectors: true,
    selectedSectorIds: [],
    allowAllChannels: true,
    selectedChannelIds: [],
    selectedQrChannelIds: [],
    reportsAccess: 'OWN',
    contactsAccess: 'ALLOWED_CHANNELS',
    quickRepliesAccess: 'CREATE_EDIT_PLUS_1',
    additionalPermissions: []
  });
  
  // Estados do modal de desativação
  const [removeFromChats, setRemoveFromChats] = useState(true);
  const [closeAllChats, setCloseAllChats] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar agentes
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showDisabled || agent.status !== 'disabled';
    return matchesSearch && matchesStatus;
  });

  // Handlers de seleção
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAgents(filteredAgents.map(a => a.id));
      } else {
      setSelectedAgents([]);
    }
  }, [filteredAgents]);

  const handleSelectAgent = useCallback((agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  }, []);

  // Handler de reordenação
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setAgents((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        toast({
          title: "Ordem atualizada",
          description: "A ordem dos atendentes foi alterada com sucesso.",
        });

        return newOrder;
      });
    }
  }, [toast]);

  // Handlers de ações
  const handleUpdatePermission = useCallback((agentId: string, permission: Permission) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, permission } : a
    ));

    const agent = agents.find(a => a.id === agentId);
          toast({
      title: "Permissão atualizada",
      description: `A permissão de "${agent?.name}" foi alterada com sucesso.`,
    });
  }, [agents, toast]);

  const handleUpdateReassignment = useCallback((agentId: string, reassignment: Reassignment) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, reassignment } : a
    ));

    const agent = agents.find(a => a.id === agentId);
          toast({
      title: "Reatribuição atualizada",
      description: `A configuração de reatribuição de "${agent?.name}" foi alterada.`,
    });
  }, [agents, toast]);

  const handleInviteAgent = useCallback(() => {
    if (!inviteEmail.trim()) return;

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(inviteEmail)) {
        toast({
        title: "Email inválido",
        description: "Por favor, digite um email válido.",
          variant: "destructive",
        });
      return;
    }

    const emailExists = agents.some(a => 
      a.email.toLowerCase() === inviteEmail.trim().toLowerCase()
    );

    if (emailExists) {
      toast({
        title: "Email já cadastrado",
        description: "Já existe um atendente com este email.",
        variant: "destructive",
      });
      return;
    }

    // Validações para configuração avançada
    if (!useDefaultConfig) {
      // Validar se QR channels estão dentro dos canais permitidos
      const availableChannels = advancedAccess.allowAllChannels 
        ? mockChannels.map(c => c.id)
        : advancedAccess.selectedChannelIds;
      
      const invalidQrChannels = advancedAccess.selectedQrChannelIds.filter(
        qrId => !availableChannels.includes(qrId)
      );

      if (invalidQrChannels.length > 0) {
        // Corrigir automaticamente removendo QR channels inválidos
        setAdvancedAccess(prev => ({
          ...prev,
          selectedQrChannelIds: prev.selectedQrChannelIds.filter(
            qrId => availableChannels.includes(qrId)
          )
        }));

        toast({
          title: "Configuração corrigida",
          description: "Alguns canais de QR Code foram removidos pois não estão nos canais de acesso.",
        });
        return;
      }
    }

    const accessConfig = useDefaultConfig 
      ? {
          sectors: 'ALL_CURRENT_AND_FUTURE' as AccessAllFlag,
          channels: 'ALL_CURRENT_AND_FUTURE' as AccessAllFlag,
          qrChannels: [],
          reports: 'OWN' as const
        }
      : toInviteAccessState(advancedAccess);

    const newAgent: Agent = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      status: 'offline',
      permission: invitePermission,
      reassignment: 'OFF',
      order: agents.length
    };

    setAgents(prev => [...prev, newAgent]);
    setInviteEmail('');
    setInvitePermission('OPERATOR');
    setUseDefaultConfig(true);
    setAdvancedAccess({
      allowAllSectors: true,
      selectedSectorIds: [],
      allowAllChannels: true,
      selectedChannelIds: [],
      selectedQrChannelIds: [],
      reportsAccess: 'OWN',
      contactsAccess: 'ALLOWED_CHANNELS',
      quickRepliesAccess: 'CREATE_EDIT_PLUS_1',
      additionalPermissions: []
    });
    setViewMode('list');

    toast({
      title: "Convite enviado",
      description: `Um convite foi enviado para ${inviteEmail}`,
    });

    console.log('Configurações de acesso:', accessConfig);
  }, [inviteEmail, invitePermission, useDefaultConfig, advancedAccess, agents, toast]);

  const handleDeactivateAgent = useCallback(() => {
    if (!deactivatingAgent || deactivateConfirmText !== `Desativar ${deactivatingAgent.name}`) return;

    setAgents(prev => prev.map(a => 
      a.id === deactivatingAgent.id 
        ? { ...a, status: 'disabled' as AgentStatus }
        : a
    ));

    setIsDeactivateModalOpen(false);
    setDeactivatingAgent(null);
    setDeactivateConfirmText('');
    setRemoveFromChats(true);
    setCloseAllChats(false);

    toast({
      title: "Atendente desativado",
      description: `"${deactivatingAgent.name}" foi desativado com sucesso.`,
    });
  }, [deactivatingAgent, deactivateConfirmText, toast]);

  // Handlers dos modais
  const openDeactivateModal = useCallback((agent: Agent) => {
    setDeactivatingAgent(agent);
    setDeactivateConfirmText('');
    setRemoveFromChats(true);
    setCloseAllChats(false);
    setIsDeactivateModalOpen(true);
  }, []);

  const allSelected = selectedAgents.length === filteredAgents.length && filteredAgents.length > 0;
  const someSelected = selectedAgents.length > 0 && selectedAgents.length < filteredAgents.length;

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
            <span>Atendentes</span>
        </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Atendentes</h1>
          <p className="text-slate-500">
            Aqui você consegue criar ou gerenciar as pessoas que lhe ajudam com o relacionamento com seus contatos.
          </p>
            </div>

        {/* Card principal */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          {viewMode === 'list' ? (
            <>
              {/* Barra superior - Search + Switch + Botão */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-disabled"
                      checked={showDisabled}
                      onCheckedChange={setShowDisabled}
                    />
                    <Label htmlFor="show-disabled" className="text-sm">
                      Mostrar desativados
                    </Label>
                  </div>
                </div>
                <Button 
                  onClick={() => setViewMode('invite')}
                  className="h-11 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar atendente
                </Button>
              </div>

              {/* Tabela */}
              <div>
                {/* Header da tabela */}
                <div className="grid grid-cols-[48px_48px_1.5fr_1fr_1fr_120px] items-center px-4 py-3 text-slate-500 text-sm font-medium border-b border-slate-100">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
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
                  <div>Atendente</div>
                  <div>Permissão</div>
                  <div>Reatribuição</div>
                  <div className="text-right">Ações</div>
      </div>

                {/* Corpo da tabela com Drag & Drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredAgents.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredAgents.length === 0 ? (
                      <div className="flex items-center justify-center py-12 text-slate-500">
                        <div className="text-center">
                          <p className="mb-2">Nenhum atendente encontrado</p>
                          {searchTerm && (
                            <p className="text-sm">Tente ajustar sua busca</p>
                          )}
            </div>
            </div>
                    ) : (
                      filteredAgents.map((agent) => (
                        <SortableRow
                          key={agent.id}
                          agent={agent}
                          isSelected={selectedAgents.includes(agent.id)}
                          onSelect={(checked) => handleSelectAgent(agent.id, checked)}
                          onUpdatePermission={(permission) => handleUpdatePermission(agent.id, permission as Permission)}
                          onUpdateReassignment={(reassignment) => handleUpdateReassignment(agent.id, reassignment as Reassignment)}
                          onDeactivate={() => openDeactivateModal(agent)}
                        />
                      ))
                    )}
                  </SortableContext>
                </DndContext>
          </div>
            </>
          ) : (
            /* Formulário de convite */
            <>
              {/* Header do formulário */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">Novo convite</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
          </Button>
        </div>

              {/* Formulário */}
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="invite-email" className="text-sm font-medium text-slate-700">
                    Email do atendente <span className="text-red-500">*</span>
                  </Label>
              <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    className="mt-1 h-12"
              />
            </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Permissão</Label>
                  <div className="mt-1">
                    <CustomSelect
                      value={invitePermission}
                      options={permissionOptions}
                      onValueChange={(value) => setInvitePermission(value as Permission)}
                    />
          </div>
                </div>

                {/* Checkbox Configuração Padrão */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Checkbox
                    id="default-config"
                    checked={useDefaultConfig}
                    onCheckedChange={(checked) => setUseDefaultConfig(!!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="default-config" className="font-medium text-slate-900 cursor-pointer">
                      Configuração padrão
                    </Label>
                    <div className="text-sm text-slate-600 mt-1">
                      Acesso a todos os setores e canais, atuais e futuros, exceto QR codes, 
                      relatórios do próprio atendente, contatos nos canais permitidos ao atendente 
                      e edição de templates.
                    </div>
          </div>
        </div>

                {/* Seção Configurar Acessos - aparece quando Configuração padrão está desmarcada */}
                <div className={`transition-all duration-300 ease-in-out ${
                  useDefaultConfig 
                    ? 'opacity-0 max-h-0 overflow-hidden' 
                    : 'opacity-100 max-h-[2000px]'
                }`}>
                  <div className="space-y-6 pt-2">
                    <div>
                      <h3 className="text-lg font-medium text-blue-600 mb-4">Configurar acessos</h3>
                      
                      {/* Acesso aos setores */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Acesso aos setores
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Defina quais setores o atendente terá acesso</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                          <MultiSelect
                            items={mockSectors}
                            selectedIds={advancedAccess.selectedSectorIds}
                            allowAll={advancedAccess.allowAllSectors}
                            onSelectionChange={(selectedIds, allowAll) => 
                              setAdvancedAccess(prev => ({
                                ...prev,
                                allowAllSectors: allowAll,
                                selectedSectorIds: selectedIds
                              }))
                            }
                            placeholder="Selecione os setores"
                            allLabel="Todos os atuais e futuros"
                          />
                        </div>

                        {/* Acesso aos canais */}
                            <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Acesso aos canais
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Defina quais canais o atendente terá acesso</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            </div>
                          <MultiSelect
                            items={mockChannels}
                            selectedIds={advancedAccess.selectedChannelIds}
                            allowAll={advancedAccess.allowAllChannels}
                            onSelectionChange={(selectedIds, allowAll) => {
                              setAdvancedAccess(prev => ({
                                ...prev,
                                allowAllChannels: allowAll,
                                selectedChannelIds: selectedIds,
                                // Limpar QR channels se não estiverem mais disponíveis
                                selectedQrChannelIds: allowAll 
                                  ? prev.selectedQrChannelIds
                                  : prev.selectedQrChannelIds.filter(qrId => selectedIds.includes(qrId))
                              }));
                            }}
                            placeholder="Selecione os canais"
                            allLabel="Todos os atuais e futuros"
                          />
                          </div>

                        {/* Liberar leitura de QRCode nos canais */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Liberar leitura de QRCode nos canais
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Canais onde o atendente pode ler QR codes</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            </div>
                          <MultiSelect
                            items={
                              advancedAccess.allowAllChannels 
                                ? mockChannels 
                                : mockChannels.filter(c => advancedAccess.selectedChannelIds.includes(c.id))
                            }
                            selectedIds={advancedAccess.selectedQrChannelIds}
                            allowAll={false}
                            onSelectionChange={(selectedIds) => 
                              setAdvancedAccess(prev => ({
                                ...prev,
                                selectedQrChannelIds: selectedIds
                              }))
                            }
                            placeholder="Nenhum canal"
                            allLabel=""
                          />
                            </div>

                        {/* Acesso aos relatórios */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Acesso aos relatórios
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Defina o nível de acesso aos relatórios</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={advancedAccess.reportsAccess} 
                            onValueChange={(value: 'OWN' | 'ALL') => 
                              setAdvancedAccess(prev => ({ ...prev, reportsAccess: value }))
                            }
                          >
                            <SelectTrigger className="w-full h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {reportsOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="py-3">
                                  <div>
                                    <div className="font-medium">{option.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {option.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Acesso aos contatos */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Acesso aos contatos
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Defina o nível de acesso aos contatos</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={advancedAccess.contactsAccess} 
                            onValueChange={(value: 'ALLOWED_CHANNELS' | 'ALL') => 
                              setAdvancedAccess(prev => ({ ...prev, contactsAccess: value }))
                            }
                          >
                            <SelectTrigger className="w-full h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {contactsOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="py-3">
                                  <div>
                                    <div className="font-medium">{option.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {option.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Acesso às respostas rápidas */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium text-slate-700">
                              Acesso às respostas rápidas
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleHelp className="h-4 w-4 text-slate-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Defina as permissões para respostas rápidas</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={advancedAccess.quickRepliesAccess} 
                            onValueChange={(value: 'CREATE_EDIT_PLUS_1' | 'CREATE_EDIT' | 'DELETE') => 
                              setAdvancedAccess(prev => ({ ...prev, quickRepliesAccess: value }))
                            }
                          >
                            <SelectTrigger className="w-full h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {quickRepliesOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="py-3">
                                  <div>
                                    <div className="font-medium">{option.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {option.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Permissões adicionais (checkboxes) */}
                        <div className="pt-4 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">
                            Permissões adicionais
                          </h4>
                          <div className="space-y-3">
                            {additionalPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={advancedAccess.additionalPermissions.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setAdvancedAccess(prev => ({
                                        ...prev,
                                        additionalPermissions: [...prev.additionalPermissions, permission.id]
                                      }));
                                    } else {
                                      setAdvancedAccess(prev => ({
                                        ...prev,
                                        additionalPermissions: prev.additionalPermissions.filter(id => id !== permission.id)
                                      }));
                                    }
                                  }}
                                />
                                <Label 
                                  htmlFor={`permission-${permission.id}`} 
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {permission.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                            <Button
                    onClick={handleInviteAgent}
                    disabled={!inviteEmail.trim()}
                    className="w-full h-12 rounded-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar convite
                            </Button>
                            <Button
                    variant="ghost"
                    onClick={() => setViewMode('list')}
                    className="w-full"
                  >
                    Cancelar
                            </Button>
                          </div>
              </div>
            </>
                  )}
            </div>
      </div>

      {/* Modal Desativar Atendente */}
      <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CircleX className="h-5 w-5 text-red-500" />
              Desativar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-slate-700">
              Tem certeza que deseja desativar o atendente{' '}
              <span className="font-semibold text-blue-600">{deactivatingAgent?.name}</span>?
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-from-chats"
                  checked={removeFromChats}
                  onCheckedChange={(checked) => setRemoveFromChats(!!checked)}
                />
                <Label htmlFor="remove-from-chats" className="text-sm">
                  Remover {deactivatingAgent?.name} de suas conversas abertas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="close-all-chats"
                  checked={closeAllChats}
                  onCheckedChange={(checked) => setCloseAllChats(!!checked)}
                />
                <Label htmlFor="close-all-chats" className="text-sm">
                  Finalizar todas as conversas de {deactivatingAgent?.name}
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="deactivate-confirm" className="text-sm font-medium text-slate-700">
                Digite <span className="font-semibold">Desativar {deactivatingAgent?.name}</span> para continuar
              </Label>
              <Input
                id="deactivate-confirm"
                type="text"
                value={deactivateConfirmText}
                onChange={(e) => setDeactivateConfirmText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
                <Button
                  type="button"
              variant="ghost"
              onClick={() => setIsDeactivateModalOpen(false)}
                >
                  Cancelar
                </Button>
            <Button
              onClick={handleDeactivateAgent}
              disabled={deactivateConfirmText !== `Desativar ${deactivatingAgent?.name}`}
              variant="destructive"
            >
              Confirmar
                </Button>
              </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}