import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Users, 
  Building2, 
  FileText, 
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
  { path: '/', icon: Home, label: 'Dashboard', description: 'Visão geral do sistema' },
  { path: '/conversations', icon: MessageSquare, label: 'Conversas', description: 'Chat e atendimento' },
  { path: '/appointments', icon: Calendar, label: 'Agendamentos', description: 'Consultas e compromissos' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', description: 'Calendário completo' },
  { path: '/users', icon: Users, label: 'Usuários', description: 'Gestão de usuários' },
  { path: '/clinics', icon: Building2, label: 'Clínicas', description: 'Gestão de clínicas' },
  { path: '/context', icon: FileText, label: 'Contexto', description: 'Configuração do bot' },
];

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Atende AI</h1>
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
                    flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                    ${active 
                      ? 'bg-orange-100 text-orange-900 border-r-4 border-orange-500' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 mr-3
                    ${active ? 'text-orange-600' : 'text-gray-400'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center px-3 py-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Usuário Demo</div>
                <div className="text-xs text-gray-500">Administrador</div>
              </div>
            </div>
            
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="w-full mt-2 justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-center">
          <h1 className="text-lg font-semibold text-gray-900">Atende AI</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
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