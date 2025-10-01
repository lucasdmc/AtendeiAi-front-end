import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Eye,
  EyeOff,
  AtSign,
  Lightbulb,
  Globe,
  User,
  Tag,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import {
  useCreateQuickReply,
  useUpdateQuickReply,
  useActiveCategories,
} from '@/hooks';
import {
  QuickReply,
  CreateQuickReplyDTO,
  UpdateQuickReplyDTO,
  QuickReplyScope,
  QuickReplyStatus,
  AVAILABLE_PLACEHOLDERS,
} from '@/types/quickReplies';

interface QuickReplyFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quickReply?: QuickReply | null;
  mode: 'create' | 'edit';
}

interface FormData {
  title: string;
  content: string;
  status: QuickReplyStatus;
  scope: QuickReplyScope;
  category_id: string | null;
}

const QuickReplyFormDrawer: React.FC<QuickReplyFormDrawerProps> = ({
  isOpen,
  onClose,
  quickReply,
  mode,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    status: 'ACTIVE',
    scope: 'PERSONAL',
    category_id: null,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Hooks para dados e mutations
  const { data: categoriesData } = useActiveCategories();
  const createQuickReply = useCreateQuickReply();
  const updateQuickReply = useUpdateQuickReply();

  const categories = categoriesData?.data || [];
  const isLoading = createQuickReply.isPending || updateQuickReply.isPending;

  // Resetar formulário quando o drawer abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && quickReply) {
        setFormData({
          title: quickReply.title,
          content: quickReply.content,
          status: quickReply.status,
          scope: quickReply.scope,
          category_id: quickReply.category_id || null,
        });
      } else {
        setFormData({
          title: '',
          content: '',
          status: 'ACTIVE',
          scope: 'PERSONAL',
          category_id: null,
        });
      }
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen, mode, quickReply]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Conteúdo deve ter no máximo 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        const createData: CreateQuickReplyDTO = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          status: formData.status,
          scope: formData.scope,
          category_id: formData.category_id || undefined,
        };
        await createQuickReply.mutateAsync(createData);
      } else if (quickReply) {
        const updateData: UpdateQuickReplyDTO = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          status: formData.status,
          scope: formData.scope,
          category_id: formData.category_id || undefined,
        };
        await updateQuickReply.mutateAsync({
          id: quickReply._id,
          data: updateData,
        });
      }
      onClose();
    } catch (error) {
      // Erro já tratado pelos hooks
    }
  };

  // Inserir placeholder no conteúdo
  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = formData.content.substring(0, start) + placeholder + formData.content.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Restaurar posição do cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Processar conteúdo para preview (substituir placeholders por exemplos)
  const processContentForPreview = (content: string): string => {
    let processedContent = content;
    
    AVAILABLE_PLACEHOLDERS.forEach(placeholder => {
      const regex = new RegExp(placeholder.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, placeholder.example || placeholder.key);
    });
    
    return processedContent;
  };

  // Obter categoria selecionada
  const selectedCategory = categories.find(cat => cat._id === formData.category_id);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {mode === 'create' ? 'Nova Resposta Rápida' : 'Editar Resposta Rápida'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create' 
              ? 'Crie uma nova resposta rápida para agilizar o atendimento.'
              : 'Edite os dados da resposta rápida.'
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Saudação inicial, Agendamento de consulta..."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Status e Escopo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value: QuickReplyStatus) => setFormData(prev => ({ ...prev, status: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ACTIVE" id="status-active" />
                  <Label htmlFor="status-active" className="flex items-center gap-1">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="INACTIVE" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="flex items-center gap-1">
                    <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Escopo</Label>
              <RadioGroup
                value={formData.scope}
                onValueChange={(value: QuickReplyScope) => setFormData(prev => ({ ...prev, scope: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PERSONAL" id="scope-personal" />
                  <Label htmlFor="scope-personal" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Pessoal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GLOBAL" id="scope-global" />
                  <Label htmlFor="scope-global" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Global
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500">
                {formData.scope === 'PERSONAL' 
                  ? 'Visível apenas para você'
                  : 'Visível para todos os usuários da clínica'
                }
              </p>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id || 'none'}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                category_id: value === 'none' ? null : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria">
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      {selectedCategory.icon && (
                        <span className="text-sm">{selectedCategory.icon}</span>
                      )}
                      <span>{selectedCategory.name}</span>
                    </div>
                  ) : (
                    'Sem categoria'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center gap-2">
                      {category.icon && (
                        <span className="text-sm">{category.icon}</span>
                      )}
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content-textarea">
                Conteúdo <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <AtSign className="h-4 w-4 mr-1" />
                      Placeholders
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h4 className="font-medium">Placeholders Disponíveis</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Clique em um placeholder para inserir no conteúdo:
                      </p>
                      <div className="space-y-2">
                        {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                          <button
                            key={placeholder.key}
                            type="button"
                            onClick={() => insertPlaceholder(placeholder.key)}
                            className="w-full text-left p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-mono text-blue-600">
                                {placeholder.key}
                              </code>
                              <span className="text-xs text-gray-500">
                                {placeholder.example}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {placeholder.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showPreview ? (
              <div className="min-h-32 p-3 border rounded-md bg-gray-50">
                <div className="text-sm text-gray-600 mb-2 font-medium">Preview:</div>
                <div className="whitespace-pre-wrap text-sm">
                  {processContentForPreview(formData.content) || 'Digite o conteúdo para ver o preview...'}
                </div>
              </div>
            ) : (
              <Textarea
                id="content-textarea"
                value={formData.content}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, content: e.target.value }));
                  setCursorPosition(e.target.selectionStart);
                }}
                onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                placeholder="Digite o conteúdo da resposta rápida...&#10;&#10;Use placeholders como @nome, @telefone, @data para personalizar a mensagem."
                className={`min-h-32 ${errors.content ? 'border-red-500' : ''}`}
                rows={6}
              />
            )}

            {errors.content && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.content}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formData.content.length}/2000 caracteres
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Resposta' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default QuickReplyFormDrawer;


