import { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, User, Key, Shield, MessageSquare, Bell, Database, HelpCircle, ChevronRight, Edit2, FileText, Plus, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type SettingsView = 'main' | 'profile' | 'account' | 'privacy' | 'chats' | 'notifications' | 'shortcuts' | 'help' | 'templates';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'agendamento' | 'consulta' | 'exame' | 'receita' | 'outro';
  usageCount: number;
  createdAt: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Agendamento Confirmado',
    content: 'Olá! Sua consulta foi agendada para {data} às {hora} com {medico}. Por favor, chegue 15 minutos antes.',
    category: 'agendamento',
    usageCount: 45,
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Lembrete de Consulta',
    content: 'Lembramos que você tem consulta marcada para amanhã às {hora}. Confirme sua presença.',
    category: 'consulta',
    usageCount: 32,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Resultado de Exame',
    content: 'Seus exames estão prontos! Pode retirar na recepção ou agendar uma consulta para avaliação.',
    category: 'exame',
    usageCount: 28,
    createdAt: '2024-01-20'
  }
];

const templateCategories = [
  { value: 'agendamento', label: 'Agendamento' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'exame', label: 'Exame' },
  { value: 'receita', label: 'Receita' },
  { value: 'outro', label: 'Outro' }
];

export default function Settings() {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  
  // Estados para templates
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('outro');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const navigateBack = () => {
    setCurrentView('main');
  };

  // Funções para templates
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent,
      category: newTemplateCategory as Template['category'],
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setNewTemplateCategory(template.category);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !newTemplateName.trim() || !newTemplateContent.trim()) return;
    
    setTemplates(prev => prev.map(template => 
      template.id === editingTemplate.id 
        ? { 
            ...template, 
            name: newTemplateName, 
            content: newTemplateContent,
            category: newTemplateCategory as Template['category']
          }
        : template
    ));
    
    cancelTemplateEdit();
  };

  const cancelTemplateEdit = () => {
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateCategory('outro');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const renderMainSettings = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
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
              icon: FileText,
              title: 'Templates',
              subtitle: 'Gerenciar templates de mensagens',
              action: () => setCurrentView('templates')
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

  const renderTemplateSettings = () => (
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
        <h1 className="text-xl font-semibold text-gray-900">Templates de Mensagens</h1>
      </div>

      {/* Template Content */}
      <div className="flex-1 bg-gray-50">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Formulário de criação/edição */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Ex: Agendamento Confirmado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Categoria</Label>
                    <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-content">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="template-content"
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    placeholder="Digite o conteúdo do template..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500">
                    Use {"{variável}"} para campos dinâmicos (ex: {"{nome}"}, {"{data}"}, {"{hora}"})
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {editingTemplate && (
                    <Button variant="outline" onClick={cancelTemplateEdit}>
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'Atualizar Template' : 'Criar Template'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de templates existentes */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Templates Existentes</h3>
                <span className="text-sm text-gray-500">{templates.length} templates criados</span>
              </div>
              
              <div className="space-y-3">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {templateCategories.find(c => c.value === template.category)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {template.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Usado {template.usageCount} vezes</span>
                          <span>Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditTemplate(template)}
                          title="Editar template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Deletar template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
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
      case 'templates':
        return renderTemplateSettings();
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
