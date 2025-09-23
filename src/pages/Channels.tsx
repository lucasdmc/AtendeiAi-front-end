import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Power,
  Smartphone,
  User
} from 'lucide-react';
import whatsappLogo from '@/assets/images/icons/whatsapp_logo.webp';
import whatsappApiLogo from '@/assets/images/icons/whatsapp_api_logo.png';
import instagramLogo from '@/assets/images/icons/instagram_logo.png';
import gmailLogo from '@/assets/images/icons/gmail_logo.png';
import telegramLogo from '@/assets/images/icons/telegram_logo.png';
import tiktokLogo from '@/assets/images/icons/tiktok_logo.png';
import telefoneIcon from '@/assets/images/icons/telefone_icon.png';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

interface WhatsAppSession {
  id: string;
  deviceName: string;
  userName: string;
  phoneNumber: string;
  status: 'connected' | 'connecting' | 'disconnected';
  lastActivity: string;
  createdAt: string;
}

interface ComingSoonPageProps {
  channelName: string;
  channelIcon: string;
  channelColor: string;
}

// Funções auxiliares para status e formatação
function getStatusIcon(status: string) {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'connecting':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'disconnected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <XCircle className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'connected':
      return 'Conectado';
    case 'connecting':
      return 'Conectando...';
    case 'disconnected':
      return 'Desconectado';
    default:
      return 'Desconhecido';
  }
}


function ComingSoonPage({ channelName, channelIcon, channelColor }: ComingSoonPageProps) {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${channelColor}-100 mb-6`}>
          <img src={channelIcon} alt={channelName} className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {channelName}
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Em poucos dias esse canal vai estar disponível para ser usado por sua clínica e potencializar seu atendimento.
        </p>
        <div className={`inline-flex items-center space-x-2 bg-${channelColor}-50 border border-${channelColor}-200 rounded-lg px-6 py-3`}>
          <Clock className={`h-5 w-5 text-${channelColor}-600`} />
          <span className={`text-${channelColor}-800 font-medium`}>Em breve disponível</span>
        </div>
      </div>
    </div>
  );
}

function WhatsAppBusinessPage({
  showQRSection,
  connectingDevice,
  qrCode,
  sessions,
  loading,
  onConnectDevice,
  onCancelConnection,
  onRefreshSessions,
  onCleanupSessions,
  onDisconnectSession,
  onReconnectSession,
  formatLastActivity
}: {
  showQRSection: boolean;
  connectingDevice: boolean;
  qrCode: string;
  sessions: WhatsAppSession[];
  loading: boolean;
  onConnectDevice: () => void;
  onCancelConnection: () => void;
  onRefreshSessions: () => void;
  onCleanupSessions: () => void;
  onDisconnectSession: (id: string) => void;
  onReconnectSession: (id: string) => void;
  formatLastActivity: (dateString: string) => string;
}) {
  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Cabeçalho da Página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gerenciar Sessões do WhatsApp
        </h1>
        <p className="text-gray-600">
          Configure e monitore suas conexões do WhatsApp Business
        </p>
        <div className="mt-2 flex items-center space-x-2">
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            📱 Limite: 1 sessão ativa por clínica
          </div>
          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            ✅ {sessions.filter(s => s.status === 'connected').length} de 1 sessão ativa
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-6">
        <Button
          variant="outline"
          onClick={onRefreshSessions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button
          variant="outline"
          onClick={onCleanupSessions}
          disabled={loading || sessions.length === 0}
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          🧹 Limpar Sessões
        </Button>
        <Button onClick={onConnectDevice} disabled={showQRSection || loading}>
          <Plus className="h-4 w-4 mr-2" />
          Conectar dispositivo
        </Button>
      </div>

      {/* Seção de Conexão (expansível) */}
      {showQRSection && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                {connectingDevice ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-6 w-6 text-blue-600 animate-spin" />
                    <p className="text-lg font-medium text-blue-900">Gerando QR Code...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-8 rounded-lg shadow-lg inline-block mb-4">
                      {qrCode ? (
                        <img
                          src={qrCode}
                          alt="QR Code WhatsApp"
                          className="w-48 h-48 mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">QR Code</p>
                            <p className="text-xs text-gray-500">Carregando...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Conecte seu WhatsApp
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Abra o WhatsApp no seu celular, vá em <strong>Configurações → Dispositivos conectados → Conectar novo dispositivo</strong> e aponte a câmera para este código QR.
                    </p>
                    <div className="flex items-center justify-center space-x-2 mb-4 text-sm text-blue-600">
                      <div className="animate-pulse">🔄</div>
                      <span>Verificando conexão automaticamente...</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={onCancelConnection}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Sessões Ativas</span>
          </CardTitle>
          <CardDescription>
            Gerencie suas conexões do WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Usuário vinculado</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Status da sessão</TableHead>
                  <TableHead>Última atividade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400 animate-spin" />
                        <span className="text-gray-500">Carregando sessões...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">Nenhuma sessão ativa</p>
                        <p className="text-sm text-gray-400">Clique em "Conectar dispositivo" para iniciar</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-gray-400" />
                          <span>{session.deviceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{session.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{session.phoneNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(session.status)}
                          <span>{getStatusText(session.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatLastActivity(session.lastActivity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {session.status === 'connected' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDisconnectSession(session.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Power className="h-4 w-4 mr-1" />
                              Desconectar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReconnectSession(session.id)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reconectar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Channels() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showQRSection, setShowQRSection] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Obter canal ativo da URL ou definir padrão
  const activeChannel = searchParams.get('channel') || 'whatsapp-business';

  const setActiveChannel = (channel: string) => {
    setSearchParams({ channel });
  };

  // Carregar sessões da API
  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/whatsapp/sessions?clinic_id=68cd84230e29f31cf5f5f1b8');
      const data = await response.json();

      if (data.success && data.data.items) {
        const formattedSessions: WhatsAppSession[] = data.data.items.map((item: any) => ({
          id: item.session_id,
          deviceName: item.device_name || 'Dispositivo',
          userName: item.user_name || 'Usuário',
          phoneNumber: item.phone_number ? formatPhoneNumber(item.phone_number) : 'Não conectado',
          status: item.realtime_status?.status || item.status || 'disconnected',
          lastActivity: item.last_activity,
          createdAt: item.created_at
        }));

        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro ao carregar sessões",
        description: "Não foi possível carregar as sessões do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar sessões ao montar componente
  useEffect(() => {
    loadSessions();
  }, []);

  // Polling automático quando QR estiver sendo exibido
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (showQRSection && qrCode) {
      // Verificar status da sessão a cada 3 segundos enquanto QR estiver sendo exibido
      pollingInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:3000/api/v1/whatsapp/sessions?clinic_id=68cd84230e29f31cf5f5f1b8');
          const data = await response.json();

          if (data.success && data.data.items.length > 0) {
            const session = data.data.items[0];

            // Se a sessão estiver conectada, esconder o QR e recarregar
            if (session.realtime_status?.status === 'connected') {
              console.log('Sessão conectada! Escondendo QR...');
              setShowQRSection(false);
              setQrCode('');
              await loadSessions();

              toast({
                title: "Dispositivo conectado!",
                description: "Seu WhatsApp foi conectado com sucesso.",
              });
            }
          }
        } catch (error) {
          console.error('Erro no polling:', error);
        }
      }, 3000); // Verificar a cada 3 segundos
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [showQRSection, qrCode]);

  // Função para formatar número de telefone
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone === '') return 'Não conectado';

    // Remove o @s.whatsapp.net se existir
    const cleanPhone = phone.replace('@s.whatsapp.net', '');

    // Formata o número brasileiro
    if (cleanPhone.startsWith('55')) {
      const number = cleanPhone.slice(2);
      if (number.length === 11) {
        return `+55 ${number.slice(0, 2)} ${number.slice(2, 7)}-${number.slice(7)}`;
      }
    }

    return `+${cleanPhone}`;
  };

  // Função para formatar data da última atividade
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função para conectar dispositivo
  const handleConnectDevice = async () => {
    try {
      setShowQRSection(true);
      setConnectingDevice(true);
      setQrCode('');

      // Criar nova sessão no backend
      const createResponse = await fetch('http://localhost:3000/api/v1/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: '68cd84230e29f31cf5f5f1b8',
          device_name: 'Novo Dispositivo',
          user_name: 'Usuário Atual'
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Erro ao criar sessão');
      }

      const sessionData = await createResponse.json();

      // Aguardar um pouco para o Baileys inicializar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar QR Code
      const qrResponse = await fetch(`http://localhost:3000/api/v1/whatsapp/sessions/${sessionData.data.session_id}/qr`, {
        method: 'POST',
      });

      if (!qrResponse.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const qrData = await qrResponse.json();

      setConnectingDevice(false);
      setQrCode(qrData.data.qr_code);

      toast({
        title: "QR Code gerado!",
        description: "Abra o WhatsApp no seu celular e escaneie o código.",
      });

      // Recarregar sessões após criar nova sessão
      await loadSessions();

    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      setConnectingDevice(false);
      setShowQRSection(false);
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar o dispositivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para cancelar conexão
  const handleCancelConnection = () => {
    setShowQRSection(false);
    setConnectingDevice(false);
    setQrCode('');
    toast({
      title: "Conexão cancelada",
      description: "A conexão do dispositivo foi cancelada.",
    });
  };

  // Função para reconectar sessão
  const handleReconnectSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? { ...session, status: 'connecting' as const }
        : session
    ));

    // Simular reconexão
    setTimeout(() => {
      setSessions(sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'connected' as const, lastActivity: new Date().toISOString() }
          : session
      ));
      toast({
        title: "Sessão reconectada!",
        description: "A sessão foi reconectada com sucesso.",
      });
    }, 2000);
  };

  // Função para desconectar sessão
  const handleDisconnectSession = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/whatsapp/sessions/${sessionId}/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        // Recarregar sessões após desconectar
        await loadSessions();
        toast({
          title: "Sessão desconectada",
          description: "A sessão foi desconectada com sucesso.",
        });
      } else {
        throw new Error('Erro ao desconectar sessão');
      }
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar a sessão.",
        variant: "destructive",
      });
    }
  };

  // Função para limpar todas as sessões
  const handleCleanupSessions = async () => {
    if (!confirm('Tem certeza que deseja limpar todas as sessões? Esta ação desconectará todas as sessões ativas.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/whatsapp/sessions/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: '68cd84230e29f31cf5f5f1b8'
        }),
      });

      if (response.ok) {
        // Recarregar sessões após limpeza
        await loadSessions();
        toast({
          title: "Sessões limpas",
          description: "Todas as sessões foram desconectadas com sucesso.",
        });
      } else {
        throw new Error('Erro ao limpar sessões');
      }
    } catch (error) {
      toast({
        title: "Erro na limpeza",
        description: "Não foi possível limpar as sessões.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Canais */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Canais</h1>
        </div>

        {/* Lista de canais na sidebar */}
        <ScrollArea className="flex-1 border-t-0">
          <div className="px-6 pt-0 pb-4 border-t-0">
            {/* Removendo qualquer linha divisória acima do título */}
            <div className="mb-4 border-t-0 border-b-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Seus Canais</h3>
            </div>
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'whatsapp-business'
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-green-50 border border-green-200 hover:bg-green-100'
                }`}
                onClick={() => setActiveChannel('whatsapp-business')}
              >
                <img src={whatsappLogo} alt="WhatsApp" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    WhatsApp Business
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'whatsapp-api'
                    ? 'bg-emerald-100 border border-emerald-300'
                    : 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                }`}
                onClick={() => setActiveChannel('whatsapp-api')}
              >
                <img src={whatsappApiLogo} alt="WhatsApp API" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    WhatsApp API
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'instagram'
                    ? 'bg-pink-100 border border-pink-300'
                    : 'bg-pink-50 border border-pink-200 hover:bg-pink-100'
                }`}
                onClick={() => setActiveChannel('instagram')}
              >
                <img src={instagramLogo} alt="Instagram" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Instagram DM
                  </div>
                </div>
                <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  Em breve
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'gmail'
                    ? 'bg-red-100 border border-red-300'
                    : 'bg-red-50 border border-red-200 hover:bg-red-100'
                }`}
                onClick={() => setActiveChannel('gmail')}
              >
                <img src={gmailLogo} alt="Gmail" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Gmail
                  </div>
                </div>
                <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  Em breve
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'telegram'
                    ? 'bg-cyan-100 border border-cyan-300'
                    : 'bg-cyan-50 border border-cyan-200 hover:bg-cyan-100'
                }`}
                onClick={() => setActiveChannel('telegram')}
              >
                <img src={telegramLogo} alt="Telegram" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Telegram
                  </div>
                </div>
                <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  Em breve
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'tiktok'
                    ? 'bg-gray-100 border border-gray-300'
                    : 'bg-black border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setActiveChannel('tiktok')}
              >
                <img src={tiktokLogo} alt="TikTok" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${activeChannel === 'tiktok' ? 'text-gray-900' : 'text-white'}`}>
                    TikTok
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  activeChannel === 'tiktok'
                    ? 'bg-gray-300 text-gray-800'
                    : 'bg-gray-300 text-gray-800'
                }`}>
                  Em breve
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChannel === 'telefone'
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                }`}
                onClick={() => setActiveChannel('telefone')}
              >
                <img src={telefoneIcon} alt="Telefone" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Ligação Telefônica
                  </div>
                </div>
                <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  Em breve
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Área principal - Renderização condicional baseada no canal ativo */}
      {activeChannel === 'whatsapp-business' ? (
        <WhatsAppBusinessPage
          showQRSection={showQRSection}
          connectingDevice={connectingDevice}
          qrCode={qrCode}
          sessions={sessions}
          loading={loading}
          onConnectDevice={handleConnectDevice}
          onCancelConnection={handleCancelConnection}
          onRefreshSessions={loadSessions}
          onCleanupSessions={handleCleanupSessions}
          onDisconnectSession={handleDisconnectSession}
          onReconnectSession={handleReconnectSession}
          formatLastActivity={formatLastActivity}
        />
      ) : (
        <ComingSoonPage
          channelName={
            activeChannel === 'whatsapp-api' ? 'WhatsApp API' :
            activeChannel === 'instagram' ? 'Instagram DM' :
            activeChannel === 'gmail' ? 'Gmail' :
            activeChannel === 'telegram' ? 'Telegram' :
            activeChannel === 'tiktok' ? 'TikTok' :
            activeChannel === 'telefone' ? 'Ligação Telefônica' :
            'Canal'
          }
          channelIcon={
            activeChannel === 'whatsapp-api' ? whatsappApiLogo :
            activeChannel === 'instagram' ? instagramLogo :
            activeChannel === 'gmail' ? gmailLogo :
            activeChannel === 'telegram' ? telegramLogo :
            activeChannel === 'tiktok' ? tiktokLogo :
            activeChannel === 'telefone' ? telefoneIcon :
            whatsappLogo
          }
          channelColor={
            activeChannel === 'whatsapp-api' ? 'emerald' :
            activeChannel === 'instagram' ? 'pink' :
            activeChannel === 'gmail' ? 'red' :
            activeChannel === 'telegram' ? 'cyan' :
            activeChannel === 'tiktok' ? 'gray' :
            activeChannel === 'telefone' ? 'blue' :
            'green'
          }
        />
      )}
    </div>
  );
}
