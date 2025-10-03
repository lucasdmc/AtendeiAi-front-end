import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  CalendarCheck,
  Clock,
  Zap,
  CheckSquare,
  Settings,
  Menu,
  X,
  Users,
  Bot,
  Brain,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard', description: 'Visão geral do sistema' },
  { path: '/conversations', icon: MessageSquare, label: 'Conversas', description: 'Chat e atendimento' },
  { path: '/contacts', icon: Users, label: 'Contatos', description: 'Gerenciar contatos' },
  { path: '/scheduled-messages', icon: Clock, label: 'Mensagens programadas', description: 'Agende mensagens automáticas' },
  { path: '/quick-replies', icon: Zap, label: 'Respostas rápidas', description: 'Templates de resposta' },
  { path: '/appointments', icon: CalendarCheck, label: 'Agendamentos', description: 'Consultas e compromissos' },
  { path: '/tasks', icon: CheckSquare, label: 'Lista de tarefas', description: 'Organize suas tarefas' },
  { path: '/chatbot', icon: Bot, label: 'Chatbot', description: 'Configurar chatbots' },
  { path: '/ai-agents', icon: Brain, label: 'Agentes de IA', description: 'Inteligência artificial' },
  { path: '/reports', icon: BarChart3, label: 'Relatórios', description: 'Análises e estatísticas' },
  { path: '/settings', icon: Settings, label: 'Configurações', description: 'Configurar sistema' },
];

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    // Recupera o estado do localStorage, padrão é true (minimizado)
    const saved = localStorage.getItem('sidebarMinimized');
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedClinic, setSelectedClinic] = useState('clinic-1');
  const location = useLocation();

  // Mock data para clínicas - será substituído por dados reais
  const clinics = [
    { id: 'clinic-1', name: 'Clínica Central' },
    { id: 'clinic-2', name: 'Clínica Norte' },
    { id: 'clinic-3', name: 'Clínica Sul' },
  ];

  // Dados do usuário - será substituído por dados reais do contexto/auth
  const userProfile = {
    name: 'Paulo Roberto',
    avatar: '' // Sem avatar - usará apenas as iniciais
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Salva o estado do sidebar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('sidebarMinimized', JSON.stringify(sidebarMinimized));
  }, [sidebarMinimized]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F5F7FB' }}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 shadow-lg transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
          ${sidebarMinimized ? 'lg:w-16' : 'lg:w-64'}
          ${sidebarOpen || !sidebarMinimized ? 'w-64' : 'w-16'}
        `}
        style={{
          backgroundColor: '#2D61E0',
          overflowX: 'hidden',
          overflowY: 'auto',
          minWidth: sidebarMinimized ? '64px' : '256px',
          maxWidth: sidebarMinimized ? '64px' : '256px',
          width: sidebarMinimized ? '64px' : '256px'
        }}
      >
        <div 
          className="flex flex-col h-full w-full" 
          style={{ 
            overflowX: 'hidden',
            width: sidebarMinimized ? '64px' : '256px',
            maxWidth: sidebarMinimized ? '64px' : '256px'
          }}
        >
          {/* Header com Seletor de Clínicas */}
          <div className={`h-16 border-b border-white border-opacity-20 ${sidebarMinimized ? 'flex items-center justify-center px-0' : 'flex items-center justify-between px-4'}`}>
            {!sidebarMinimized && (
              <div className="flex-1 mr-2">
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger className="w-full bg-white bg-opacity-10 border-white border-opacity-20 text-white">
                    <SelectValue placeholder="Selecione uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              className="hidden lg:flex h-8 w-8 p-0 flex-shrink-0 text-white hover:bg-white hover:bg-opacity-10"
              title={sidebarMinimized ? 'Expandir sidebar' : 'Minimizar sidebar'}
            >
              {sidebarMinimized ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden ${sidebarMinimized ? 'px-0' : 'px-4'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 relative
                    ${sidebarMinimized ? 'w-12 h-12 mx-auto' : 'px-3 py-3 justify-start'}
                    ${active 
                      ? 'bg-white bg-opacity-20 text-white' + (sidebarMinimized ? '' : ' border-r-4 border-white')
                      : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }
                  `}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 ${sidebarMinimized ? '' : 'mr-3'}
                    ${active ? 'text-white' : 'text-white text-opacity-70'}
                  `} />
                  {!sidebarMinimized && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-white text-opacity-50 mt-0.5">{item.description}</div>
                    </div>
                  )}
                  {sidebarMinimized && active && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-white border-opacity-20 overflow-x-hidden ${sidebarMinimized ? 'py-3 px-0' : 'p-4'}`}>
            {!sidebarMinimized ? (
              <div className="space-y-2">
                <Link to="/profile" className="block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start p-2 text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="bg-white bg-opacity-20 text-white text-xs">
                        {getInitials(userProfile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{userProfile.name}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-10 h-10 p-0 rounded-lg text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white" 
                    title={userProfile.name}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="bg-white bg-opacity-20 text-white text-xs">
                        {getInitials(userProfile.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar for mobile */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-center">
          <h1 className="text-lg font-semibold" style={{ color: '#2E2E2E' }}>AtendeAI</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
};