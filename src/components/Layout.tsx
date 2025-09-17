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
  LogOut,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  Key,
  Database,
  ChevronRight,
  User,
  Phone
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";

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
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
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
              <h1 className="text-xl font-bold text-gray-900">Atende AI</h1>
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
                      ? 'bg-orange-100 text-orange-900' + (sidebarMinimized ? '' : ' border-r-4 border-orange-500')
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 ${sidebarMinimized ? '' : 'mr-3'}
                    ${active ? 'text-orange-600' : 'text-gray-400'}
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
              <>
                <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Usuário Demo</div>
                    <div className="text-xs text-gray-500">Administrador</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 justify-start"
                    onClick={() => setSettingsModalOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                  
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="px-3" title="Sair">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  title="Configurações"
                  onClick={() => setSettingsModalOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
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
          <h1 className="text-lg font-semibold text-gray-900">Atende AI</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
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

      {/* Modal de Configurações */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          {/* Header do Modal */}
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <Settings className="h-6 w-6 text-gray-600" />
              <span>Configurações</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">
              Gerencie suas preferências e configurações do sistema
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-6">
              {/* Perfil do Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Perfil</span>
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-lg">
                        UD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                          <Input id="name" defaultValue="Usuário Demo" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                          <Input id="phone" defaultValue="(48) 99999-9999" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Alterar Foto do Perfil
                  </Button>
                </div>
              </div>

              {/* Seções de Configuração */}
              <div className="space-y-3">
                {/* Conta */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Conta</div>
                        <div className="text-sm text-gray-500">Notificações de segurança, dados da conta</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Privacidade */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Privacidade</div>
                        <div className="text-sm text-gray-500">Contatos bloqueados, mensagens temporárias</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Conversas */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Conversas</div>
                        <div className="text-sm text-gray-500">Tema, papel de parede, configurações de conversas</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Notificações */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Notificações</div>
                        <div className="text-sm text-gray-500">Notificações de mensagens</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Atalhos do teclado */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Atalhos do teclado</div>
                        <div className="text-sm text-gray-500">Ações rápidas</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Ajuda */}
                <div className="border border-gray-200 rounded-lg">
                  <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">Ajuda</div>
                        <div className="text-sm text-gray-500">Central de Ajuda, fale conosco, Política de Privacidade</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Desconectar */}
              <div className="pt-4 border-t border-gray-200">
                <Link to="/auth">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollArea>
          
          {/* Footer do Modal */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSettingsModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};