import React, { useState } from 'react';
import { X, Search, Building, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useConversationsContext } from '../../context/ConversationsContext';

interface TransferOption {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline';
  phone?: string;
  type: 'department' | 'agent' | 'channel';
}

// Mock data
const mockDepartments: TransferOption[] = [
  {
    id: '1',
    name: 'Geral',
    type: 'department',
    status: 'online'
  },
  {
    id: '2',
    name: 'Comercial',
    type: 'department',
    status: 'online'
  }
];

const mockAgents: TransferOption[] = [
  {
    id: '1',
    name: 'Nenhum',
    type: 'agent'
  },
  {
    id: '2',
    name: 'PauloRobertoJunior',
    avatar: '/avatars/paulo.jpg',
    type: 'agent',
    status: 'online'
  },
  {
    id: '3',
    name: 'EdnadePaula',
    avatar: '/avatars/edna.jpg',
    type: 'agent',
    status: 'offline'
  },
  {
    id: '4',
    name: 'Marcos',
    avatar: '/avatars/marcos.jpg',
    type: 'agent',
    status: 'online'
  }
];

const mockChannels: TransferOption[] = [
  {
    id: '1',
    name: 'Canal do suporte',
    phone: '+55 47 99952-8232',
    type: 'channel'
  }
];

export const TransferDrawer: React.FC = () => {
  const { transferDrawerOpen, setTransferDrawerOpen } = useConversationsContext();
  const [activeTab, setActiveTab] = useState('department');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [observations, setObservations] = useState('');

  const getTabData = () => {
    switch (activeTab) {
      case 'department':
        return mockDepartments;
      case 'agent':
        return mockAgents;
      case 'channel':
        return mockChannels;
      default:
        return [];
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'department':
        return 'Pesquisar setor';
      case 'agent':
        return 'Pesquisar atendente';
      case 'channel':
        return 'Pesquisar canal';
      default:
        return 'Pesquisar';
    }
  };

  const filteredOptions = getTabData().filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransfer = () => {
    if (!selectedOption) return;
    
    // TODO: Implement transfer logic
    console.log('Transferring to:', selectedOption, 'Observations:', observations);
    
    // Close drawer and reset state
    setTransferDrawerOpen(false);
    setSelectedOption('');
    setObservations('');
    setSearchTerm('');
  };

  const getOptionIcon = (option: TransferOption) => {
    switch (option.type) {
      case 'department':
        return <Building className="h-6 w-6 text-blue-500" />;
      case 'channel':
        return <MessageSquare className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };

  if (!transferDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[538px] bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Transferir conversa</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTransferDrawerOpen(false)}
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
              <TabsTrigger value="department" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Setor
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Atendente
              </TabsTrigger>
              <TabsTrigger value="channel" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Canal
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-full border-gray-300"
              />
            </div>

            {/* Options List */}
            <div className="space-y-2 mb-6">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {/* Avatar or Icon */}
                  <div className="relative">
                    {option.type === 'agent' ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={option.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {option.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {getOptionIcon(option)}
                      </div>
                    )}
                    
                    {/* Online status indicator */}
                    {option.status && (
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        option.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>

                  {/* Name and details */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.name}</div>
                    {option.phone && (
                      <div className="text-sm text-gray-500">{option.phone}</div>
                    )}
                  </div>

                  {/* Status badge */}
                  {option.status && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        option.status === 'online' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  )}

                  {/* Radio button */}
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === option.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Observations */}
            <div className="mb-6">
              <Textarea
                placeholder="Adicione observações sobre a transferência..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Transfer Button */}
            <Button
              onClick={handleTransfer}
              disabled={!selectedOption}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Transferir
            </Button>
          </Tabs>
        </div>
      </div>
    </div>
  );
};



