import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { channelsService } from '@/services/channelsService';

// Configuração dos tipos de canal
const channelTypeConfig = {
  'whatsapp-business': {
    title: 'WhatsApp Starter',
    description: 'Aparelho celular sincronizado com o Umbler Talk através da leitura do QR Code',
    icon: MessageCircle,
    iconColor: 'text-white',
    bgColor: 'bg-blue-600',
    steps: [
      {
        number: 1,
        title: 'Esteja com o celular em mãos',
        description: 'Ele é necessário para escanear o QR Code do WhatsApp.'
      },
      {
        number: 2,
        title: 'Digite o nome do canal e clique no botão "Salvar e sincronizar"',
        description: 'Siga os passos na popup que irá aparecer.'
      }
    ]
  }
};

export default function ChannelSetup() {
  const navigate = useNavigate();
  const { channelType } = useParams<{ channelType: string }>();
  const { toast } = useToast();
  
  const [channelName, setChannelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configuração do tipo de canal atual
  const config = channelTypeConfig[channelType as keyof typeof channelTypeConfig];
  
  if (!config) {
    navigate('/settings/channels/new');
    return null;
  }

  const IconComponent = config.icon;

  const handleSaveAndSync = async () => {
    if (!channelName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para o canal.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Criar o canal no backend
      const newChannel = await channelsService.create({
        name: channelName.trim(),
        type: 'whatsapp',
        config: {
          device_name: channelName.trim(),
          user_name: 'Usuário'
        }
      });
      
      // Navegar para a tela de sincronização (modal)
      navigate(`/settings/channels/sync`, { 
        state: { 
          channelName: channelName.trim(),
          channelType: channelType || 'whatsapp-business',
          channelId: newChannel.id
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar canal:', error);
      toast({
        title: "Erro ao criar canal",
        description: error instanceof Error ? error.message : "Não foi possível criar o canal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/settings/channels/new');
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
            onClick={() => navigate('/settings/channels/new')}
            className="mb-4 text-slate-600 hover:text-slate-900 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Card principal */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header do card */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {/* Ícone do canal */}
                <div className={`p-3 rounded-xl ${config.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                
                {/* Informações */}
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {config.title}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {/* Steps */}
              <div className="space-y-4 mb-8">
                {config.steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    {/* Número do step */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.number}
                      </div>
                    </div>
                    
                    {/* Conteúdo do step */}
                    <div className="flex-1 pb-4">
                      <h3 className="font-medium text-slate-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="channel-name" className="text-sm font-medium text-slate-700">
                    Nome do canal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="channel-name"
                    type="text"
                    placeholder="Ex: Canal de todos"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="mt-1"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Este nome será usado para identificar o canal internamente.
                  </p>
                </div>

                {/* Validação visual */}
                {channelName.trim() && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Nome válido</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveAndSync}
                  disabled={!channelName.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Salvando...' : 'Salvar e sincronizar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
