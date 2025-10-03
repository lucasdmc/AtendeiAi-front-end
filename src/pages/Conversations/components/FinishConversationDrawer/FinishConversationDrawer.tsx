import React, { useState } from 'react';
import { X, Search, CheckCircle, MessageSquare, Bot, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversationsContext } from '../../context/ConversationsContext';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  type: 'flow' | 'bot';
}

// Mock data
const mockQuickReplies = [
  { id: '1', name: 'Agradecimento final' },
  { id: '2', name: 'Orientações pós-atendimento' },
  { id: '3', name: 'Pesquisa de satisfação' },
  { id: '4', name: 'Encerramento padrão' }
];

const mockChatbots: Chatbot[] = [
  {
    id: '1',
    name: 'Fluxo',
    description: 'Iniciar fluxo',
    type: 'flow'
  }
];

export const FinishConversationDrawer: React.FC = () => {
  const { finishConversationDrawerOpen, setFinishConversationDrawerOpen } = useConversationsContext();
  const [activeTab, setActiveTab] = useState('finish');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Send message form state
  const [quickReply, setQuickReply] = useState('');
  const [message, setMessage] = useState('');
  
  // Chatbot state
  const [selectedChatbot, setSelectedChatbot] = useState<string>('');

  const filteredChatbots = mockChatbots.filter(bot =>
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinish = () => {
    // TODO: Implement finish conversation logic
    console.log('Finishing conversation');
    setFinishConversationDrawerOpen(false);
  };

  const handleSendMessageAndFinish = () => {
    if (!message.trim()) return;
    
    // TODO: Implement send message and finish logic
    console.log('Sending message and finishing:', {
      message,
      quickReply
    });
    
    // Reset form and close drawer
    setMessage('');
    setQuickReply('');
    setFinishConversationDrawerOpen(false);
  };

  const handleStartChatbotAndHide = () => {
    if (!selectedChatbot) return;
    
    // TODO: Implement start chatbot and hide logic
    console.log('Starting chatbot and hiding:', selectedChatbot);
    
    // Reset state and close drawer
    setSelectedChatbot('');
    setSearchTerm('');
    setFinishConversationDrawerOpen(false);
  };

  const handleCancel = () => {
    setFinishConversationDrawerOpen(false);
    setMessage('');
    setQuickReply('');
    setSelectedChatbot('');
    setSearchTerm('');
  };

  if (!finishConversationDrawerOpen) return null;

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
          <h2 className="text-xl font-semibold text-gray-900">Finalizar conversa</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFinishConversationDrawerOpen(false)}
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
              <TabsTrigger value="finish" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Finalizar
              </TabsTrigger>
              <TabsTrigger value="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Enviar mensagem
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Iniciar chatbot
              </TabsTrigger>
            </TabsList>

            {/* Aba Finalizar */}
            <TabsContent value="finish" className="space-y-6">
              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-blue-800">
                  Esta opção irá apenas finalizar esta conversa. Você também pode escolher{' '}
                  <button 
                    onClick={() => setActiveTab('message')}
                    className="font-semibold underline hover:no-underline"
                  >
                    Enviar uma mensagem
                  </button>{' '}
                  ou{' '}
                  <button 
                    onClick={() => setActiveTab('chatbot')}
                    className="font-semibold underline hover:no-underline"
                  >
                    Iniciar um bot
                  </button>{' '}
                  nas opções acima.
                </div>
              </div>

              {/* Finish Button */}
              <div className="pt-4">
                <Button
                  onClick={handleFinish}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Finalizar
                </Button>
              </div>
            </TabsContent>

            {/* Aba Enviar mensagem */}
            <TabsContent value="message" className="space-y-6">
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

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mensagem
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem"
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Send and Finish Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSendMessageAndFinish}
                  disabled={!message.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  Enviar mensagem e finalizar
                </Button>
              </div>
            </TabsContent>

            {/* Aba Iniciar chatbot */}
            <TabsContent value="chatbot" className="space-y-6">
              {/* Search and Add Button */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar nome do chatbot"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-full border-gray-300"
                  />
                </div>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Plus className="h-5 w-5 text-white" />
                </Button>
              </div>

              {/* Chatbots List */}
              <div className="space-y-3">
                {filteredChatbots.map((chatbot) => (
                  <div
                    key={chatbot.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedChatbot === chatbot.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChatbot(chatbot.id)}
                  >
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>

                    {/* Name and description */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {chatbot.name} → {chatbot.description}
                      </div>
                    </div>

                    {/* Radio button */}
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedChatbot === chatbot.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedChatbot === chatbot.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Chatbot Button */}
              <div className="pt-4">
                <Button
                  onClick={handleStartChatbotAndHide}
                  disabled={!selectedChatbot}
                  className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg disabled:opacity-50"
                >
                  Iniciar chatbot e ocultar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};



