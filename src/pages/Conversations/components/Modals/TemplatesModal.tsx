import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Save,
  X,
  Send,
  Copy
} from 'lucide-react';
import { useConversationsContext } from '../../context';
import { Template } from '../../types';
import { useUseTemplate } from '../../../../hooks/useTemplates';

export const TemplatesModal: React.FC = () => {
  const { 
    templatesModalOpen, 
    setTemplatesModalOpen, 
    templates,
    templateCategories
  } = useConversationsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'saudacao'
  });

  // Hook para usar template
  const { mutate: useTemplate } = useUseTemplate();

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Contadores por categoria
  const categoryCounts = templateCategories.reduce((acc, category) => {
    acc[category.value] = templates.filter(t => t.category === category.value).length;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setFormData({ name: '', content: '', category: 'saudacao' });
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category
    });
  };

  const handleSaveTemplate = () => {
    if (!formData.name.trim() || !formData.content.trim()) return;

    if (editingTemplate) {
      console.log('Editando template:', { ...editingTemplate, ...formData });
    } else {
      console.log('Criando novo template:', formData);
    }

    // Reset form
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', category: 'saudacao' });
  };

  const handleDeleteTemplate = (template: Template) => {
    if (confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      console.log('Excluindo template:', template);
    }
  };

  const handleUseTemplate = (template: Template) => {
    useTemplate(template._id, {
      onSuccess: () => {
        console.log('Template usado com sucesso');
        // Fechar modal ou mostrar feedback
      },
      onError: (error) => {
        console.error('Erro ao usar template:', error);
      }
    });
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    console.log('Template copiado para área de transferência');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', category: 'saudacao' });
  };

  const getCategoryInfo = (categoryValue: string) => {
    return templateCategories.find(cat => cat.value === categoryValue) || 
           { label: categoryValue, color: '#6B7280' };
  };

  return (
    <Dialog open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates de Mensagens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between gap-4">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Criar novo template */}
            <Button 
              onClick={handleCreateTemplate} 
              className="flex items-center gap-2"
              disabled={isCreating || !!editingTemplate}
            >
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>

          {/* Filtros por categoria */}
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              Todos ({templates.length})
            </Badge>
            
            {templateCategories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'secondary'}
                className="cursor-pointer"
                style={{
                  backgroundColor: selectedCategory === category.value ? category.color : undefined,
                  borderColor: category.color
                }}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label} ({categoryCounts[category.value] || 0})
              </Badge>
            ))}
          </div>

          {/* Formulário de criação/edição */}
          {(isCreating || editingTemplate) && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <Input
                      id="template-name"
                      placeholder="Ex: Saudação inicial, Agendamento..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Categoria</Label>
                    <select
                      id="template-category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {templateCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <Label htmlFor="template-content">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Digite o conteúdo do template..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Ações */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    disabled={!formData.name.trim() || !formData.content.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de templates */}
          <ScrollArea className="h-96">
            {filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template criado ainda'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const categoryInfo = getCategoryInfo(template.category);
                  
                  return (
                    <div
                      key={template._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Header do template */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {template.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: categoryInfo.color,
                              color: categoryInfo.color
                            }}
                          >
                            {categoryInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            disabled={isCreating || !!editingTemplate}
                            className="p-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                            disabled={isCreating || !!editingTemplate}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Conteúdo do template */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {template.content}
                        </p>
                      </div>

                      {/* Estatísticas */}
                      <div className="text-xs text-gray-500 mb-3">
                        Usado {template.usage_count} vezes
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 text-xs"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyTemplate(template)}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <span>
              {filteredTemplates.length} de {templates.length} templates
            </span>
            <span>
              Total de usos: {templates.reduce((acc, t) => acc + t.usage_count, 0)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
