import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { X, Search, Plus, User, FileText } from 'lucide-react';
import { useConversationsContext } from '../../context';
import { Template } from '../../types';
import { useUseTemplate } from '../../../../hooks/useTemplates';

interface QuickRepliesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (template: Template) => void;
}

export const QuickRepliesDrawer: React.FC<QuickRepliesDrawerProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const { 
    templates,
    templateCategories
  } = useConversationsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

  // Hook para usar template
  const { mutate: useTemplate } = useUseTemplate();

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Por enquanto, todos os templates são considerados "Todas"
    // Futuramente, pode filtrar por "Minhas" baseado no autor
    return matchesSearch;
  });

  const handleUseTemplate = (template: Template) => {
    console.log('Template selecionado:', template);
    
    if (onSelect) {
      onSelect(template);
    }
    
    // Usar o hook para marcar como usado
    useTemplate(template._id, {
      onSuccess: () => {
        console.log('Template usado com sucesso');
      },
      onError: (error: any) => {
        console.error('Erro ao usar template:', error);
      }
    });
    
    onClose();
  };

  const getCategoryInfo = (categoryValue: string) => {
    return templateCategories.find(cat => cat.value === categoryValue) || 
           { label: categoryValue, color: '#6B7280' };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Respostas rápidas
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar resposta"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Todas
          </button>
          
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'mine'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4" />
            Minhas
          </button>
        </div>

        {/* Add button */}
        <div className="p-6 border-b border-gray-100">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 h-12 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Adicionar nova resposta
          </Button>
        </div>

        {/* Templates List */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-sm">
                  {searchTerm ? 'Nenhuma resposta encontrada' : 'Nenhuma resposta criada ainda'}
                </p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const categoryInfo = getCategoryInfo(template.category);
                
                return (
                  <div
                    key={template._id}
                    className="group border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                    onClick={() => handleUseTemplate(template)}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {template.content}
                        </p>
                        
                        {/* Category Badge */}
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: categoryInfo.color,
                            color: categoryInfo.color,
                            backgroundColor: `${categoryInfo.color}10`
                          }}
                        >
                          {categoryInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};
