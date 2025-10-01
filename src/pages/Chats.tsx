import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Filter, 
  MoreVertical, 
  Plus, 
  Search, 
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  Send,
  Pencil,
  ChevronDown,
  Phone,
  Video,
  MoreHorizontal,
  Check,
  CheckCheck
} from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  status: 'inbox' | 'waiting' | 'finished';
  category: string;
  messageStatus?: 'sent' | 'delivered' | 'read';
  hasTag?: boolean;
  tagText?: string;
  tagColor?: string;
  tagIcon?: React.ReactNode;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Pai',
    avatar: '',
    lastMessage: '',
    time: '23:09',
    status: 'inbox',
    category: 'Geral',
    messageStatus: 'read'
  },
  {
    id: '2',
    name: 'Paulo',
    avatar: '',
    lastMessage: 'Fffff',
    time: '22:56',
    unreadCount: 1,
    status: 'inbox',
    category: 'Comerci...',
    messageStatus: 'read',
    hasTag: true,
    tagText: 'Vendido',
    tagColor: 'bg-green-100 text-green-700'
  },
  {
    id: '3',
    name: 'Meu',
    avatar: '',
    lastMessage: 'Transferido para o atendente Paul...',
    time: '20:52',
    status: 'inbox',
    category: 'Geral',
    messageStatus: 'read'
  },
  {
    id: '4',
    name: '+55 47 9703-8486',
    avatar: '',
    lastMessage: 'Transferido para o setor Comercial',
    time: '20:51',
    status: 'inbox',
    category: 'Comerci...'
  },
  {
    id: '5',
    name: 'Umbler Chatbot',
    avatar: '',
    lastMessage: 'Sério, responde aí alguma coisa para ...',
    time: '18:33',
    unreadCount: 1,
    status: 'inbox',
    category: 'Geral'
  },
  {
    id: '6',
    name: '+55 47 9952-8232',
    avatar: '',
    lastMessage: 'Teste final - o bot deve responder aut...',
    time: '3 dias atrás',
    status: 'inbox',
    category: 'Geral'
  },
  {
    id: '7',
    name: '+55 11 97392-1045',
    avatar: '',
    lastMessage: 'Atendimento encerrado pelo contat...',
    time: '5 dias atrás',
    status: 'inbox',
    category: 'Geral'
  },
  {
    id: '8',
    name: '+55 47 9136-1579',
    avatar: '',
    lastMessage: '',
    time: '6 dias atrás',
    status: 'inbox',
    category: 'Geral'
  }
];

const Chats: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [message, setMessage] = useState('');
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [assignedUser, setAssignedUser] = useState('PauloRobertoBunior');

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const inboxCount = mockChats.filter(chat => chat.status === 'inbox').length;

  const MessageStatusIcon = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
    if (!status) return null;
    
    if (status === 'sent') {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
    
    if (status === 'delivered') {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    }
    
    if (status === 'read') {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    
    return null;
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar de conversas */}
      <div className="w-[440px] min-w-[440px] max-w-[440px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Conversas</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </Button>
              <Button size="icon" className="h-8 w-8 bg-blue-500 hover:bg-blue-600 rounded-full">
                <Plus className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 bg-gray-50 border-gray-200"
              placeholder="Buscar por nome ou telefone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'inbox' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 ${
                activeTab === 'inbox' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('inbox')}
            >
              Entrada
              {activeTab === 'inbox' && (
                <Badge className="ml-2 bg-white text-blue-500 hover:bg-white px-2 py-0.5 text-xs">
                  {inboxCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'waiting' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 ${
                activeTab === 'waiting' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('waiting')}
            >
              Esperando
            </Button>
            <Button
              variant={activeTab === 'finished' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full px-4 ${
                activeTab === 'finished' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('finished')}
            >
              Finalizados
            </Button>
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1">
          {mockChats
            .filter(chat => 
              chat.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              chat.status === activeTab
            )
            .map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                  selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="relative mr-3">
                  <Avatar className="h-12 w-12">
                    {chat.avatar ? (
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                    ) : (
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
                        {getInitials(chat.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* WhatsApp badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {chat.time}
                    </span>
                  </div>

                  {/* Tag se houver */}
                  {chat.hasTag && chat.tagText && (
                    <div className="flex items-center gap-1 mb-1">
                      <Badge className={`${chat.tagColor} text-xs px-2 py-0.5 rounded`}>
                        {chat.tagIcon}
                        {chat.tagText}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {chat.messageStatus && (
                      <MessageStatusIcon status={chat.messageStatus} />
                    )}
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {chat.lastMessage || ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{chat.category}</span>
                    {chat.unreadCount && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </ScrollArea>
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Header do chat */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {selectedChat.avatar ? (
                      <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                    ) : (
                      <AvatarFallback className="bg-gray-300 text-gray-700">
                        {getInitials(selectedChat.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                    <p className="text-xs text-gray-500">{selectedChat.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Envie a primeira mensagem!</p>
              </div>
            </div>

            {/* Área de input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* User toggle e chatbot badge */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={chatbotEnabled}
                    onCheckedChange={setChatbotEnabled}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{assignedUser}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <Pencil className="h-3 w-3 text-gray-500" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Mensagem
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 border-gray-300">
                    Notas
                  </Button>
                </div>
              </div>

              {/* Chatbot badge */}
              <div className="flex justify-center mb-3">
                <Badge className="bg-gray-700 text-white px-3 py-1 text-xs">
                  Chatbot
                </Badge>
              </div>

              {/* Input de mensagem */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Smile className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ImageIcon className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Button>

                <div className="flex-1 relative">
                  <Input
                    className="w-full pr-10 bg-gray-50 border-gray-200"
                    placeholder=""
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button 
                  size="icon" 
                  className="h-10 w-10 bg-blue-500 hover:bg-blue-600 rounded-full"
                >
                  <Mic className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Envie a primeira mensagem!
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;

