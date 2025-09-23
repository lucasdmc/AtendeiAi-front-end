import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3,
  MessageSquare, 
  Calendar,
  CalendarCheck, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/', icon: Home, label: 'Início', description: 'Página inicial' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Métricas e analytics' },
  { path: '/conversations', icon: MessageSquare, label: 'Conversas', description: 'Chat e atendimento' },
  { path: '/appointments', icon: CalendarCheck, label: 'Agendamentos', description: 'Consultas e compromissos' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', description: 'Calendário completo' },
];

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    // Recupera o estado do localStorage, padrão é true (minimizado)
    const saved = localStorage.getItem('sidebarMinimized');
    return saved ? JSON.parse(saved) : true;
  });
  const location = useLocation();

  // Salva o estado do sidebar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('sidebarMinimized', JSON.stringify(sidebarMinimized));
  }, [sidebarMinimized]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
      <div className={`
        fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
        ${sidebarMinimized ? 'lg:w-16' : 'lg:w-64'}
        ${sidebarOpen || !sidebarMinimized ? 'w-64' : 'w-16'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarMinimized && (
              <img 
                src="/images/lify-logo.png" 
                alt="Lify" 
                className="h-12 w-auto object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              className="hidden lg:flex h-8 w-8 p-0"
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
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center rounded-lg text-sm font-medium transition-colors duration-200 relative
                    ${sidebarMinimized ? 'px-2 py-3 justify-center' : 'px-3 py-3'}
                    ${active 
                      ? 'bg-pink-100 text-pink-900' + (sidebarMinimized ? '' : ' border-r-4 border-pink-500')
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 ${sidebarMinimized ? '' : 'mr-3'}
                    ${active ? 'text-pink-600' : 'text-gray-400'}
                  `} />
                  {!sidebarMinimized && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
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
          <div className="p-4 border-t border-gray-200">
            {!sidebarMinimized ? (
              <div className="flex space-x-2">
                <Link to="/settings" className="flex-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
                
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="px-3" title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Link to="/settings">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Sair">
                    <LogOut className="w-4 h-4" />
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
          <img 
            src="/images/lify-logo.png" 
            alt="Lify" 
            className="h-8 w-auto object-contain"
          />
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