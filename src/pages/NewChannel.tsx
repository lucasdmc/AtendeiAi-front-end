import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Mail,
  Music,
  Phone,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';

// Tipos de canal disponíveis
const channelTypes = [
  {
    id: 'whatsapp-business',
    title: 'WhatsApp Business',
    description: 'Aparelho celular sincronizado com o Umbler Talk através da leitura do QR Code',
    icon: MessageCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    available: true,
    recommended: false,
    features: [
      'Depende do smartphone',
      'Início rápido',
      'Necessita de reconexão periódica'
    ]
  },
  {
    id: 'whatsapp-api',
    title: 'WhatsApp API',
    description: 'Sua conta conectada diretamente com os servidores da Meta',
    icon: MessageCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    available: true,
    recommended: true,
    features: [
      'Estabilidade de conexão garantida',
      'Permite o uso de botões',
      'Sem risco de banimento (*segundo as diretrizes da Meta)'
    ]
  },
  {
    id: 'instagram',
    title: 'Instagram DM',
    description: 'Direct messages do Instagram',
    icon: MessageCircle,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    available: false,
    recommended: false
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Comunicação por email',
    icon: Mail,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    available: false,
    recommended: false
  },
  {
    id: 'telegram',
    title: 'Telegram',
    description: 'Bot do Telegram',
    icon: Send,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    available: false,
    recommended: false
  },
  {
    id: 'tiktok',
    title: 'TikTok',
    description: 'Mensagens do TikTok',
    icon: Music,
    iconColor: 'text-gray-900',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    available: false,
    recommended: false
  },
  {
    id: 'phone',
    title: 'Ligação Telefônica',
    description: 'Chamadas telefônicas',
    icon: Phone,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    available: false,
    recommended: false
  }
];

interface ChannelTypeCardProps {
  channelType: typeof channelTypes[0];
  onSelect: () => void;
}

function ChannelTypeCard({ channelType, onSelect }: ChannelTypeCardProps) {
  const IconComponent = channelType.icon;
  
  return (
    <div 
      className={`
        relative p-6 rounded-2xl border-2 transition-all cursor-pointer group
        ${channelType.available 
          ? `${channelType.bgColor} ${channelType.borderColor} hover:shadow-md hover:scale-[1.02]`
          : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
        }
      `}
      onClick={channelType.available ? onSelect : undefined}
    >
      {/* Badge de recomendado */}
      {channelType.recommended && (
        <div className="absolute -top-2 left-4">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Recomendado
          </span>
        </div>
      )}

      {/* Badge de em breve */}
      {!channelType.available && (
        <div className="absolute -top-2 right-4">
          <span className="bg-gray-400 text-white text-xs font-medium px-2 py-1 rounded-full">
            Em breve
          </span>
        </div>
      )}

      {/* Ícone */}
      <div className={`w-16 h-16 rounded-2xl ${channelType.bgColor} ${channelType.borderColor} border flex items-center justify-center mb-4`}>
        <IconComponent className={`w-8 h-8 ${channelType.iconColor}`} />
      </div>

      {/* Conteúdo */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {channelType.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {channelType.description}
        </p>
      </div>

      {/* Features (apenas para canais disponíveis) */}
      {channelType.available && channelType.features && (
        <div className="space-y-2 mb-4">
          {channelType.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botão de ação */}
      <div className="mt-6">
        {channelType.available ? (
          <Button 
            className="w-full justify-between group-hover:bg-blue-700"
            onClick={onSelect}
          >
            {channelType.id === 'whatsapp-api' ? 'Falar com o comercial' : 'Criar canal'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full cursor-not-allowed" 
            disabled
          >
            Avise-me
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewChannel() {
  const navigate = useNavigate();

  const handleSelectChannelType = (channelTypeId: string) => {
    if (channelTypeId === 'whatsapp-api') {
      // Para WhatsApp API, pode abrir modal ou página específica
      console.log('Falar com comercial - WhatsApp API');
      return;
    }
    
    // Para outros tipos, navegar para a tela de configuração
    navigate(`/settings/channels/new/${channelTypeId}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FD]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <button 
              onClick={() => navigate('/settings')}
              className="hover:text-slate-700 transition-colors"
            >
              Configurações
            </button>
            <span>/</span>
            <button 
              onClick={() => navigate('/settings/channels')}
              className="hover:text-slate-700 transition-colors"
            >
              Canais de atendimento
            </button>
            <span>/</span>
            <span>Novo canal</span>
          </div>

          {/* Botão voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate('/settings/channels')}
            className="mb-4 text-slate-600 hover:text-slate-900 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Título */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Novo canal</h1>
          <p className="text-slate-500">
            Escolha o tipo de canal que deseja criar para sua organização.
          </p>
        </div>

        {/* Grid de tipos de canal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {channelTypes.map((channelType) => (
            <ChannelTypeCard
              key={channelType.id}
              channelType={channelType}
              onSelect={() => handleSelectChannelType(channelType.id)}
            />
          ))}
        </div>

        {/* Informação adicional */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl max-w-4xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Precisa de ajuda para escolher?
          </h3>
          <p className="text-blue-700 mb-4">
            Nossa equipe pode ajudar você a escolher o melhor canal para suas necessidades.
          </p>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            Falar com suporte
          </Button>
        </div>
      </div>
    </div>
  );
}
