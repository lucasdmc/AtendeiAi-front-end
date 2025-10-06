import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Clock,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interfaces para tipagem dos dados
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

interface ConversationData {
  id: string;
  customerName: string;
  channel: 'whatsapp' | 'email' | 'phone';
  status: 'active' | 'waiting' | 'resolved';
  lastMessage: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChannelPerformance {
  channel: string;
  conversations: number;
  responseTime: string;
  satisfaction: number;
  icon: React.ElementType;
  color: string;
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Dados simulados - em produção viriam da API
  const metricsData: MetricCard[] = [
    {
      title: 'Conversas Ativas',
      value: 247,
      change: 12.5,
      changeType: 'increase',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Clientes Atendidos',
      value: 1834,
      change: 8.2,
      changeType: 'increase',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Tempo Médio de Resposta',
      value: '2.3min',
      change: -15.3,
      changeType: 'decrease',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Taxa de Resolução',
      value: '94.2%',
      change: 3.1,
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ];

  const recentConversations: ConversationData[] = [
    {
      id: '1',
      customerName: 'Maria Silva',
      channel: 'whatsapp',
      status: 'active',
      lastMessage: 'Preciso remarcar minha consulta para próxima semana',
      timestamp: '2 min atrás',
      priority: 'high'
    },
    {
      id: '2',
      customerName: 'João Santos',
      channel: 'email',
      status: 'waiting',
      lastMessage: 'Gostaria de saber sobre os exames disponíveis',
      timestamp: '5 min atrás',
      priority: 'medium'
    },
    {
      id: '3',
      customerName: 'Ana Costa',
      channel: 'phone',
      status: 'resolved',
      lastMessage: 'Obrigada pelo atendimento!',
      timestamp: '10 min atrás',
      priority: 'low'
    },
    {
      id: '4',
      customerName: 'Pedro Oliveira',
      channel: 'whatsapp',
      status: 'active',
      lastMessage: 'Qual o horário de funcionamento da clínica?',
      timestamp: '15 min atrás',
      priority: 'medium'
    },
    {
      id: '5',
      customerName: 'Carla Mendes',
      channel: 'email',
      status: 'waiting',
      lastMessage: 'Preciso de informações sobre convênios aceitos',
      timestamp: '20 min atrás',
      priority: 'high'
    }
  ];

  const channelPerformance: ChannelPerformance[] = [
    {
      channel: 'WhatsApp',
      conversations: 156,
      responseTime: '1.8min',
      satisfaction: 96,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      channel: 'Email',
      conversations: 67,
      responseTime: '4.2min',
      satisfaction: 89,
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      channel: 'Telefone',
      conversations: 24,
      responseTime: '0.5min',
      satisfaction: 98,
      color: 'text-orange-600',
      icon: Phone
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return MessageSquare;
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      default:
        return MessageSquare;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Visão geral do desempenho do seu chatbot
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricsData.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="flex items-center text-sm">
                      {metric.changeType === 'increase' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(metric.change)}%
                      </span>
                      <span className="text-gray-500 ml-1">vs período anterior</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversas Recentes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Conversas Recentes</CardTitle>
                      <CardDescription>
                        Últimas interações com clientes
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentConversations.map((conversation) => {
                      const ChannelIcon = getChannelIcon(conversation.channel);
                      return (
                        <div
                          key={conversation.id}
                          className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <ChannelIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {conversation.customerName}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(conversation.priority)}>
                                  {conversation.priority}
                                </Badge>
                                <Badge className={getStatusColor(conversation.status)}>
                                  {conversation.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {conversation.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      Ver todas as conversas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance por Canal */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance por Canal</CardTitle>
                  <CardDescription>
                    Desempenho dos canais de atendimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {channelPerformance.map((channel, index) => {
                      const Icon = channel.icon;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-4 w-4 ${channel.color}`} />
                              <span className="text-sm font-medium">{channel.channel}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {channel.conversations} conversas
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Satisfação</span>
                              <span>{channel.satisfaction}%</span>
                            </div>
                            <Progress value={channel.satisfaction} className="h-2" />
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Tempo médio: {channel.responseTime}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Status do Sistema */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Chatbot</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">WhatsApp API</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Email Service</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Lento</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Base de Dados</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Normal</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gráficos e Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversas por Hora</CardTitle>
                <CardDescription>
                  Volume de conversas nas últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Gráfico de conversas por hora</p>
                    <p className="text-xs text-gray-400">Implementar com biblioteca de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Canal</CardTitle>
                <CardDescription>
                  Percentual de conversas por canal de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Gráfico de distribuição por canal</p>
                    <p className="text-xs text-gray-400">Implementar com biblioteca de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">Nova Conversa</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Agendar</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Clientes</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
