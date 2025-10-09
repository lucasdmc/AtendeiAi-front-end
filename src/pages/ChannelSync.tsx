import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  X,
  MessageCircle,
  Smartphone,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { whatsappSessionService } from '@/services/whatsappSessionService';
import { channelsService } from '@/services/channelsService';
import { useWebSocket } from '@/hooks/useWebSocket';

// Estados da sincronização
type SyncStatus = 'initializing' | 'creating-session' | 'qr-ready' | 'connecting' | 'connected' | 'error';

interface SyncState {
  channelName: string;
  channelType: string;
  channelId: string;
}

interface SessionData {
  sessionId: string;
  qrCode?: string;
  expiresAt?: Date;
}

export default function ChannelSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  
  const syncState = location.state as SyncState;
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('initializing');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<'sync' | 'recommendations'>('sync');
  const [error, setError] = useState<string>('');

  // Conectar WebSocket para receber eventos
  const { socket, isConnected } = useWebSocket({
    url: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3000',
    institutionId: selectedInstitution?._id || '',
    userId: 'channel-sync',
    autoConnect: true
  });

  // Se não há estado, redirecionar
  useEffect(() => {
    if (!syncState) {
      navigate('/settings/channels');
      return;
    }

    // Iniciar processo de criação de sessão
    initializeSession();
  }, [syncState, navigate]);

  // Tratar evento de conflito de telefone
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePhoneConflict = (data: {
      sessionId: string;
      phoneNumber: string;
      error: string;
      existingSession?: any;
      existingChannel?: any;
      existingInstitution?: any;
    }) => {
      console.log('🚨 [CHANNEL SYNC] Conflito de telefone detectado:', data);
      
      // Verificar se é para a sessão atual
      if (sessionData && data.sessionId === sessionData.sessionId) {
        setSyncStatus('error');
        setError(`Telefone já em uso: ${data.error}`);
        
        // Mostrar toast com detalhes do conflito
        toast({
          title: "Telefone já está em uso",
          description: `Este número (${data.phoneNumber}) já está associado ao canal "${data.existingChannel?.name || 'Desconhecido'}" da organização "${data.existingInstitution?.name || 'Desconhecida'}"`,
          variant: "destructive",
        });
      }
    };

    socket.on('phoneConflict', handlePhoneConflict);

    return () => {
      socket.off('phoneConflict', handlePhoneConflict);
    };
  }, [socket, isConnected, sessionData, toast]);

  const initializeSession = async () => {
    try {
      setSyncStatus('creating-session');
      setError('');

      // Limpar sessões antigas primeiro
      const institutionId = selectedInstitution?._id || '';
      if (!institutionId) {
        throw new Error('Nenhuma instituição selecionada');
      }
      
      await whatsappSessionService.cleanupSessions(institutionId);

      // Criar nova sessão
      const sessionResult = await whatsappSessionService.createSession(
        institutionId,
        syncState.channelName,
        'Usuário'
      );

      if (!sessionResult.success || !sessionResult.data?.session_id) {
        throw new Error(sessionResult.message || 'Erro ao criar sessão');
      }

      const sessionId = sessionResult.data.session_id;
      
      // Aguardar um pouco para a sessão ser inicializada
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Gerar QR Code
      const qrResult = await whatsappSessionService.generateQRCode(sessionId);

      if (!qrResult.success || !qrResult.data?.qr_code) {
        throw new Error(qrResult.message || 'Erro ao gerar QR Code');
      }

      // Configurar dados da sessão
      const expiresAt = qrResult.data.expires_at ? new Date(qrResult.data.expires_at) : new Date(Date.now() + 120000);
      const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      setSessionData({
        sessionId,
        qrCode: qrResult.data.qr_code,
        expiresAt
      });

      setCountdown(timeLeft);
      setSyncStatus('qr-ready');

      // Iniciar verificação de status
      startStatusPolling(sessionId);

    } catch (error) {
      console.error('Erro ao inicializar sessão:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setSyncStatus('error');
    }
  };

  const startStatusPolling = (sessionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResult = await whatsappSessionService.getSessionStatus(sessionId);
        
        if (statusResult.success && statusResult.data) {
          const status = statusResult.data.status;
          
          if (status === 'connected') {
            clearInterval(pollInterval);
            setSyncStatus('connected');
            
            // Associar sessão ao canal
            const associationResult = await associateSessionToChannel(sessionId);
            
            if (associationResult.success) {
              // Fechar modal após sucesso
              setTimeout(() => {
                handleClose();
                toast({
                  title: "Canal sincronizado!",
                  description: `${syncState.channelName} foi conectado com sucesso.`,
                });
              }, 2000);
            } else {
              // Erro na associação (provavelmente conflito de telefone)
              setSyncStatus('error');
              setError(associationResult.message || 'Erro ao associar sessão ao canal');
            }
          } else if (status === 'error') {
            clearInterval(pollInterval);
            setSyncStatus('error');
            setError('Erro na conexão da sessão');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Limpar intervalo após 5 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const associateSessionToChannel = async (sessionId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!selectedInstitution?._id) {
        console.error('Nenhuma instituição selecionada para associar sessão');
        return { success: false, message: 'Instituição não selecionada' };
      }

      // Associar sessão ao canal
      await channelsService.associateSession(syncState.channelId, {
        session_id: sessionId,
        session_type: 'whatsapp'
      }, selectedInstitution._id);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao associar sessão ao canal:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  };

  // Countdown do QR Code
  useEffect(() => {
    if (countdown > 0 && syncStatus === 'qr-ready') {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && syncStatus === 'qr-ready') {
      setSyncStatus('error');
      setError('QR Code expirado');
    }
  }, [countdown, syncStatus]);

  const handleClose = () => {
    navigate('/settings/channels');
  };

  const handleGenerateNewQR = () => {
    initializeSession();
  };

  const handleCleanSessions = () => {
    toast({
      title: "Sessões limpas",
      description: "Todas as sessões antigas foram removidas.",
    });
    handleGenerateNewQR();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSyncContent = () => {
    switch (syncStatus) {
      case 'initializing':
      case 'creating-session':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-slate-600">
              {syncStatus === 'creating-session' 
                ? 'Criando sessão WhatsApp...'
                : 'Aguarde... estamos iniciando sua sessão...'
              }
            </p>
          </div>
        );

      case 'qr-ready':
        return (
          <div className="text-center">
            {/* QR Code */}
            <div className="bg-white p-8 rounded-2xl shadow-lg inline-block mb-6 border">
              {sessionData?.qrCode ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={sessionData.qrCode} 
                    alt="QR Code WhatsApp"
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      console.error('Erro ao carregar QR Code:', e);
                      setError('Erro ao carregar QR Code');
                      setSyncStatus('error');
                    }}
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">QR Code</p>
                    <p className="text-xs text-gray-500">Carregando...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instruções */}
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Sincronize o Umbler Talk com o seu Whatsapp!
            </h3>
            
            {/* Countdown */}
            {countdown > 0 && (
              <div className="mb-4">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Expira em {formatTime(countdown)}
                </Badge>
              </div>
            )}

            {/* Steps */}
            <div className="text-left max-w-md mx-auto space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">Abra o WhatsApp em seu celular</p>
                  <div className="text-xs text-slate-600 mt-1">
                    <p><strong>Android:</strong> Toque em Mais informações &gt; Aparelhos conectados</p>
                    <p><strong>iPhone:</strong> Toque em Configurações &gt; Aparelhos conectados</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p className="text-sm text-slate-700">Toque em <strong>Conectar um aparelho</strong>.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-sm text-slate-700">Aponte o seu celular para esta tela para capturar o código gerado.</p>
              </div>
            </div>

            {/* Link de ajuda */}
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mx-auto mb-4"
              onClick={() => {/* Abrir modal de ajuda */}}
            >
              <HelpCircle className="w-4 h-4" />
              Este processo é seguro?
            </button>

            {/* Problema com conexão */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Problema com a conexão?</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateNewQR}
                className="mr-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar um novo QR Code
              </Button>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="w-full h-full border-4 border-green-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Conectando...
            </h3>
            <p className="text-slate-600">
              QR Code escaneado! Aguarde a confirmação da conexão...
            </p>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Conectado com sucesso!
            </h3>
            <p className="text-slate-600">
              Seu canal {syncState.channelName} está pronto para uso.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {error.includes('expirado') ? 'QR Code expirado' : 'Erro na conexão'}
            </h3>
            <p className="text-slate-600 mb-4">
              {error || 'Ocorreu um erro durante o processo de sincronização.'}
            </p>
            <Button onClick={handleGenerateNewQR}>
              Tentar novamente
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">
          Limpe as sessões no seu aparelho antes de continuar
        </h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>1.</strong> Abra o WhatsApp em seu celular</p>
          <div className="ml-4">
            <p>• <strong>Android:</strong> Toque em Mais informações &gt; Aparelhos conectados</p>
            <p>• <strong>iPhone:</strong> Toque em Configurações &gt; Aparelhos conectados</p>
          </div>
          <p><strong>2.</strong> Toque em um aparelho conectado.</p>
          <p><strong>3.</strong> Toque em <strong>DESCONECTAR</strong>.</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button 
            size="sm"
            onClick={handleCleanSessions}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Já limpei as sessões e quero continuar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">WhatsApp Starter</DialogTitle>
                <p className="text-sm text-slate-600">
                  {syncState?.channelName || 'Novo Canal'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('sync')}
          >
            Como sincronizar
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'recommendations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recomendações
          </button>
        </div>

        {/* Conteúdo */}
        <div className="min-h-[400px]">
          {activeTab === 'sync' ? renderSyncContent() : renderRecommendations()}
        </div>
      </DialogContent>
    </Dialog>
  );
}