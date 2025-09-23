import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  Flag, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useConversationsContext } from '../../context';
import { Flag as FlagType } from '../../types';
import { hexToRgba, formatDate } from '../../utils';

export const FlagsModal: React.FC = () => {
  const { 
    flagsModalOpen, 
    setFlagsModalOpen, 
    flags 
  } = useConversationsContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FlagType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });

  // Cores predefinidas
  const predefinedColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#6B7280'  // Gray
  ];

  // Filtrar flags
  const filteredFlags = flags.filter(flag =>
    flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFlag = () => {
    setIsCreating(true);
    setFormData({ name: '', color: '#3B82F6', description: '' });
  };

  const handleEditFlag = (flag: FlagType) => {
    setEditingFlag(flag);
    setFormData({
      name: flag.name,
      color: flag.color,
      description: flag.description || ''
    });
  };

  const handleSaveFlag = () => {
    if (!formData.name.trim()) return;

    if (editingFlag) {
      console.log('Editando flag:', { ...editingFlag, ...formData });
    } else {
      console.log('Criando nova flag:', formData);
    }

    // Reset form
    setIsCreating(false);
    setEditingFlag(null);
    setFormData({ name: '', color: '#3B82F6', description: '' });
  };

  const handleDeleteFlag = (flag: FlagType) => {
    if (confirm(`Tem certeza que deseja excluir a flag "${flag.name}"?`)) {
      console.log('Excluindo flag:', flag);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingFlag(null);
    setFormData({ name: '', color: '#3B82F6', description: '' });
  };

  return (
    <Dialog open={flagsModalOpen} onOpenChange={setFlagsModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Gerenciar Flags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between gap-4">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Criar nova flag */}
            <Button 
              onClick={handleCreateFlag} 
              className="flex items-center gap-2"
              disabled={isCreating || !!editingFlag}
            >
              <Plus className="h-4 w-4" />
              Nova Flag
            </Button>
          </div>

          {/* Formulário de criação/edição */}
          {(isCreating || editingFlag) && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {editingFlag ? 'Editar Flag' : 'Nova Flag'}
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
                    <Label htmlFor="flag-name">Nome da Flag</Label>
                    <Input
                      id="flag-name"
                      placeholder="Ex: Urgente, VIP, etc."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* Cor */}
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex gap-2 flex-wrap">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color 
                              ? 'border-gray-900 scale-110' 
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="flag-description">Descrição (opcional)</Label>
                  <Input
                    id="flag-description"
                    placeholder="Descreva quando usar esta flag..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Badge
                    style={{
                      backgroundColor: hexToRgba(formData.color, 0.2),
                      color: formData.color,
                      borderColor: hexToRgba(formData.color, 0.4)
                    }}
                    className="border"
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    {formData.name || 'Nome da Flag'}
                  </Badge>
                </div>

                {/* Ações */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveFlag}
                    disabled={!formData.name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingFlag ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de flags */}
          <ScrollArea className="h-96">
            {filteredFlags.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                {searchTerm ? 'Nenhuma flag encontrada' : 'Nenhuma flag criada ainda'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Flag badge */}
                      <Badge
                        style={{
                          backgroundColor: hexToRgba(flag.color, 0.2),
                          color: flag.color,
                          borderColor: hexToRgba(flag.color, 0.4)
                        }}
                        className="border"
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        {flag.name}
                      </Badge>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        {flag.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {flag.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Criada em {formatDate(flag.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditFlag(flag)}
                        disabled={isCreating || !!editingFlag}
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFlag(flag)}
                        disabled={isCreating || !!editingFlag}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
            <span>
              {filteredFlags.length} de {flags.length} flags
            </span>
            <span>
              Total de flags criadas: {flags.length}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
