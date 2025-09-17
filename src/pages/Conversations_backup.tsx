import React, { useState } from "react"
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Phone, 
  MoreVertical,
  Check,
  CheckCheck,
  Smile,
  UserCheck,
  Bot,
  Users,
  Paperclip,
  Building2,
  Mic,
  X,
  Clock,
  FileText,
  Download,
  Home,
  Calendar,
  Menu,
  LogOut,
  Share,
  Folder,
  Plus,
  Edit,
  Trash2,
  Tag,
  Palette,
  Filter
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dados mock simples para visualização
const mockConversations = [
  {
    id: '1',
    customer_phone: '(48) 99999-9999',
    customer_name: 'Maria Silva',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: null, // IA
    lastMessage: 'Olá, gostaria de agendar uma consulta',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    unreadCount: 2
  },
  {
    id: '2',
    customer_phone: '(48) 88888-8888',
    customer_name: 'João Santos',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: 'user1', // Manual
    lastMessage: 'Muito obrigado pelo atendimento!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    unreadCount: 0
  },
  {
    id: '3',
    customer_phone: '(48) 77777-7777',
    customer_name: 'Ana Costa',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: null, // IA
    lastMessage: 'Preciso remarcar minha consulta',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    unreadCount: 1
  }
];

const mockMessages = [
  {
    id: '1',
    sender_type: 'customer',
    content: 'Olá, gostaria de agendar uma consulta',
    timestamp: new Date().toISOString(),
    customer_name: 'Maria Silva'
  },
  {
    id: '2',
    sender_type: 'bot',
    content: 'Olá Maria! Claro, vou te ajudar com o agendamento. Qual especialidade você precisa?',
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    sender_type: 'customer',
    content: 'Preciso de uma consulta com cardiologista',
    timestamp: new Date().toISOString(),
    customer_name: 'Maria Silva'
  },
  {
    id: '4',
    sender_type: 'bot',
    content: 'Perfeito! Temos disponibilidade com Dr. João para esta semana. Gostaria de ver os horários?',
    timestamp: new Date().toISOString()
  }
];

const mockPatientInfo = {
  name: 'Maria Silva',
  age: 34,
  phone: '+55 47 9719-2447',
  insurance: 'Unimed',
  status: 'Recado',
  description: "Don't tread on me. 😤",
  files: [
    { id: '1', type: 'image', name: 'Exame_Sangue_2024.jpg', url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=100&h=100&fit=crop', date: '15/03/2024' },
    { id: '2', type: 'image', name: 'Raio_X_Torax.jpg', url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=100&h=100&fit=crop', date: '10/03/2024' },
    { id: '3', type: 'document', name: 'Receita_Medica.pdf', url: '#', date: '08/03/2024' },
    { id: '4', type: 'document', name: 'Relatorio_Consulta.pdf', url: '#', date: '05/03/2024' },
    { id: '5', type: 'image', name: 'Ultrassom.jpg', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', date: '02/03/2024' }
  ]
};

// Sistema de Flags
interface Flag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

const mockFlags: Flag[] = [
  { id: '1', name: 'Manual', color: '#3B82F6', description: 'Atendimento manual por humano', createdAt: '2024-01-15' },
  { id: '2', name: 'Urgente', color: '#EF4444', description: 'Conversa que precisa de atenção imediata', createdAt: '2024-01-15' },
  { id: '3', name: 'Agendamento', color: '#10B981', description: 'Relacionado a agendamentos de consultas', createdAt: '2024-01-16' },
  { id: '4', name: 'Financeiro', color: '#F59E0B', description: 'Questões de pagamento e faturamento', createdAt: '2024-01-16' },
  { id: '5', name: 'Suporte', color: '#8B5CF6', description: 'Suporte técnico e dúvidas', createdAt: '2024-01-17' }
];

const colorOptions = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cinza', value: '#6B7280' }
];

// Sistema de Templates
interface Template {
  id: string;
  name: string;
  content: string;
  category: 'saudacao' | 'agendamento' | 'financeiro' | 'despedida' | 'outro';
  createdAt: string;
  usageCount: number;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Saudação Inicial',
    content: 'Olá! Bem-vindo(a) à nossa clínica. Como posso ajudá-lo(a) hoje?',
    category: 'saudacao',
    createdAt: '2024-01-15',
    usageCount: 45
  },
  {
    id: '2',
    name: 'Agendamento Disponível',
    content: 'Temos horários disponíveis para esta semana. Gostaria de agendar uma consulta? Por favor, me informe sua preferência de dia e horário.',
    category: 'agendamento',
    createdAt: '2024-01-16',
    usageCount: 32
  },
  {
    id: '3',
    name: 'Informações de Pagamento',
    content: 'Para finalizar seu agendamento, precisamos confirmar a forma de pagamento. Aceitamos dinheiro, cartão ou convênio médico.',
    category: 'financeiro',
    createdAt: '2024-01-17',
    usageCount: 18
  },
  {
    id: '4',
    name: 'Despedida Padrão',
    content: 'Obrigado(a) pelo contato! Estamos sempre à disposição. Tenha um ótimo dia! 😊',
    category: 'despedida',
    createdAt: '2024-01-18',
    usageCount: 28
  }
];

const templateCategories = [
  { value: 'saudacao', label: 'Saudação', color: '#10B981' },
  { value: 'agendamento', label: 'Agendamento', color: '#3B82F6' },
  { value: 'financeiro', label: 'Financeiro', color: '#F59E0B' },
  { value: 'despedida', label: 'Despedida', color: '#8B5CF6' },
  { value: 'outro', label: 'Outro', color: '#6B7280' }
];

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [conversationMessages, setConversationMessages] = useState(mockMessages)
  const [showContactInfo, setShowContactInfo] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Tudo')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [virtualAssistantActive, setVirtualAssistantActive] = useState(true)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const [filesModalOpen, setFilesModalOpen] = useState(false)
  const [flagsModalOpen, setFlagsModalOpen] = useState(false)
  const [newFlagName, setNewFlagName] = useState('')
  const [newFlagColor, setNewFlagColor] = useState('#3B82F6')
  const [flags, setFlags] = useState<Flag[]>(mockFlags)
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [selectedFilterFlags, setSelectedFilterFlags] = useState<string[]>([])
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('outro')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', description: 'Visão geral do sistema' },
    { path: '/conversations', icon: MessageSquare, label: 'Conversas', description: 'Chat e atendimento' },
    { path: '/appointments', icon: Calendar, label: 'Agendamentos', description: 'Consultas e compromissos' },
    { path: '/agenda', icon: Calendar, label: 'Agenda', description: 'Calendário completo' },
    { path: '/users', icon: Users, label: 'Usuários', description: 'Gestão de usuários' },
    { path: '/clinics', icon: Building2, label: 'Clínicas', description: 'Gestão de clínicas' },
    { path: '/context', icon: FileText, label: 'Contexto', description: 'Configuração do bot' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const selectedClinic = { id: '1', name: 'Clínica Demo' };

  const filteredConversations = mockConversations.filter(conversation => {
    // Filtro por busca
    const matchesSearch = conversation.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo
    let matchesFilter = true;
    if (activeFilter === 'Manual') {
      matchesFilter = !!conversation.assigned_user_id;
    } else if (activeFilter === 'IA') {
      matchesFilter = !conversation.assigned_user_id;
    } else if (activeFilter === 'Não lidas') {
      matchesFilter = (conversation.unreadCount || 0) > 0;
    } else if (activeFilter === 'Flags Personalizadas') {
      // Para flags personalizadas, por enquanto mostra todas (será implementado quando conectar com backend)
      matchesFilter = true;
    }
    // 'Tudo' sempre retorna true
    
    return matchesSearch && matchesFilter;
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Função para obter a flag padrão baseada no tipo de atendimento
  const getStandardFlag = (conversation: any) => {
    if (conversation.assigned_user_id) {
      return {
        name: 'Manual',
        color: '#3B82F6', // Azul
        icon: Users
      };
    } else {
      return {
        name: 'IA',
        color: '#10B981', // Verde
        icon: Bot
      };
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      sender_type: 'bot' as const,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setConversationMessages(prev => [...prev, newMsg]);
    setNewMessage("");
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTemplatesClick = () => {
    setTemplatesModalOpen(true);
  };

  const handleScheduleMessageClick = () => {
    alert('Abrindo agendador de mensagens...');
  };

  const handleFlagsClick = () => {
    setFlagsModalOpen(true);
  };

  const handleCreateFlag = () => {
    if (!newFlagName.trim()) return;
    
    const newFlag: Flag = {
      id: Date.now().toString(),
      name: newFlagName.trim(),
      color: newFlagColor,
      description: '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setFlags(prev => [...prev, newFlag]);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
    alert(`Flag "${newFlag.name}" criada com sucesso!`);
  };

  const handleEditFlag = (flag: Flag) => {
    setEditingFlag(flag);
    setNewFlagName(flag.name);
    setNewFlagColor(flag.color);
  };

  const handleUpdateFlag = () => {
    if (!editingFlag || !newFlagName.trim()) return;
    
    setFlags(prev => prev.map(flag => 
      flag.id === editingFlag.id 
        ? { ...flag, name: newFlagName.trim(), color: newFlagColor }
        : flag
    ));
    
    setEditingFlag(null);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
    alert(`Flag "${newFlagName}" atualizada com sucesso!`);
  };

  const handleDeleteFlag = (flagId: string) => {
    const flag = flags.find(f => f.id === flagId);
    if (flag && window.confirm(`Tem certeza que deseja deletar a flag "${flag.name}"?`)) {
      setFlags(prev => prev.filter(f => f.id !== flagId));
      alert(`Flag "${flag.name}" deletada com sucesso!`);
    }
  };

  const cancelFlagEdit = () => {
    setEditingFlag(null);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
  };

  const handleFilterClick = (filter: string) => {
    if (filter === 'Flags Personalizadas') {
      setFilterModalOpen(true);
    } else {
      setActiveFilter(filter);
    }
  };

  const applyCustomFilters = () => {
    setActiveFilter('Flags Personalizadas');
    setFilterModalOpen(false);
    
    if (selectedFilterFlags.length > 0) {
      const flagNames = selectedFilterFlags.map(id => flags.find(f => f.id === id)?.name).join(', ');
      alert(`Filtros aplicados: ${flagNames}`);
    }
  };

  // Funções de gerenciamento de templates
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      content: newTemplateContent.trim(),
      category: newTemplateCategory as Template['category'],
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
    alert(`Template "${newTemplate.name}" criado com sucesso!`);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setNewTemplateCategory(template.category);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !newTemplateName.trim() || !newTemplateContent.trim()) return;
    
    setTemplates(prev => prev.map(template => 
      template.id === editingTemplate.id 
        ? { 
            ...template, 
            name: newTemplateName.trim(), 
            content: newTemplateContent.trim(),
            category: newTemplateCategory as Template['category']
          }
        : template
    ));
    
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
    alert(`Template "${newTemplateName}" atualizado com sucesso!`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && window.confirm(`Tem certeza que deseja deletar o template "${template.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      alert(`Template "${template.name}" deletado com sucesso!`);
    }
  };

  const handleUseTemplate = (template: Template) => {
    setNewMessage(template.content);
    setTemplatesModalOpen(false);
    
    // Incrementar contador de uso
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    
    alert(`Template "${template.name}" inserido na mensagem!`);
  };

  const cancelTemplateEdit = () => {
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
  };

  if (!selectedClinic) {
    return (
      <div className="flex items-center justify-center h-64">
        <Building2 className="h-8 w-8 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Nenhuma clínica selecionada</span>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Lista de Conversas */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">

        {/* Header da sidebar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">WhatsApp</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                className="pl-9 bg-white border-gray-300"
                placeholder="Pesquisar ou começar uma nova conversa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
            <div className="space-y-2 mt-3">
              {/* Primeira linha - Filtros principais */}
              <div className="flex space-x-2">
                {['Tudo', 'Manual', 'IA'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                      ${activeFilter === filter 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }
                    `}
                  >
                    {filter === 'Manual' && <Users className="h-3 w-3" />}
                    {filter === 'IA' && <Bot className="h-3 w-3" />}
                    <span>{filter}</span>
                  </button>
                ))}
              </div>
              
              {/* Segunda linha - Filtros especiais */}
              <div className="flex space-x-2">
                {/* Filtro Não lidas */}
                <button
                  onClick={() => handleFilterClick('Não lidas')}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                    ${activeFilter === 'Não lidas' 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }
                  `}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Não lidas</span>
                  {/* Contador de conversas não lidas */}
                  {mockConversations.filter(c => (c.unreadCount || 0) > 0).length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-200 text-orange-800 text-xs">
                      {mockConversations.filter(c => (c.unreadCount || 0) > 0).length}
                    </Badge>
                  )}
                </button>
                
                {/* Botão especial para Flags Personalizadas */}
                <button
                  onClick={() => handleFilterClick('Flags Personalizadas')}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1
                    ${activeFilter === 'Flags Personalizadas' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }
                  `}
                >
                  <Tag className="h-3 w-3" />
                  <span>Flags</span>
                  {selectedFilterFlags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-purple-200 text-purple-800 text-xs">
                      {selectedFilterFlags.length}
                    </Badge>
                  )}
                </button>
              </div>
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1">
            <div className="py-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`
                    flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors
                    ${selectedConversation?.id === conversation.id ? 'bg-gray-100 border-r-4 border-green-500' : ''}
                  `}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="relative mr-3">
                    <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                      <AvatarFallback className="bg-gray-300 text-gray-700">
                        {getInitials(conversation.customer_name || 'Cliente')}
                    </AvatarFallback>
                  </Avatar>
                    {/* Indicador de mensagens não lidas */}
                    {(conversation.unreadCount || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {conversation.unreadCount! > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900 flex-1">
                        <span className="block truncate">
                          {(conversation.customer_name || conversation.customer_phone).length > 30 
                            ? `${(conversation.customer_name || conversation.customer_phone).substring(0, 30)}...` 
                            : (conversation.customer_name || conversation.customer_phone)
                          }
                        </span>
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(conversation.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 flex-1">
                        <span className="block truncate">
                          {conversation.lastMessage.length > 50 
                            ? `${conversation.lastMessage.substring(0, 50)}...` 
                            : conversation.lastMessage
                          }
                        </span>
                      </p>
                    </div>
                    
                    {/* Flag padrão sempre presente */}
                    <div className="mt-1">
                      {(() => {
                        const standardFlag = getStandardFlag(conversation);
                        const IconComponent = standardFlag.icon;
                        return (
                      <Badge 
                            variant="outline" 
                        className="text-xs"
                            style={{ 
                              backgroundColor: `${standardFlag.color}20`, 
                              borderColor: standardFlag.color,
                              color: standardFlag.color 
                            }}
                      >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {standardFlag.name}
                      </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do chat */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {getInitials(selectedConversation.customer_name || 'Cliente')}
                  </AvatarFallback>
                </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.customer_name || selectedConversation.customer_phone}
                      </h3>
                      {(() => {
                        const standardFlag = getStandardFlag(selectedConversation);
                        const IconComponent = standardFlag.icon;
                        return (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${standardFlag.color}20`, 
                              borderColor: standardFlag.color,
                              color: standardFlag.color 
                            }}
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {standardFlag.name}
                      </Badge>
                        );
                      })()}
                  </div>
                    <p className="text-sm text-gray-500">{selectedConversation.customer_phone}</p>
                </div>
              </div>
              
                <div className="flex items-center space-x-2">
                <Button 
                  variant={selectedConversation.assigned_user_id ? "default" : "outline"}
                  size="sm"
                    onClick={() => {
                      // Toggle entre Manual e IA
                      setSelectedConversation(prev => ({
                        ...prev,
                        assigned_user_id: prev.assigned_user_id ? null : 'current-user'
                      }));
                      
                      const newMode = selectedConversation.assigned_user_id ? 'IA' : 'Manual';
                      alert(`Conversa alterada para modo ${newMode}`);
                    }}
                >
                  {selectedConversation.assigned_user_id ? (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                        Voltar para IA
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assumir Conversa
                    </>
                  )}
                </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Search className="h-4 w-4" />
                </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setShowContactInfo(!showContactInfo)}
                  >
                    {showContactInfo ? <X className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Área de mensagens */}
              <div className="flex-1 flex flex-col bg-gray-50">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                    {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                        className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex items-end space-x-2 max-w-[70%]">
                          {message.sender_type === 'bot' && (
                          <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-gray-400 text-white text-xs">
                              AI
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                            className={`px-3 py-2 rounded-lg shadow-sm ${
                              message.sender_type === 'customer'
                                ? 'bg-green-500 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none border'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1`}>
                            <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                              {message.sender_type === 'customer' && (
                                <CheckCheck className="h-3 w-3 text-blue-200" />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-end space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                    <div className="flex-1">
                    <Input
                        placeholder="Digite uma mensagem"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                        className="bg-white border-gray-300"
                    />
                  </div>
                  
                    {newMessage.trim() ? (
                  <Button 
                    onClick={sendMessage}
                    size="sm"
                        className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                </div>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
                <p className="text-gray-500">
                  Escolha uma conversa na lista para visualizar as mensagens
                </p>
                  </div>
            </div>
          )}
        </div>

        {/* Sidebar direito - Dados do Paciente */}
        {showContactInfo && selectedConversation && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Dados do Paciente</h3>
                  <Button 
                  variant="ghost" 
                    size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowContactInfo(false)}
                  >
                  <X className="h-4 w-4" />
                  </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {/* Foto e informações do paciente */}
              <div className="p-6 text-center border-b border-gray-200">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-2xl">
                    {getInitials(selectedConversation.customer_name || 'Cliente')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {mockPatientInfo.name}
                </h2>
                
                {/* Dados do paciente */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="text-sm font-medium text-gray-900">{mockPatientInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Idade:</span>
                    <span className="text-sm font-medium text-gray-900">{mockPatientInfo.age} anos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <span className="text-sm font-medium text-gray-900">{mockPatientInfo.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Convênio:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {mockPatientInfo.insurance}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Botão Arquivos e Documentos */}
              <div className="p-4 border-b border-gray-200">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setFilesModalOpen(true)}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Arquivos e Documentos</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    {mockPatientInfo.files.length}
                  </Badge>
                </Button>
              </div>

              {/* Opções de Atendimento */}
              <div className="p-4 space-y-4">
                <div 
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={handleTemplatesClick}
                >
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-700 font-medium">Templates</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bot className="h-5 w-5 text-orange-500" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Parar Atendente Virtual</span>
                    <button
                      onClick={() => setVirtualAssistantActive(!virtualAssistantActive)}
                      className="relative"
                    >
                      <div className={`
                        w-10 h-5 rounded-full shadow-inner cursor-pointer transition-colors
                        ${virtualAssistantActive ? 'bg-green-400' : 'bg-gray-300'}
                      `}>
                        <div className={`
                          w-4 h-4 bg-white rounded-full shadow transform transition-transform
                          ${virtualAssistantActive ? 'translate-x-5' : 'translate-x-0'}
                        `}></div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div 
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={handleScheduleMessageClick}
                >
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 font-medium">Programar mensagem</div>
                    <div className="text-xs text-gray-500">Agendar envio de mensagem</div>
                  </div>
                </div>
                
                <div 
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={handleFlagsClick}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    🏷️
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 font-medium">Flags</div>
                    <div className="text-xs text-gray-500">Marcar conversa com etiquetas</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
                </div>
              )}
            </div>

      {/* Modal de Arquivos e Documentos */}
      <Dialog open={filesModalOpen} onOpenChange={setFilesModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-blue-500" />
              <span>Arquivos e Documentos - {mockPatientInfo.name}</span>
            </DialogTitle>
            <DialogDescription>
              Gerencie os arquivos e documentos do paciente
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {/* Contador e ações */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {mockPatientInfo.files.length} arquivos encontrados
              </span>
              {selectedFiles.length > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {selectedFiles.length} selecionado(s)
                </Badge>
              )}
            </div>

            {/* Lista de arquivos */}
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2 pr-4">
                {mockPatientInfo.files.map((file) => (
                  <div 
                    key={file.id}
                    className={`
                      flex items-center p-3 rounded-lg border transition-all cursor-pointer group
                      ${selectedFiles.includes(file.id) 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                      }
                    `}
                    onClick={() => {
                      setSelectedFiles(prev => 
                        prev.includes(file.id) 
                          ? prev.filter(id => id !== file.id)
                          : [...prev, file.id]
                      )
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {file.type === 'image' ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <img src={file.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-red-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.date} • {file.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        title="Visualizar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Ações em lote */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Share className="h-3 w-3 mr-1" />
                    Encaminhar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setSelectedFiles([])}
                  >
                    Limpar
                  </Button>
            </div>
          </div>
        )}

            {/* Botões de ação principal */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setFilesModalOpen(false)}>
                Fechar
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Adicionar Arquivo
              </Button>
      </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Flags */}
      <Dialog open={flagsModalOpen} onOpenChange={setFlagsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-green-500" />
              <span>Gerenciar Flags</span>
            </DialogTitle>
            <DialogDescription>
              Crie e gerencie flags para classificar conversas
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-6">
            <div className="flex flex-col space-y-6 pb-4">
            {/* Formulário de criação/edição */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {editingFlag ? 'Editar Flag' : 'Criar Nova Flag'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flag-name">Nome da Flag</Label>
                  <Input
                    id="flag-name"
                    value={newFlagName}
                    onChange={(e) => setNewFlagName(e.target.value)}
                    placeholder="Ex: Urgente, Agendamento..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flag-color">Cor</Label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: newFlagColor }}
                    />
                    <select
                      value={newFlagColor}
                      onChange={(e) => setNewFlagColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {colorOptions.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {editingFlag && (
                  <Button variant="outline" onClick={cancelFlagEdit}>
                    Cancelar
                  </Button>
                )}
                <Button 
                  onClick={editingFlag ? handleUpdateFlag : handleCreateFlag}
                  disabled={!newFlagName.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingFlag ? 'Atualizar Flag' : 'Criar Flag'}
                </Button>
              </div>
            </div>

            {/* Lista de flags existentes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Flags Existentes</h4>
                <span className="text-xs text-gray-500">{flags.length} flags criadas</span>
              </div>
              
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2 pr-4">
                  {flags.map((flag) => (
                    <div 
                      key={flag.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: flag.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {flag.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Criada em {new Date(flag.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${flag.color}20`, 
                            borderColor: flag.color,
                            color: flag.color 
                          }}
                        >
                          {flag.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditFlag(flag)}
                          title="Editar flag"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteFlag(flag.id)}
                          title="Deletar flag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Instruções de uso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Tag className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Como usar as flags:</p>
                  <ul className="text-xs space-y-1 text-blue-600">
                    <li>• Flags ajudam a categorizar e organizar conversas</li>
                    <li>• Clique em uma conversa e aplique flags conforme necessário</li>
                    <li>• Use cores diferentes para identificar rapidamente os tipos</li>
                    <li>• Flags podem ser filtradas na lista de conversas</li>
                  </ul>
                </div>
              </div>
            </div>

            </div>
          </ScrollArea>
          
          {/* Botões de ação fixos */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 bg-white">
            <Button variant="outline" onClick={() => setFlagsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Filtros Personalizados */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-purple-500" />
              <span>Filtrar por Flags</span>
            </DialogTitle>
            <DialogDescription>
              Selecione as flags que deseja usar para filtrar as conversas
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {/* Lista de flags disponíveis */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Selecione as flags para filtrar:
              </h4>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {flags.filter(flag => flag.name !== 'Manual').map((flag) => (
                  <div 
                    key={flag.id}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedFilterFlags.includes(flag.id) 
                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => {
                      setSelectedFilterFlags(prev => 
                        prev.includes(flag.id) 
                          ? prev.filter(id => id !== flag.id)
                          : [...prev, flag.id]
                      )
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: flag.color }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {flag.name}
                        </p>
                        {flag.description && (
                          <p className="text-xs text-gray-500">
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${flag.color}20`, 
                          borderColor: flag.color,
                          color: flag.color 
                        }}
                      >
                        {flag.name}
                      </Badge>
                    </div>
                    
                    {selectedFilterFlags.includes(flag.id) && (
                      <div className="ml-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flags selecionadas */}
            {selectedFilterFlags.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h5 className="text-sm font-medium text-purple-900 mb-2">
                  Flags selecionadas para filtro:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedFilterFlags.map(flagId => {
                    const flag = flags.find(f => f.id === flagId);
                    return flag ? (
                      <Badge 
                        key={flagId}
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${flag.color}20`, 
                          borderColor: flag.color,
                          color: flag.color 
                        }}
                      >
                        {flag.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Tag className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ul className="text-xs space-y-1 text-blue-600">
                    <li>• Selecione uma ou mais flags para filtrar</li>
                    <li>• Apenas conversas com essas flags serão exibidas</li>
                    <li>• Você pode combinar múltiplas flags</li>
                    <li>• Use "Limpar" para remover todos os filtros</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilterFlags([])}
                disabled={selectedFilterFlags.length === 0}
              >
                Limpar Seleção
              </Button>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setFilterModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={applyCustomFilters}
                  disabled={selectedFilterFlags.length === 0}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Aplicar Filtros ({selectedFilterFlags.length})
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Templates */}
      <Dialog open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Gerenciar Templates</span>
            </DialogTitle>
            <DialogDescription>
              Crie e gerencie templates de mensagens para respostas rápidas
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-6">
            <div className="flex flex-col space-y-6 pb-4">
            {/* Formulário de criação/edição */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Ex: Saudação Inicial, Agendamento..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-category">Categoria</Label>
                  <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-content">Conteúdo da Mensagem</Label>
                <Textarea
                  id="template-content"
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  placeholder="Digite o conteúdo do template..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {newTemplateContent.length}/500 caracteres
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {editingTemplate && (
                  <Button variant="outline" onClick={cancelTemplateEdit}>
                    Cancelar
                  </Button>
                )}
                <Button 
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Atualizar Template' : 'Criar Template'}
                </Button>
              </div>
            </div>

            {/* Lista de templates existentes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Templates Existentes</h4>
                <span className="text-xs text-gray-500">{templates.length} templates criados</span>
              </div>
              
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3 pr-4">
                  {templates.map((template) => {
                    const category = templateCategories.find(c => c.value === template.category);
                    return (
                      <div 
                        key={template.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h5 className="text-sm font-medium text-gray-900">
                              {template.name}
                            </h5>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${category?.color}20`, 
                                borderColor: category?.color,
                                color: category?.color 
                              }}
                            >
                              {category?.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleUseTemplate(template)}
                              title="Usar template"
                            >
                              <Send className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditTemplate(template)}
                              title="Editar template"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Deletar template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {template.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>Usado {template.usageCount} vezes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Instruções de uso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Como usar templates:</p>
                  <ul className="text-xs space-y-1 text-blue-600">
                    <li>• Clique no ícone ➤ para inserir o template na mensagem</li>
                    <li>• Organize templates por categorias para facilitar a busca</li>
                    <li>• Templates mais usados aparecem com contador de uso</li>
                    <li>• Edite templates existentes para manter sempre atualizados</li>
                  </ul>
                </div>
              </div>
            </div>

            </div>
          </ScrollArea>
          
          {/* Botões de ação fixos */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 bg-white">
            <Button variant="outline" onClick={() => setTemplatesModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}