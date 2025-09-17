import React, { useState } from "react"
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
  Building2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Dados mock simples para visualização
const mockConversations = [
  {
    id: '1',
    customer_phone: '(48) 99999-9999',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: null
  },
  {
    id: '2',
    customer_phone: '(48) 88888-8888',
    status: 'active',
    updated_at: new Date().toISOString(),
    assigned_user_id: 'user1'
  }
];

const mockMessages = [
  {
    id: '1',
    sender_type: 'customer',
    content: 'Olá, gostaria de agendar uma consulta',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    sender_type: 'bot',
    content: 'Olá! Claro, vou te ajudar com o agendamento.',
    timestamp: new Date().toISOString()
  }
];

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [conversationMessages, setConversationMessages] = useState(mockMessages)

  const selectedClinic = { id: '1', name: 'Clínica Demo' };

  const filteredConversations = mockConversations.filter(conversation =>
    conversation.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      sender_type: 'bot',
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

  if (!selectedClinic) {
    return (
      <div className="flex items-center justify-center h-64">
        <Building2 className="h-8 w-8 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Nenhuma clínica selecionada</span>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-background -m-6">
      {/* Sidebar com lista de conversas */}
      <div className="w-80 border-r flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 hover:bg-muted/50 cursor-pointer rounded-lg mb-1 ${
                    selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(conversation.customer_phone || 'Cliente')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{conversation.customer_phone || 'Cliente'}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate mr-2">
                        {conversation.status === 'active' ? 'Conversa ativa' : 'Conversa finalizada'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={conversation.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {conversation.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </Badge>
                      {conversation.assigned_user_id && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Users className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma conversa encontrada
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(selectedConversation.customer_phone || 'Cliente')}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{selectedConversation.customer_phone || 'Cliente'}</h3>
                    {selectedConversation.assigned_user_id ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Users className="h-3 w-3 mr-1" />
                        Manual
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Bot className="h-3 w-3 mr-1" />
                        Automático
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedConversation.customer_phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assumir Conversa
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
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
                    className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end max-w-[70%] gap-2">
                      {message.sender_type === 'bot' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.sender_type === 'customer'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender_type === 'customer' && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Anexar arquivo">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12"
                  />
                </div>
                
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-muted-foreground">
                Escolha uma conversa na lista para visualizar e responder as mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}