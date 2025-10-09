import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  Search,
  Plus,
  Pencil,
  Trash,
  GripVertical,
  Save,
  AlertTriangle,
  Loader2
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { 
  useDepartments, 
  useCreateDepartment, 
  useUpdateDepartment, 
  useDeleteDepartment, 
  useReorderDepartments 
} from '@/hooks/useDepartments';
import { Department } from '@/services/departmentService';

// Tipos
interface Sector extends Department {
  isDefault?: boolean; // Campo adicional para identificar setor padrão
}

// Componente de linha sortable
interface SortableRowProps {
  sector: Sector;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onMakeDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({ sector, isSelected, onSelect, onMakeDefault, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sector.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[48px_48px_1fr_240px] items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
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

      {/* Coluna 3 - Nome */}
      <div className="text-slate-900 font-medium">
        {sector.name}
      </div>

      {/* Coluna 4 - Ações */}
      <div className="flex items-center gap-4 justify-end">
        {sector.isDefault ? (
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1">
            Setor padrão
          </Badge>
        ) : (
          <button
            onClick={onMakeDefault}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Tornar padrão
          </button>
        )}

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
                disabled={sector.isDefault}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Excluir"
              >
                <Trash className="h-4 w-4 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {sector.isDefault ? (
                <div className="max-w-xs">
                  <p className="font-medium">Excluir</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Organizações precisam ter um setor padrão que não pode ser excluído. 
                    Defina outro setor para ser o novo setor padrão antes de excluir esse.
                  </p>
                </div>
              ) : (
                <p>Excluir</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function Departments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  
  // Estados principais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  
  // Estados dos modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Estados dos formulários
  const [newSectorName, setNewSectorName] = useState('');
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editSectorName, setEditSectorName] = useState('');
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [moveChatsToSector, setMoveChatsToSector] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Hooks da API
  const institutionId = selectedInstitution?._id || '';
  
  const { 
    data: departmentsData, 
    isLoading: departmentsLoading, 
    error: departmentsError 
  } = useDepartments({ 
    institution_id: institutionId,
    is_active: true 
  }, { 
    enabled: !!institutionId 
  });

  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  const reorderDepartmentsMutation = useReorderDepartments();

  // Converter dados da API para o formato esperado
  const sectors: Sector[] = departmentsData?.items?.map(dept => ({
    ...dept,
    id: dept._id,
    isDefault: dept.order === 0 // Considera o primeiro setor como padrão
  })) || [];

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar setores
  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers de seleção
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedSectors(sectors.map(s => s.id));
    } else {
      setSelectedSectors([]);
    }
  }, [sectors]);

  const handleSelectSector = useCallback((sectorId: string, checked: boolean) => {
    if (checked) {
      setSelectedSectors(prev => [...prev, sectorId]);
    } else {
      setSelectedSectors(prev => prev.filter(id => id !== sectorId));
    }
  }, []);

  // Handler de reordenação
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && institutionId) {
      const oldIndex = sectors.findIndex(item => item.id === active.id);
      const newIndex = sectors.findIndex(item => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...sectors];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);

        // Atualizar ordem no backend
        const departmentIds = newOrder.map(sector => sector.id);
        reorderDepartmentsMutation.mutate({ departmentIds, institution_id: institutionId });
      }
    }
  }, [sectors, institutionId, reorderDepartmentsMutation]);

  // Handlers de ações
  const handleCreateSector = useCallback(() => {
    if (!newSectorName.trim() || !institutionId) return;

    const nameExists = sectors.some(s => 
      s.name.toLowerCase() === newSectorName.trim().toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Nome já existe",
        description: "Já existe um setor com este nome.",
        variant: "destructive",
      });
      return;
    }

    createDepartmentMutation.mutate({
      name: newSectorName.trim(),
      institution_id: institutionId,
      order: sectors.length
    }, {
      onSuccess: () => {
        setNewSectorName('');
        setIsNewModalOpen(false);
      }
    });
  }, [newSectorName, sectors, institutionId, createDepartmentMutation, toast]);

  const handleEditSector = useCallback(() => {
    if (!editingSector || !editSectorName.trim()) return;

    const nameExists = sectors.some(s => 
      s.id !== editingSector.id && 
      s.name.toLowerCase() === editSectorName.trim().toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Nome já existe",
        description: "Já existe um setor com este nome.",
        variant: "destructive",
      });
      return;
    }

    updateDepartmentMutation.mutate({
      id: editingSector.id,
      data: { name: editSectorName.trim() }
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setEditingSector(null);
        setEditSectorName('');
      }
    });
  }, [editingSector, editSectorName, sectors, updateDepartmentMutation, toast]);

  const handleDeleteSector = useCallback(() => {
    if (!deletingSector || deleteConfirmText !== deletingSector.name) return;

    deleteDepartmentMutation.mutate(deletingSector.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setDeletingSector(null);
        setDeleteConfirmText('');
        setMoveChatsToSector('');
      }
    });
  }, [deletingSector, deleteConfirmText, deleteDepartmentMutation]);

  const handleMakeDefault = useCallback((sectorId: string) => {
    // Encontrar o setor atual
    const currentSector = sectors.find(s => s.id === sectorId);
    if (!currentSector) return;

    // Atualizar ordem: o setor padrão deve ter order = 0
    const updatedSectors = sectors.map(s => ({
      ...s,
      order: s.id === sectorId ? 0 : (s.order === 0 ? 1 : s.order)
    }));

    // Reordenar no backend
    const departmentIds = updatedSectors
      .sort((a, b) => a.order - b.order)
      .map(s => s.id);

    reorderDepartmentsMutation.mutate({ 
      departmentIds, 
      institution_id: institutionId 
    });
  }, [sectors, institutionId, reorderDepartmentsMutation]);

  // Handlers dos modais
  const openEditModal = useCallback((sector: Sector) => {
    setEditingSector(sector);
    setEditSectorName(sector.name);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((sector: Sector) => {
    setDeletingSector(sector);
    setDeleteConfirmText('');
    // Definir o primeiro setor disponível como padrão para mover os chats
    const defaultSector = sectors.find(s => s.id !== sector.id);
    setMoveChatsToSector(defaultSector?.id || '');
    setIsDeleteModalOpen(true);
  }, [sectors]);

  // Definir setor padrão quando abrir modal de exclusão
  useEffect(() => {
    if (isDeleteModalOpen && deletingSector && !moveChatsToSector) {
      const defaultSector = sectors.find(s => s.id !== deletingSector.id);
      setMoveChatsToSector(defaultSector?.id || '');
    }
  }, [isDeleteModalOpen, deletingSector, sectors, moveChatsToSector]);

  const allSelected = selectedSectors.length === sectors.length && sectors.length > 0;
  const someSelected = selectedSectors.length > 0 && selectedSectors.length < sectors.length;

  // Estados de loading
  const isLoading = departmentsLoading;
  const isCreating = createDepartmentMutation.isPending;
  const isUpdating = updateDepartmentMutation.isPending;
  const isDeleting = deleteDepartmentMutation.isPending;

  // Verificar se não há instituição selecionada
  if (!selectedInstitution) {
    return (
      <div className="min-h-screen bg-[#F4F6FD] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma instituição selecionada</h2>
          <p className="text-slate-500">Selecione uma instituição para gerenciar os departamentos.</p>
        </div>
      </div>
    );
  }

  // Verificar se há erro
  if (departmentsError) {
    return (
      <div className="min-h-screen bg-[#F4F6FD] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Erro ao carregar departamentos</h2>
          <p className="text-slate-500">Ocorreu um erro ao carregar os departamentos. Tente novamente.</p>
        </div>
      </div>
    );
  }

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
            <span>Setores</span>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">Setores</h1>
          <p className="text-slate-500">
            Aqui você consegue criar ou gerenciar as configurações das sub-divisões da sua organização.
          </p>
        </div>

        {/* Card principal */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100">
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
              onClick={() => setIsNewModalOpen(true)}
              className="h-11 rounded-lg"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo setor
            </Button>
          </div>

          {/* Tabela */}
          <div>
            {/* Header da tabela */}
            <div className="grid grid-cols-[48px_48px_1fr_240px] items-center px-4 py-3 text-slate-500 text-sm font-medium border-b border-slate-100">
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
              <div className="flex items-center justify-center">
                <GripVertical className="h-4 w-4 text-slate-300" />
              </div>
              <div>Nome</div>
              <div className="text-right">Ações</div>
            </div>

            {/* Corpo da tabela com Drag & Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredSectors.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-500">Carregando departamentos...</span>
                  </div>
                ) : filteredSectors.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <div className="text-center">
                      <p className="mb-2">Nenhum setor encontrado</p>
                      {searchTerm && (
                        <p className="text-sm">Tente ajustar sua busca</p>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredSectors.map((sector) => (
                    <SortableRow
                      key={sector.id}
                      sector={sector}
                      isSelected={selectedSectors.includes(sector.id)}
                      onSelect={(checked) => handleSelectSector(sector.id, checked)}
                      onMakeDefault={() => handleMakeDefault(sector.id)}
                      onEdit={() => openEditModal(sector)}
                      onDelete={() => openDeleteModal(sector)}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Modal Novo Setor */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo setor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-sector-name" className="text-sm font-medium text-slate-700">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-sector-name"
                type="text"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                placeholder="Digite o nome do setor"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={handleCreateSector}
              disabled={!newSectorName.trim() || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isCreating ? 'Criando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Setor */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setor {editingSector?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-sector-name" className="text-sm font-medium text-slate-700">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-sector-name"
                type="text"
                value={editSectorName}
                onChange={(e) => setEditSectorName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={handleEditSector}
              disabled={!editSectorName.trim() || isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Setor */}
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
              Tem certeza que deseja excluir o setor{' '}
              <span className="font-semibold text-blue-600">{deletingSector?.name}</span>?
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  Canais que possuem esse setor como padrão passarão a usar o setor padrão da organização
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="mb-2">Os chats que estão atualmente nesse setor serão movidos para:</p>
                  <Select value={moveChatsToSector} onValueChange={setMoveChatsToSector}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors
                        .filter(s => s.id !== deletingSector?.id)
                        .map(sector => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <p className="text-sm text-red-600 font-medium">
              Essa ação não pode ser desfeita posteriormente.
            </p>

            <div>
              <Label htmlFor="delete-confirm" className="text-sm font-medium text-slate-700">
                Digite <span className="font-semibold">{deletingSector?.name}</span> para continuar
              </Label>
              <Input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteSector}
              disabled={deleteConfirmText !== deletingSector?.name || isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isDeleting ? 'Excluindo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}