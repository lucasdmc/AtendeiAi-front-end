import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Instagram,
  Globe,
  ArrowLeft,
  RefreshCw,
  Power,
  Smartphone,
  User
} from 'lucide-react';
import whatsappLogo from '@/assets/images/icons/whatsapp_logo.webp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function Channels() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQRSection, setShowQRSection] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(false);

  // Dados mockados de sessões WhatsApp
  const [sessions, setSessions] = useState<WhatsAppSession[]>([
    {
      id: '1',
      deviceName: 'iPhone João',
      userName: 'João Silva',
      phoneNumber: '+55 47 99988-7766',
      status: 'connected',
      lastActivity: '2025-09-19T13:30:00Z',
      createdAt: '2025-09-18T10:00:00Z'
    },
    {
      id: '2',
      deviceName: 'Android Recepção',
      userName: 'Maria Santos',
      phoneNumber: '+55 47 99977-6655',
      status: 'disconnected',
      lastActivity: '2025-09-18T20:15:00Z',
      createdAt: '2025-09-15T14:30:00Z'
    }
  ]);

  // Função para obter ícone do status da sessão
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '🟢 Conectado';
      case 'connecting':
        return '🟡 Reconectando...';
      case 'disconnected':
        return '🔴 Desconectado';
      default:
        return '🔴 Desconhecido';
    }
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
  const handleConnectDevice = () => {
    setShowQRSection(true);
    setConnectingDevice(true);

    // Simular geração de QR Code
    setTimeout(() => {
      setConnectingDevice(false);
      toast({
        title: "QR Code gerado!",
        description: "Abra o WhatsApp no seu celular e escaneie o código.",
      });
    }, 1000);
  };

  // Função para cancelar conexão
  const handleCancelConnection = () => {
    setShowQRSection(false);
    setConnectingDevice(false);
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
  const handleDisconnectSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? { ...session, status: 'disconnected' as const, lastActivity: new Date().toISOString() }
        : session
    ));

    toast({
      title: "Sessão desconectada",
      description: "A sessão foi desconectada com sucesso.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Canais */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Canais</h1>
        </div>

        {/* Lista de canais na sidebar */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Seus Canais</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer transition-colors">
                <img src={whatsappLogo} alt="WhatsApp" className="h-6 w-6" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    WhatsApp Business
                  </div>
                  <div className="text-xs text-gray-600">
                    +55 47 99988-7766
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700">Conectado</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal de Gerenciamento de Canais */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header da área principal */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Sessões do WhatsApp</h2>
            <p className="text-gray-600 mt-1">
              Configure e monitore suas conexões do WhatsApp Business
            </p>
          </div>
          <Button onClick={handleConnectDevice} disabled={showQRSection}>
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
                        {/* QR Code placeholder - em produção seria um QR Code real */}
                        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">QR Code</p>
                            <p className="text-xs text-gray-500">Simulado</p>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Conecte seu WhatsApp
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Abra o WhatsApp no seu celular, vá em <strong>Configurações → Dispositivos conectados → Conectar novo dispositivo</strong> e aponte a câmera para este código QR.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleCancelConnection}
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
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <span>{session.deviceName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
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
                              onClick={() => handleDisconnectSession(session.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Power className="h-4 w-4 mr-1" />
                              Desconectar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReconnectSession(session.id)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reconectar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
