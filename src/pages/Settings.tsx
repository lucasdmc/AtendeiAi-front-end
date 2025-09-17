import { useState } from 'react';
import { ArrowLeft, Settings, User, Key, Shield, MessageSquare, Bell, Database, HelpCircle, ChevronRight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SettingsView = 'main' | 'profile' | 'account' | 'privacy' | 'chats' | 'notifications' | 'shortcuts' | 'help';

export default function Settings() {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  const navigateBack = () => {
    setCurrentView('main');
  };

  const renderMainSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <button 
          onClick={() => setCurrentView('profile')}
          className="w-full p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors"
        >
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face" />
            <AvatarFallback className="bg-gray-300 text-gray-700 text-lg">
              UD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h3 className="font-medium text-gray-900">Usuário Demo</h3>
            <p className="text-sm text-gray-500">Olá! Eu estou usando o WhatsApp.</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Settings Options */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            {
              icon: Key,
              title: 'Conta',
              subtitle: 'Notificações de segurança, dados da conta',
              action: () => setCurrentView('account')
            },
            {
              icon: Shield,
              title: 'Privacidade',
              subtitle: 'Contatos bloqueados, mensagens temporárias',
              action: () => setCurrentView('privacy')
            },
            {
              icon: MessageSquare,
              title: 'Conversas',
              subtitle: 'Tema, papel de parede, configurações de conversas',
              action: () => setCurrentView('chats')
            },
            {
              icon: Bell,
              title: 'Notificações',
              subtitle: 'Notificações de mensagens',
              action: () => setCurrentView('notifications')
            },
            {
              icon: Database,
              title: 'Atalhos do teclado',
              subtitle: 'Ações rápidas',
              action: () => setCurrentView('shortcuts')
            },
            {
              icon: HelpCircle,
              title: 'Ajuda',
              subtitle: 'Central de Ajuda, fale conosco, Política de Privacidade',
              action: () => setCurrentView('help')
            }
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Perfil</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face" />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-3xl">
                UD
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Alterar Foto
            </Button>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome</Label>
              <Input 
                id="name" 
                defaultValue="Usuário Demo" 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Recado</Label>
              <Input 
                id="status" 
                defaultValue="Olá! Eu estou usando o WhatsApp." 
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</Label>
              <Input 
                id="phone" 
                defaultValue="(48) 99999-9999" 
                className="mt-1"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Para alterar seu número, entre em contato com o suporte
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Conta</h1>
      </div>

      {/* Account Content */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Notificações de segurança', subtitle: 'Receba notificações sobre atividades da conta' },
            { title: 'Alterar senha', subtitle: 'Altere sua senha de acesso' },
            { title: 'Verificação em duas etapas', subtitle: 'Adicione uma camada extra de segurança' },
            { title: 'Sessões ativas', subtitle: 'Gerencie dispositivos conectados' },
            { title: 'Excluir conta', subtitle: 'Remover permanentemente sua conta', danger: true }
          ].map((item, index) => (
            <button
              key={index}
              className={`w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                item.danger ? 'text-red-600' : ''
              }`}
            >
              <div className="text-left">
                <div className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.title}
                </div>
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Privacidade</h1>
      </div>

      {/* Privacy Content */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Visto por último e online', subtitle: 'Todos' },
            { title: 'Foto do perfil', subtitle: 'Todos' },
            { title: 'Recado', subtitle: 'Todos' },
            { title: 'Confirmação de leitura', subtitle: 'Ativado' },
            { title: 'Grupos', subtitle: 'Todos' },
            { title: 'Contatos bloqueados', subtitle: '0 contatos' },
            { title: 'Mensagens temporárias', subtitle: 'Desativado' }
          ].map((item, index) => (
            <button
              key={index}
              className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChatSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Conversas</h1>
      </div>

      {/* Chat Content */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Tema', subtitle: 'Claro' },
            { title: 'Papel de parede', subtitle: 'Padrão' },
            { title: 'Tamanho da fonte', subtitle: 'Médio' },
            { title: 'Enter para enviar', subtitle: 'Ativado' },
            { title: 'Arquivar conversas', subtitle: 'Configurações de arquivamento' },
            { title: 'Backup das conversas', subtitle: 'Nunca' }
          ].map((item, index) => (
            <button
              key={index}
              className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
      </div>

      {/* Notification Content */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Notificações de mensagens', subtitle: 'Ativado' },
            { title: 'Som de notificação', subtitle: 'Padrão' },
            { title: 'Vibração', subtitle: 'Padrão' },
            { title: 'Luz de notificação', subtitle: 'Branca' },
            { title: 'Usar notificações de alta prioridade', subtitle: 'Ativado' },
            { title: 'Notificações de grupos', subtitle: 'Ativado' }
          ].map((item, index) => (
            <button
              key={index}
              className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortcutSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Atalhos do Teclado</h1>
      </div>

      {/* Shortcuts Content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="bg-white rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Atalhos Disponíveis</h3>
          <div className="space-y-3">
            {[
              { key: 'Ctrl + N', action: 'Nova conversa' },
              { key: 'Ctrl + Shift + ]', action: 'Próxima conversa' },
              { key: 'Ctrl + Shift + [', action: 'Conversa anterior' },
              { key: 'Ctrl + E', action: 'Arquivar conversa' },
              { key: 'Ctrl + Shift + M', action: 'Silenciar conversa' },
              { key: 'Ctrl + Backspace', action: 'Excluir conversa' },
              { key: 'Ctrl + Shift + U', action: 'Marcar como não lida' },
              { key: 'Ctrl + Shift + N', action: 'Criar grupo' }
            ].map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{shortcut.action}</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {shortcut.key}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Ajuda</h1>
      </div>

      {/* Help Content */}
      <div className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-200">
          {[
            { title: 'Central de Ajuda', subtitle: 'Perguntas frequentes e tutoriais' },
            { title: 'Fale conosco', subtitle: 'Entre em contato com o suporte' },
            { title: 'Termos e Política de Privacidade', subtitle: 'Leia nossos termos de uso' },
            { title: 'Informações do app', subtitle: 'Versão e detalhes técnicos' }
          ].map((item, index) => (
            <button
              key={index}
              className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.subtitle}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return renderProfileSettings();
      case 'account':
        return renderAccountSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'chats':
        return renderChatSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'shortcuts':
        return renderShortcutSettings();
      case 'help':
        return renderHelpSettings();
      default:
        return renderMainSettings();
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {renderCurrentView()}
    </div>
  );
}
