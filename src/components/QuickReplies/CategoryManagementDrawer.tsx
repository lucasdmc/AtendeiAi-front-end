import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Tag,
  AlertCircle,
  Loader2,
  Save,
  X,
  Palette,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryStatus,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from '@/types/quickReplies';

interface CategoryManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  status: CategoryStatus;
}

const CategoryManagementDrawer: React.FC<CategoryManagementDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '💬',
    color: '#3B82F6',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({});

  // Hooks para dados e mutations
  const { data: categoriesData, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesData?.data || [];

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      icon: '💬',
      color: '#3B82F6',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setEditingCategory(null);
  };

  // Abrir formulário para criar
  const handleCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Abrir formulário para editar
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon || '💬',
      color: category.color || '#3B82F6',
      status: category.status,
    });
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 50) {
      errors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    // Verificar se já existe categoria com mesmo nome (exceto a que está sendo editada)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat._id !== editingCategory?._id
    );
    if (existingCategory) {
      errors.name = 'Já existe uma categoria com este nome';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        const updateData: UpdateCategoryDTO = {
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          status: formData.status,
        };
        await updateCategory.mutateAsync({
          id: editingCategory._id,
          data: updateData,
        });
      } else {
        const createData: CreateCategoryDTO = {
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          status: formData.status,
        };
        await createCategory.mutateAsync(createData);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      // Erro já tratado pelos hooks
    }
  };

  // Excluir categoria
  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategory.mutateAsync({ id: category._id });
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  // Função para obter badge de status
  const getStatusBadge = (status: CategoryStatus) => {
    const variants = {
      ACTIVE: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
      ARCHIVED: { label: 'Arquivada', color: 'bg-gray-100 text-gray-800' },
    };
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isFormLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Categorias
          </SheetTitle>
          <SheetDescription>
            Organize suas respostas rápidas em categorias para facilitar a busca e organização.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header com botão criar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Categorias</h3>
              <p className="text-sm text-gray-600">
                {categories.length} categoria(s) criada(s)
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Lista de categorias */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando categorias...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma categoria criada
              </h3>
              <p className="text-gray-600 mb-4">
                Crie sua primeira categoria para organizar as respostas rápidas.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Categoria
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon || '📁'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(category.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(category.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Modal de formulário */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Edite os dados da categoria.'
                  : 'Crie uma nova categoria para organizar suas respostas rápidas.'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="category-name">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Saudações, Agendamentos, Informações..."
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.name.length}/50 caracteres
                </p>
              </div>

              {/* Ícone e Cor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>{formData.icon}</span>
                          <span className="text-sm text-gray-600">
                            {CATEGORY_ICONS.find(icon => icon.value === formData.icon)?.label}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <span>{icon.value}</span>
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: formData.color }}
                          />
                          <span className="text-sm text-gray-600">
                            {CATEGORY_COLORS.find(color => color.value === formData.color)?.label}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formData.name || 'Nome da categoria'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'slug-da-categoria'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CategoryStatus) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                        <span className="text-sm text-gray-600">Visível para uso</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ARCHIVED">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800">Arquivada</Badge>
                        <span className="text-sm text-gray-600">Oculta para novos usos</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isFormLoading}>
                  {isFormLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingCategory ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryManagementDrawer;


