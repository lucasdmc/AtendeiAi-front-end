import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  LogOut,
  Radio,
  MessageSquare,
  DollarSign,
  Briefcase,
  Tag,
  Bot,
  Calendar,
  Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';


export default function Settings() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Configurações do usuário (simuladas)
  const userProfile = {
    name: 'Paulo',
    status: 'Olá! Eu estou usando o WhatsApp',
    avatar: '/api/placeholder/64/64'
  };

  // Lista de configurações principais
  const settingsItems = [
    {
      icon: Radio,
      title: 'Canais de atendimento',
      subtitle: 'Os canais que sua organização usa para se comunicar com os seus contatos',
      href: '/settings/channels'
    },
    {
      icon: DollarSign,
      title: 'Financeiro',
      subtitle: 'Veja todas as suas informações de pagamento incluindo histórico e cartões registrados.',
      href: '/settings/financial'
    },
    {
      icon: Briefcase,
      title: 'Setores',
      subtitle: 'Configurações das sub-divisões da sua organização',
      href: '/settings/departments'
    },
    {
      icon: Bot,
      title: 'Agentes de IA',
      subtitle: 'Configure e treine os seus agentes de IA',
      href: '/settings/ai-agents'
    },
    {
      icon: Users,
      title: 'Atendentes',
      subtitle: 'As pessoas que lhe ajudam com o relacionamento com seus contatos',
      href: '/settings/attendants'
    },
    {
      icon: Tag,
      title: 'Etiquetas',
      subtitle: 'Configurações das etiquetas da sua organização',
      href: '/settings/tags'
    },
    {
      icon: Bot,
      title: 'Chatbots',
      subtitle: 'Robôs para automatizar atendimentos',
      href: '/settings/chatbots'
    },
    {
      icon: MessageSquare,
      title: 'Respostas rápidas',
      subtitle: 'Mensagens pré-configuradas para enviar para seus contatos',
      href: '/settings/quick-replies'
    },
    {
      icon: Calendar,
      title: 'Mensagens agendadas',
      subtitle: 'Mensagens programadas para envio em determinado horário',
      href: '/settings/scheduled-messages'
    },
    {
      icon: Clock,
      title: 'Logs de atividade',
      subtitle: 'Consultar logs de atividades',
      href: '/settings/activity-logs'
    },
    {
      icon: Building2,
      title: 'Configurações da organização',
      subtitle: 'Configurações gerais da sua organização',
      href: '/settings/organization'
    }
  ];

  // Filtrar itens baseado na pesquisa
  const filteredItems = settingsItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-100 flex">
      {/* Menu de configurações - largura suficiente para não quebrar textos */}
      <div className="w-96 bg-white flex flex-col">
        {/* Header com título */}
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
        </div>

        {/* Barra de pesquisa */}
        <div className="px-6 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar configurações"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Perfil do usuário */}
        <div className="px-6 py-4">
          <div
            className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 rounded-lg transition-colors"
            onClick={() => navigate('/profile')}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-lg font-medium">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-lg">{userProfile.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{userProfile.status}</p>
            </div>
          </div>
        </div>

        {/* Linha separadora entre perfil e menu */}
        <div className="mx-6 border-t border-gray-200"></div>

        {/* Lista de configurações */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 py-2">
            {filteredItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (item.href) {
                      navigate(item.href);
                    } else {
                      console.log(`Clicked on ${item.title}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{item.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de desconectar */}
        <div className="px-6 py-3">
          <button className="flex items-center space-x-4 w-full text-left hover:bg-gray-50 -mx-6 px-6 py-2 rounded-lg transition-colors">
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-500">Desconectar</span>
          </button>
        </div>

        {/* Linha separadora após desconectar */}
        <div className="mx-6 border-t border-gray-200"></div>
        </div>
      </div>

      {/* Área principal responsiva - com borda esquerda de 1px */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 border-l border-gray-200">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configurações</h2>
          <p className="text-gray-500">Selecione uma opção para configurar</p>
        </div>
      </div>
    </div>
  );

}
