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
  Folder
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Dados mock simples para visualização
const mockConversations = [
  {
    id: '1',
    customer_phone: '(48) 99999-9999',
    customer_name: 'Maria Silva',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: null,
    lastMessage: 'Olá, gostaria de agendar uma consulta',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '2',
    customer_phone: '(48) 88888-8888',
    customer_name: 'João Santos',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: 'user1',
    lastMessage: 'Muito obrigado pelo atendimento!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '3',
    customer_phone: '(48) 77777-7777',
    customer_name: 'Ana Costa',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: null,
    lastMessage: 'Preciso remarcar minha consulta',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
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

  const filteredConversations = mockConversations.filter(conversation =>
    conversation.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
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
    alert('Abrindo biblioteca de templates...');
  };

  const handleScheduleMessageClick = () => {
    alert('Abrindo agendador de mensagens...');
  };

  const handleFlagsClick = () => {
    alert('Abrindo sistema de flags/etiquetas...');
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
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar Principal de Navegação - Minimizável */}
      <div className={`
        bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-200
        ${sidebarMinimized ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarMinimized && (
              <h1 className="text-xl font-bold text-gray-900">Atende AI</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              className="h-8 w-8 p-0"
              title={sidebarMinimized ? 'Expandir sidebar' : 'Minimizar sidebar'}
            >
              {sidebarMinimized ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center rounded-lg text-sm font-medium transition-colors duration-200 relative
                    ${sidebarMinimized ? 'px-2 py-3 justify-center' : 'px-3 py-3'}
                    ${active 
                      ? 'bg-orange-100 text-orange-900' + (sidebarMinimized ? '' : ' border-r-4 border-orange-500')
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 ${sidebarMinimized ? '' : 'mr-3'}
                    ${active ? 'text-orange-600' : 'text-gray-400'}
                  `} />
                  {!sidebarMinimized && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  )}
                  {sidebarMinimized && active && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarMinimized ? (
              <>
                <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Usuário Demo</div>
                    <div className="text-xs text-gray-500">Administrador</div>
                  </div>
                </div>
                
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="w-full mt-2 justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área do WhatsApp - Ocupa o restante da tela */}
      <div className="flex-1 flex bg-white">
      {/* Sidebar com lista de conversas */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
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
            <div className="flex space-x-2 mt-3">
              {['Tudo', 'Não lidas', 'Favoritas', 'Grupos'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${activeFilter === filter 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
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
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {getInitials(conversation.customer_name || 'Cliente')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.customer_name || conversation.customer_phone}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.assigned_user_id && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Users className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      )}
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
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.customer_name || selectedConversation.customer_phone}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedConversation.customer_phone}</p>
                </div>
              </div>
              
                <div className="flex items-center space-x-2">
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
    </div>
  )
}