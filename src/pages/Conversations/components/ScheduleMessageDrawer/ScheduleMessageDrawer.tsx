import React, { useState } from 'react';
import { X, Search, Calendar, Clock, AlertTriangle, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversationsContext } from '../../context/ConversationsContext';

interface ScheduledMessage {
  id: string;
  message: string;
  scheduledFor: string;
  channel: string;
  agent: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  createdAt: string;
}

// Mock data
const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: '1',
    message: 'Obrigado! é sempre bom contar contigo',
    scheduledFor: '30/09/2025 20:00',
    channel: 'AtendimentoPauloRobertoJunior',
    agent: 'PauloRobertoJunior',
    status: 'sent',
    createdAt: '30/09/2025 19:30'
  }
];

const mockQuickReplies = [
  { id: '1', name: 'Saudação inicial' },
  { id: '2', name: 'Informações de contato' },
  { id: '3', name: 'Horário de funcionamento' },
  { id: '4', name: 'Agradecimento' }
];

export const ScheduleMessageDrawer: React.FC = () => {
  const { scheduleMessageDrawerOpen, setScheduleMessageDrawerOpen } = useConversationsContext();
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Schedule form state
  const [scheduledDate, setScheduledDate] = useState('02/10/2025 11:11:09');
  const [quickReply, setQuickReply] = useState('');
  const [message, setMessage] = useState('');
  const [userEnabled, setUserEnabled] = useState(true);
  const [cancelOnContact, setCancelOnContact] = useState(false);
  const [cancelOnAgent, setCancelOnAgent] = useState(false);

  const scheduledMessages = mockScheduledMessages.filter(msg => 
    msg.status === 'scheduled'
  );

  const completedMessages = mockScheduledMessages.filter(msg => 
    msg.status === 'sent' && 
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHoursUntilScheduled = () => {
    // Mock calculation - in production would calculate real difference
    return 23;
  };

  const handleSchedule = () => {
    if (!message.trim()) return;
    
    // TODO: Implement schedule logic
    console.log('Scheduling message:', {
      message,
      scheduledDate,
      quickReply,
      userEnabled,
      cancelOnContact,
      cancelOnAgent
    });
    
    // Reset form and close drawer
    setMessage('');
    setQuickReply('');
    setCancelOnContact(false);
    setCancelOnAgent(false);
    setScheduleMessageDrawerOpen(false);
  };

  const handleCancel = () => {
    setScheduleMessageDrawerOpen(false);
    setMessage('');
    setQuickReply('');
    setCancelOnContact(false);
    setCancelOnAgent(false);
  };

  if (!scheduleMessageDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[538px] bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/paulo.jpg" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              P
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-gray-900">Agendamento de mensagens</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setScheduleMessageDrawerOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Agendadas ({scheduledMessages.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Concluídas ({mockScheduledMessages.filter(m => m.status === 'sent').length})
              </TabsTrigger>
            </TabsList>

            {/* Aba Agendar */}
            <TabsContent value="schedule" className="space-y-6">
              {/* Warning Alert */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Atenção!</strong> A mensagem só será enviada se o celular estiver conectado no momento que foi agendado o envio.
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Selecione data e hora para envio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="pr-10"
                    placeholder="DD/MM/YYYY HH:MM:SS"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {/* Time indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Será enviado em {getHoursUntilScheduled()} horas
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Reply */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Utilizar uma resposta rápida
                </label>
                <Select value={quickReply} onValueChange={setQuickReply}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockQuickReplies.map((reply) => (
                      <SelectItem key={reply.id} value={reply.id}>
                        {reply.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/paulo.jpg" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      P
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900">PauloRobertoJunior</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <User className="h-3 w-3 text-gray-400" />
                  </Button>
                </div>
                <Switch
                  checked={userEnabled}
                  onCheckedChange={setUserEnabled}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mensagem <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Cancel Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cancelContact"
                    checked={cancelOnContact}
                    onChange={(e) => setCancelOnContact(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="cancelContact" className="text-sm text-gray-700">
                    Cancelar se <strong>contato</strong> enviar nova mensagem
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cancelAgent"
                    checked={cancelOnAgent}
                    onChange={(e) => setCancelOnAgent(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="cancelAgent" className="text-sm text-gray-700">
                    Cancelar se <strong>atendente</strong> enviar nova mensagem
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleSchedule}
                  disabled={!message.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Agendar
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
                >
                  Cancelar
                </Button>
              </div>
            </TabsContent>

            {/* Aba Agendadas */}
            <TabsContent value="scheduled" className="space-y-6">
              {scheduledMessages.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Nada por aqui!</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Ainda não foi agendada nenhuma mensagem para esse contato.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledMessages.map((msg) => (
                    <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Agendada
                        </Badge>
                        <span className="text-xs text-gray-500">{msg.scheduledFor}</span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{msg.message}</p>
                      <div className="text-xs text-gray-500">
                        Canal: {msg.channel} • Atendente: {msg.agent}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba Concluídas */}
            <TabsContent value="completed" className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por mensagem, data ou canal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-full border-gray-300"
                />
              </div>

              {/* Completed Messages */}
              <div className="space-y-4">
                {completedMessages.map((msg) => (
                  <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">Mensagem</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Enviado
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><strong>Agendado para:</strong> {msg.scheduledFor}</div>
                      <div><strong>Canal:</strong> <Avatar className="inline-block h-4 w-4 mr-1"><AvatarFallback className="text-xs">A</AvatarFallback></Avatar> {msg.channel}</div>
                      <div><strong>Atendente:</strong> {msg.agent}</div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-1">{msg.agent}:</div>
                      <div className="text-sm text-gray-700">{msg.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};



