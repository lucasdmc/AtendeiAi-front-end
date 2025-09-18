import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, User, ChevronRight, Edit2, FileText, Plus, Edit, Trash2, Tag, Users, Building2, MapPin, Phone, Bot, Clock, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type SettingsView = 'main' | 'profile' | 'templates' | 'flags' | 'context';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'agendamento' | 'consulta' | 'exame' | 'receita' | 'outro';
  usageCount: number;
  createdAt: string;
}

interface Flag {
  id: string;
  name: string;
  color: string;
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

const mockFlags: Flag[] = [
  { id: '1', name: 'Urgente', color: '#EF4444', createdAt: '2024-01-15' },
  { id: '2', name: 'Retorno', color: '#3B82F6', createdAt: '2024-01-20' },
  { id: '3', name: 'Primeira Consulta', color: '#E91E63', createdAt: '2024-01-25' }
];

const colorOptions = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Rosa', value: '#E91E63' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cinza', value: '#6B7280' }
];

export default function Settings() {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  
  // Estados para templates
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('outro');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Estados para flags
  const [flags, setFlags] = useState<Flag[]>(mockFlags);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagColor, setNewFlagColor] = useState('#3B82F6');
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);

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

  // Funções para flags
  const handleCreateFlag = () => {
    if (!newFlagName.trim()) return;
    
    const newFlag: Flag = {
      id: Date.now().toString(),
      name: newFlagName,
      color: newFlagColor,
      createdAt: new Date().toISOString()
    };
    
    setFlags(prev => [...prev, newFlag]);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
  };

  const handleEditFlag = (flag: Flag) => {
    setEditingFlag(flag);
    setNewFlagName(flag.name);
    setNewFlagColor(flag.color);
  };

  const handleUpdateFlag = () => {
    if (!editingFlag || !newFlagName.trim()) return;
    
    setFlags(prev => prev.map(flag => 
      flag.id === editingFlag.id 
        ? { ...flag, name: newFlagName, color: newFlagColor }
        : flag
    ));
    
    cancelFlagEdit();
  };

  const cancelFlagEdit = () => {
    setEditingFlag(null);
    setNewFlagName('');
    setNewFlagColor('#3B82F6');
  };

  const handleDeleteFlag = (flagId: string) => {
    setFlags(prev => prev.filter(flag => flag.id !== flagId));
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
          {/* Links para telas originais */}
          <Link to="/users" className="block">
            <div className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Usuários</div>
                  <div className="text-sm text-gray-500">Gestão de usuários do sistema</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <Link to="/clinics" className="block">
            <div className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Clínicas</div>
                  <div className="text-sm text-gray-500">Gestão de clínicas e unidades</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </Link>

          <button
            onClick={() => setCurrentView('context')}
            className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Contexto</div>
                <div className="text-sm text-gray-500">Configuração do bot e contexto</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          {/* Seções internas do Settings */}
          <button
            onClick={() => setCurrentView('templates')}
            className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Templates</div>
                <div className="text-sm text-gray-500">Gerenciar templates de mensagens</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('flags')}
            className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Flags</div>
                <div className="text-sm text-gray-500">Gerenciar flags para classificar conversas</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

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
        <div className="bg-white rounded-lg p-6">
          {/* Avatar Section */}
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-6">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face" />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-3xl">
                UD
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Usuário Demo</h3>
            <p className="text-gray-600 mb-6">Administrador</p>
            
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Alterar Foto do Perfil
            </Button>
          </div>
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

  const renderFlagSettings = () => (
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
        <h1 className="text-xl font-semibold text-gray-900">Flags de Conversas</h1>
      </div>

      {/* Flag Content */}
      <div className="flex-1 bg-gray-50">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Formulário de criação/edição */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingFlag ? 'Editar Flag' : 'Criar Nova Flag'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flag-name">Nome da Flag</Label>
                    <Input
                      id="flag-name"
                      value={newFlagName}
                      onChange={(e) => setNewFlagName(e.target.value)}
                      placeholder="Ex: Urgente, Agendamento..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flag-color">Cor</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: newFlagColor }}
                      />
                      <select
                        value={newFlagColor}
                        onChange={(e) => setNewFlagColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {colorOptions.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {editingFlag && (
                    <Button variant="outline" onClick={cancelFlagEdit}>
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    onClick={editingFlag ? handleUpdateFlag : handleCreateFlag}
                    disabled={!newFlagName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingFlag ? 'Atualizar Flag' : 'Criar Flag'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de flags existentes */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Flags Existentes</h3>
                <span className="text-sm text-gray-500">{flags.length} flags criadas</span>
              </div>
              
              <div className="space-y-3">
                {flags.map((flag) => (
                  <div 
                    key={flag.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: flag.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {flag.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Criada em {new Date(flag.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${flag.color}20`, 
                            borderColor: flag.color,
                            color: flag.color 
                          }}
                        >
                          {flag.name}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditFlag(flag)}
                          title="Editar flag"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteFlag(flag.id)}
                          title="Deletar flag"
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


  const renderContextSettings = () => (
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
        <h1 className="text-xl font-semibold text-gray-900">Configuração do Bot</h1>
      </div>

      {/* Context Content */}
      <div className="flex-1 bg-gray-50">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Informações Básicas da Clínica */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                Informações da Clínica
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-900">Clínica Lify</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Razão Social:</span>
                  <p className="text-gray-900">Lify Serviços de Saúde Ltda</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">CNPJ:</span>
                  <p className="text-gray-900">00.000.000/0001-00</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Especialidade Principal:</span>
                  <p className="text-gray-900">Medicina de Família e Comunidade</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Especialidades Secundárias:</span>
                  <p className="text-gray-900">Clínica Geral, Telemedicina, Pediatria (triagem)</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Missão:</span>
                  <p className="text-gray-900">Simplificar o acesso à saúde com tecnologia e acolhimento.</p>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-pink-500" />
                Localização
              </h3>
              <div className="text-sm space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">Endereço:</span> Rua 7 de Setembro, 921
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Complemento:</span> Edifício Sten Office - Sala 921
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Bairro:</span> Centro, Blumenau - SC
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">CEP:</span> 89000-000
                </p>
              </div>
            </div>

            {/* Contatos */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-500" />
                Contatos
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Telefone Principal:</span>
                  <p className="text-gray-900">+55 (47) 3030-0000</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">WhatsApp:</span>
                  <p className="text-gray-900">+55 (47) 99999-0000</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">E-mail Principal:</span>
                  <p className="text-gray-900">contato@lify.com.br</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Website:</span>
                  <p className="text-gray-900">https://lify.com.br</p>
                </div>
              </div>
            </div>

            {/* Configuração do Agente IA */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="h-5 w-5 mr-2 text-orange-500" />
                Assistente IA
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p className="text-gray-900">Assistente Lify</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Personalidade:</span>
                  <p className="text-gray-900">Amigável, resolutiva e acolhedora</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tom de Comunicação:</span>
                  <p className="text-gray-900">Profissional e humano</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Saudação Inicial:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border italic">
                    "Olá! Eu sou o Assistente Lify 👋 Posso agendar consultas, explicar serviços e tirar dúvidas rápidas."
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mensagem de Despedida:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border italic">
                    "Foi um prazer ajudar! Se precisar, é só chamar. 💙"
                  </p>
                </div>
              </div>
            </div>

            {/* Horários de Funcionamento */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                Horários de Funcionamento
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Segunda:</span>
                  <span className="text-gray-900">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Terça:</span>
                  <span className="text-gray-900">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Quarta:</span>
                  <span className="text-gray-900">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Quinta:</span>
                  <span className="text-gray-900">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Sexta:</span>
                  <span className="text-gray-900">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Sábado:</span>
                  <span className="text-gray-900">08:00 - 12:00</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="font-medium text-gray-700">Domingo:</span>
                  <span className="text-gray-900">Fechado</span>
                </div>
              </div>
            </div>

            {/* Profissionais */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-cyan-500" />
                Profissionais
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Dra. Ana Souza</h4>
                  <p className="text-sm text-gray-600 mb-2">Médica - Medicina de Família (CRM-SC 12345)</p>
                  <p className="text-xs text-gray-500">8+ anos em atenção primária e manejo de condições crônicas.</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Medicina de Família</Badge>
                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Dr. Marcelo Oliveira</h4>
                  <p className="text-sm text-gray-600 mb-2">Médico - Clínica Geral (CRM-SC 54321)</p>
                  <p className="text-xs text-gray-500">Atendimento ambulatorial e interconsultas.</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Clínica Geral</Badge>
                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-teal-500" />
                Serviços Disponíveis
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Consulta Clínica Geral</h4>
                  <p className="text-sm text-gray-600 mb-2">Avaliação clínica e orientação inicial.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span><strong>Duração:</strong> 30 minutos</span>
                    <span><strong>Preço:</strong> R$ 220,00</span>
                    <span><strong>Convênios:</strong> Unimed, Bradesco Saúde</span>
                    <span><strong>Status:</strong> <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">Ativo</Badge></span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Telemedicina</h4>
                  <p className="text-sm text-gray-600 mb-2">Consulta remota conforme normas vigentes.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span><strong>Duração:</strong> 25 minutos</span>
                    <span><strong>Preço:</strong> R$ 180,00</span>
                    <span><strong>Convênios:</strong> Particular apenas</span>
                    <span><strong>Status:</strong> <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">Ativo</Badge></span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Eletrocardiograma (ECG)</h4>
                  <p className="text-sm text-gray-600 mb-2">Registro da atividade elétrica do coração.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span><strong>Duração:</strong> 15 minutos</span>
                    <span><strong>Preço:</strong> R$ 120,00</span>
                    <span><strong>Convênios:</strong> Unimed</span>
                    <span><strong>Resultado:</strong> 2 dias</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Agente IA */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="h-5 w-5 mr-2 text-orange-500" />
                Comportamento do Agente IA
              </h3>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Proativo:</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Oferece Sugestões:</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Solicita Feedback:</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Escalação Automática:</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Tempo Máximo de Resposta:</span>
                  <p className="text-gray-900">10 segundos</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Limite de Tentativas:</span>
                  <p className="text-gray-900">2 tentativas antes de escalar</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Saudação Inicial:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border italic">
                    "Olá! Eu sou o Assistente Lify 👋 Posso agendar consultas, explicar serviços e tirar dúvidas rápidas."
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Mensagem de Despedida:</span>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border italic">
                    "Foi um prazer ajudar! Se precisar, é só chamar. 💙"
                  </p>
                </div>
              </div>
            </div>

            {/* Políticas e Regras */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                Políticas e Restrições
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Antecedência Mínima para Agendamento:</span>
                  <p className="text-gray-900">1 hora</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Antecedência para Cancelamento:</span>
                  <p className="text-gray-900">6 horas</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Confirmação de Consulta:</span>
                  <p className="text-gray-900">24 horas antes (obrigatória)</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Política de Falta:</span>
                  <p className="text-gray-900">Cobrança de 30% do valor da consulta</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 block mb-2">Tópicos Proibidos:</span>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 mr-2">Emergências médicas</Badge>
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 mr-2">Diagnósticos</Badge>
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 mr-2">Prescrições</Badge>
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Conteúdo adulto</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
                Formas de Pagamento
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Dinheiro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Cartão de Crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Cartão de Débito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>PIX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">Transferência</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">Boleto</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Parcelamento:</span>
                    <p className="text-gray-900">Até 6x sem juros (mín. R$ 50,00)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Desconto à Vista:</span>
                    <p className="text-gray-900">5% de desconto</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Sistema */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2 text-gray-500" />
                Configurações do Sistema
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fuso Horário:</span>
                  <p className="text-gray-900">America/Sao_Paulo</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Idioma:</span>
                  <p className="text-gray-900">Português (Brasil)</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Formato Data:</span>
                  <p className="text-gray-900">DD/MM/YYYY</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Formato Hora:</span>
                  <p className="text-gray-900">HH:mm</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Backup Automático:</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Logs de Atividade:</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-pink-50 text-pink-700">Ativo</Badge>
                </div>
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
      case 'context':
        return renderContextSettings();
      case 'templates':
        return renderTemplateSettings();
      case 'flags':
        return renderFlagSettings();
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
