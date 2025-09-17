import { useState } from "react"
import { 
  MessageSquare, 
  Search, 
  Send, 
  MoreVertical,
  CheckCheck,
  Smile,
  Bot,
  Users,
  Paperclip,
  Mic,
  X,
  Clock,
  FileText,
  Download,
  Share,
  Folder,
  Plus,
  Edit,
  Trash2,
  Tag
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
  insurance: 'Unimed'
};

const mockFiles = [
  { id: '1', name: 'Exame de Sangue - 15/03/2024', type: 'PDF', size: '2.3 MB', date: '2024-03-15' },
  { id: '2', name: 'Radiografia Tórax - 10/03/2024', type: 'JPG', size: '1.8 MB', date: '2024-03-10' },
  { id: '3', name: 'Receita Médica - 08/03/2024', type: 'PDF', size: '0.5 MB', date: '2024-03-08' },
  { id: '4', name: 'Ultrassom - 05/03/2024', type: 'PDF', size: '3.2 MB', date: '2024-03-05' },
  { id: '5', name: 'Eletrocardiograma - 01/03/2024', type: 'PDF', size: '1.1 MB', date: '2024-03-01' }
];

interface Flag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'agendamento' | 'consulta' | 'exame' | 'receita' | 'outro';
  usageCount: number;
  createdAt: string;
}

const mockFlags: Flag[] = [
  { id: '1', name: 'Urgente', color: '#EF4444', createdAt: '2024-01-15' },
  { id: '2', name: 'Retorno', color: '#3B82F6', createdAt: '2024-01-20' },
  { id: '3', name: 'Primeira Consulta', color: '#10B981', createdAt: '2024-01-25' }
];

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Agendamento Confirmado',
    content: 'Olá! Sua consulta foi agendada para {data} às {hora} com {medico}. Por favor, chegue 15 minutos antes.',
    category: 'agendamento',
    usageCount: 45,
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Lembrete de Consulta',
    content: 'Lembramos que você tem consulta marcada para amanhã às {hora}. Confirme sua presença.',
    category: 'consulta',
    usageCount: 32,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Resultado de Exame',
    content: 'Seus exames estão prontos! Pode retirar na recepção ou agendar uma consulta para avaliação.',
    category: 'exame',
    usageCount: 28,
    createdAt: '2024-01-20'
  }
];

const colorOptions = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cinza', value: '#6B7280' }
];

const templateCategories = [
  { value: 'agendamento', label: 'Agendamento' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'exame', label: 'Exame' },
  { value: 'receita', label: 'Receita' },
  { value: 'outro', label: 'Outro' }
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
  const [filesModalOpen, setFilesModalOpen] = useState(false)
  const [flagsModalOpen, setFlagsModalOpen] = useState(false)
  const [newFlagName, setNewFlagName] = useState('')
  const [newFlagColor, setNewFlagColor] = useState('#3B82F6')
  const [flags, setFlags] = useState<Flag[]>(mockFlags)
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null)
  const [selectedFilterFlags] = useState<string[]>([])
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('outro')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)

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

  const handleFilterClick = (filter: string) => {
    if (filter === 'Flags Personalizadas') {
      setFilterModalOpen(true);
      return;
    }
    setActiveFilter(filter);
  }

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDownloadSelected = () => {
    console.log('Baixando arquivos:', selectedFiles);
    // Implementar lógica de download
  };

  const handleForwardSelected = () => {
    console.log('Encaminhando arquivos:', selectedFiles);
    // Implementar lógica de encaminhamento
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  const handleCreateFlag = () => {
    if (!newFlagName.trim()) return;
    
    const newFlag: Flag = {
      id: Date.now().toString(),
      name: newFlagName,
      color: newFlagColor,
      createdAt: new Date().toISOString()
    };
    
    setFlags(prev => [...prev, newFlag]);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
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
        ? { ...flag, name: newFlagName, color: newFlagColor }
        : flag
    ));
    
    cancelFlagEdit();
  };

  const cancelFlagEdit = () => {
    setEditingFlag(null);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
  };

  const handleDeleteFlag = (flagId: string) => {
    setFlags(prev => prev.filter(flag => flag.id !== flagId));
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent,
      category: newTemplateCategory as Template['category'],
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
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
            name: newTemplateName, 
            content: newTemplateContent,
            category: newTemplateCategory as Template['category']
          }
        : template
    ));
    
    cancelTemplateEdit();
  };

  const cancelTemplateEdit = () => {
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleUseTemplate = (template: Template) => {
    setNewMessage(template.content);
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    setTemplatesModalOpen(false);
  };

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
                        {conversation.customer_name && conversation.customer_name.length > 30 
                          ? `${conversation.customer_name.substring(0, 30)}...`
                          : conversation.customer_name || 'Cliente'
                        }
                      </span>
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(conversation.updated_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-start justify-between mt-1">
                    <p className="text-sm text-gray-600 flex-1 mr-2">
                      {conversation.lastMessage && conversation.lastMessage.length > 50 
                        ? `${conversation.lastMessage.substring(0, 50)}...`
                        : conversation.lastMessage
                      }
                    </p>
                  </div>
                  {/* Flag padrão na linha de baixo */}
                  <div className="mt-1">
                    {(() => {
                      const flag = getStandardFlag(conversation);
                      const Icon = flag.icon;
                      return (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                          style={{ 
                            backgroundColor: `${flag.color}20`, 
                            borderColor: flag.color,
                            color: flag.color 
                          }}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {flag.name}
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
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.customer_name || 'Cliente'}
                    </h3>
                    {(() => {
                      const flag = getStandardFlag(selectedConversation);
                      const Icon = flag.icon;
                      return (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                          style={{ 
                            backgroundColor: `${flag.color}20`, 
                            borderColor: flag.color,
                            color: flag.color 
                          }}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {flag.name}
                        </Badge>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.customer_phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Área de mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'customer' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_type === 'customer'
                          ? 'bg-white border border-gray-200 text-gray-900'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span
                          className={`text-xs ${
                            message.sender_type === 'customer'
                              ? 'text-gray-500'
                              : 'text-green-100'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender_type !== 'customer' && (
                          <CheckCheck className="h-4 w-4 text-green-100" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Digite uma mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                {newMessage.trim() ? (
                  <Button onClick={sendMessage} size="sm" className="h-10 w-10 p-0">
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar direita - Dados do Paciente */}
      {showContactInfo && selectedConversation && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dados do Paciente</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContactInfo(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback className="bg-gray-300 text-gray-700 text-xl">
                  {getInitials(selectedConversation.customer_name || 'Cliente')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-900">
                {selectedConversation.customer_name || 'Cliente'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.customer_phone}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome:</label>
                <p className="text-sm text-gray-900 mt-1">{mockPatientInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Idade:</label>
                <p className="text-sm text-gray-900 mt-1">{mockPatientInfo.age} anos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telefone:</label>
                <p className="text-sm text-gray-900 mt-1">{mockPatientInfo.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Convênio:</label>
                <p className="text-sm text-blue-600 mt-1">{mockPatientInfo.insurance}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Botão para Arquivos e Documentos */}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setFilesModalOpen(true)}
              >
                <Folder className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Arquivos e Documentos</div>
                  <div className="text-xs text-gray-500 mt-0.5">5 arquivos</div>
                </div>
              </Button>

              {/* Templates */}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setTemplatesModalOpen(true)}
              >
                <FileText className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Templates</div>
                  <div className="text-xs text-gray-500 mt-0.5">Mensagens prontas</div>
                </div>
              </Button>

              {/* Parar Atendente Virtual */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bot className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">Parar Atendente Virtual</div>
                    <div className="text-xs text-gray-500">Assumir conversa</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={virtualAssistantActive}
                      onChange={(e) => setVirtualAssistantActive(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              {/* Programar mensagem */}
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Programar mensagem</div>
                  <div className="text-xs text-gray-500 mt-0.5">Agendar envio de mensagem</div>
                </div>
              </Button>

              {/* Flags */}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setFlagsModalOpen(true)}
              >
                <Tag className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Flags</div>
                  <div className="text-xs text-gray-500 mt-0.5">Marcar conversa com etiquetas</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

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
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {mockFiles.map((file) => (
                <div 
                  key={file.id}
                  className={`
                    flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedFiles.includes(file.id) 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => handleFileToggle(file.id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{file.type}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{file.size}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(file.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileToggle(file.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {selectedFiles.length > 0 && `${selectedFiles.length} arquivo(s) selecionado(s)`}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedFiles.length === 0}
              >
                Limpar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadSelected}
                disabled={selectedFiles.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button 
                size="sm"
                onClick={handleForwardSelected}
                disabled={selectedFiles.length === 0}
              >
                <Share className="h-4 w-4 mr-2" />
                Encaminhar
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

      {/* Modal de Templates */}
      <Dialog open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Templates de Mensagens</span>
            </DialogTitle>
            <DialogDescription>
              Crie e gerencie templates para respostas rápidas
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-6">
            <div className="flex flex-col space-y-6 pb-4">
              {/* Formulário de criação/edição */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Ex: Agendamento Confirmado"
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
                              {category.label}
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
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500">
                      Use {"{variável}"} para campos dinâmicos (ex: {"{nome}"}, {"{data}"}, {"{hora}"})
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
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
              </div>

              {/* Lista de templates existentes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Templates Existentes</h4>
                  <span className="text-xs text-gray-500">{templates.length} templates criados</span>
                </div>
                
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-3 pr-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-900">{template.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {templateCategories.find(c => c.value === template.category)?.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {template.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Usado {template.usageCount} vezes</span>
                              <span>Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleUseTemplate(template)}
                              title="Usar template"
                            >
                              <Send className="h-4 w-4" />
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
