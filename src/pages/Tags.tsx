import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import {
  Search,
  Plus,
  Pencil,
  Trash,
  GripVertical,
  AlertTriangle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { TagPill } from '@/components/ui/tag-pill';
import { CreateOrEditTagDialog } from '@/components/tags/CreateOrEditTagDialog';
import { Tag, tagService } from '@/services/tagService';

// Configurar dayjs
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// Componente de linha sortable
interface SortableRowProps {
  tag: Tag;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({ tag, isSelected, onSelect, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const createdDate = dayjs(tag.createdAt);
  const relativeDate = createdDate.fromNow();
  const fullDate = createdDate.format('DD/MM/YYYY HH:mm:ss');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[48px_48px_1fr_200px_120px] items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
    >
      {/* Coluna 1 - Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </div>

      {/* Coluna 2 - Handle de arrastar */}
      <div className="flex items-center justify-center">
        <button
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Coluna 3 - Etiqueta (pill) */}
      <div>
        <TagPill name={tag.name} emoji={tag.emoji} color={tag.color} />
      </div>

      {/* Coluna 4 - Data de criação */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-slate-600 text-sm cursor-help">
              {relativeDate}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{fullDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Coluna 5 - Ações */}
      <div className="flex items-center gap-2 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="p-1 hover:bg-slate-100 rounded"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-slate-100 rounded"
                aria-label="Excluir"
              >
                <Trash className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function Tags() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'Vendido',
      emoji: '🐘',
      color: '#D1FAE5',
      createdAt: dayjs().subtract(2, 'days').toISOString(),
      order: 0
    },
    {
      id: '2',
      name: 'Recusado',
      emoji: '🐘',
      color: '#FCE7F3',
      createdAt: dayjs().subtract(2, 'days').toISOString(),
      order: 1
    },
    {
      id: '3',
      name: 'Pendente',
      emoji: '🐘',
      color: '#FEF3C7',
      createdAt: dayjs().subtract(2, 'days').toISOString(),
      order: 2
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados dos modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados para edição/exclusão
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTags, setDeletingTags] = useState<Tag[]>([]);

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar tags
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) {
      return tags;
    }
    
    const search = searchTerm.toLowerCase();
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(search) ||
      (tag.description && tag.description.toLowerCase().includes(search))
    );
  }, [tags, searchTerm]);

  // Handlers de seleção
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTags(filteredTags.map(t => t.id));
    } else {
      setSelectedTags([]);
    }
  }, [filteredTags]);

  const handleSelectTag = useCallback((tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tagId]);
    } else {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  }, []);

  // Handler de reordenação
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTags((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Atualizar ordem no backend (optimistic update)
        const orderedIds = newOrder.map(t => t.id);
        tagService.reorder(orderedIds).catch(() => {
          toast({
            title: "Erro ao reordenar",
            description: "Não foi possível salvar a nova ordem das etiquetas.",
            variant: "destructive",
          });
          // Reverter em caso de erro
          setTags(items);
        });

        toast({
          title: "Ordem atualizada",
          description: "A ordem das etiquetas foi alterada com sucesso.",
        });

        return newOrder;
      });
    }
  }, [toast]);

  // Handlers de ações
  const handleCreateTag = useCallback(async (data: { name: string; description?: string; emoji?: string; color: string }) => {
    try {
      setIsLoading(true);

      // Verificar duplicidade
      const nameExists = tags.some(t => 
        t.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        toast({
          title: "Nome já existe",
          description: "Já existe uma etiqueta com esse nome.",
          variant: "destructive",
        });
        return;
      }

      // Mock: criar tag localmente
      const newTag: Tag = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        emoji: data.emoji,
        color: data.color,
        createdAt: new Date().toISOString(),
        order: tags.length,
      };

      setTags(prev => [newTag, ...prev]);
      setIsCreateModalOpen(false);

      toast({
        title: "Etiqueta criada",
        description: `A etiqueta "${newTag.name}" foi criada com sucesso.`,
      });

      // Em produção, descomentar:
      // const response = await tagService.create(data);
      // setTags(prev => [response.data, ...prev]);
    } catch (error) {
      toast({
        title: "Erro ao criar etiqueta",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tags, toast]);

  const handleEditTag = useCallback(async (data: { name: string; description?: string; emoji?: string; color: string }) => {
    if (!editingTag) return;

    try {
      setIsLoading(true);

      // Verificar duplicidade (exceto o próprio)
      const nameExists = tags.some(t => 
        t.id !== editingTag.id && 
        t.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        toast({
          title: "Nome já existe",
          description: "Já existe uma etiqueta com esse nome.",
          variant: "destructive",
        });
        return;
      }

      // Mock: atualizar localmente
      setTags(prev => prev.map(t => 
        t.id === editingTag.id 
          ? { ...t, ...data }
          : t
      ));

      setIsEditModalOpen(false);
      setEditingTag(null);

      toast({
        title: "Etiqueta atualizada",
        description: `A etiqueta foi atualizada com sucesso.`,
      });

      // Em produção, descomentar:
      // const response = await tagService.update(editingTag.id, data);
      // setTags(prev => prev.map(t => t.id === editingTag.id ? response.data : t));
    } catch (error) {
      toast({
        title: "Erro ao atualizar etiqueta",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [editingTag, tags, toast]);

  const handleDeleteTags = useCallback(async () => {
    if (deletingTags.length === 0) return;

    try {
      setIsLoading(true);

      const idsToDelete = deletingTags.map(t => t.id);

      // Mock: deletar localmente
      setTags(prev => prev.filter(t => !idsToDelete.includes(t.id)));
      setSelectedTags([]);
      setIsDeleteModalOpen(false);
      setDeletingTags([]);

      toast({
        title: "Etiqueta(s) excluída(s)",
        description: `${deletingTags.length} etiqueta(s) foram excluídas com sucesso.`,
      });

      // Em produção, descomentar:
      // if (idsToDelete.length === 1) {
      //   await tagService.remove(idsToDelete[0]);
      // } else {
      //   await tagService.removeBulk(idsToDelete);
      // }
    } catch (error) {
      toast({
        title: "Erro ao excluir etiqueta(s)",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [deletingTags, toast]);

  // Handlers dos modais
  const openEditModal = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((tag: Tag) => {
    setDeletingTags([tag]);
    setIsDeleteModalOpen(true);
  }, []);

  const openBulkDeleteModal = useCallback(() => {
    const tagsToDelete = tags.filter(t => selectedTags.includes(t.id));
    setDeletingTags(tagsToDelete);
    setIsDeleteModalOpen(true);
  }, [tags, selectedTags]);

  const allSelected = selectedTags.length === filteredTags.length && filteredTags.length > 0;
  const someSelected = selectedTags.length > 0 && selectedTags.length < filteredTags.length;

  return (
    <div className="min-h-screen bg-[#F4F6FD]">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button 
              onClick={() => navigate('/settings')}
              className="hover:text-slate-700 transition-colors"
            >
              Configurações
            </button>
            <span>/</span>
            <span>Etiquetas</span>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Etiquetas</h1>
          <p className="text-slate-500">
            Aqui você consegue criar ou gerenciar as configurações das etiquetas da sua organização.
          </p>
        </div>

        {/* Card principal */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 relative">
          {/* Barra superior - Search + Botão */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="h-11 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova etiqueta
            </Button>
          </div>

          {/* Tabela */}
          <div>
            {/* Header da tabela */}
            <div className="grid grid-cols-[48px_48px_1fr_200px_120px] items-center px-4 py-3 text-slate-500 text-sm font-medium border-b border-slate-100">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(ref) => {
                    if (ref) {
                      (ref as any).indeterminate = someSelected;
                    }
                  }}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <GripVertical className="h-4 w-4 text-slate-300" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Arraste para alterar a ordem de exibição</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div>Etiqueta</div>
              <div>Criada</div>
              <div className="text-right">Ações</div>
            </div>

            {/* Corpo da tabela com Drag & Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTags.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTags.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <div className="text-center">
                      <p className="mb-2">Nenhuma etiqueta encontrada</p>
                      {searchTerm ? (
                        <p className="text-sm">Tente ajustar sua busca</p>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar primeira etiqueta
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredTags.map((tag) => (
                    <SortableRow
                      key={tag.id}
                      tag={tag}
                      isSelected={selectedTags.includes(tag.id)}
                      onSelect={(checked) => handleSelectTag(tag.id, checked)}
                      onEdit={() => openEditModal(tag)}
                      onDelete={() => openDeleteModal(tag)}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>

          {/* Barra flutuante de ações em massa */}
          {selectedTags.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {selectedTags.length} {selectedTags.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteModal}
                className="h-9"
              >
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Etiqueta */}
      <CreateOrEditTagDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSubmit={handleCreateTag}
      />

      {/* Modal Editar Etiqueta */}
      <CreateOrEditTagDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        tag={editingTag}
        onSubmit={handleEditTag}
      />

      {/* Modal Excluir Etiqueta(s) */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-red-500" />
              Excluir
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-slate-700">
              Tem certeza que deseja excluir {deletingTags.length === 1 ? 'a etiqueta' : 'as etiquetas'}{' '}
              <span className="font-semibold text-blue-600">
                {deletingTags.map(t => t.name).join(', ')}
              </span>?
            </p>

            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                As etiquetas serão removidas de todas as conversas, não sendo possível reverter essa ação.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingTags([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteTags}
              disabled={isLoading}
              variant="destructive"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
