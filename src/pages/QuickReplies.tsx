import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Star,
  StarOff,
  Tag,
  Globe,
  User,
  Clock,
  TrendingUp,
  Folder,
  FilterX,
  ChevronDown,
  Eye,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  useQuickReplies,
  useActiveCategories,
  useDeleteQuickReply,
  useDuplicateQuickReply,
  useToggleFavorite,
  useBulkMoveToCategory,
} from '@/hooks';
import {
  QuickReply,
  QuickReplyFilters,
  QuickReplyScope,
  QuickReplyStatus,
} from '@/types/quickReplies';
import QuickReplyFormDrawer from '@/components/QuickReplies/QuickReplyFormDrawer';
import QuickReplyViewDrawer from '@/components/QuickReplies/QuickReplyViewDrawer';
import CategoryManagementDrawer from '@/components/QuickReplies/CategoryManagementDrawer';

const QuickReplies: React.FC = () => {
  const { toast } = useToast();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuickReplyStatus | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<QuickReplyScope | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'usage_count' | 'recent' | 'title' | 'created_at'>('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Estados para drawers
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [selectedQuickReply, setSelectedQuickReply] = useState<QuickReply | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Configurações de paginação
  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  // Construir filtros para a query
  const filters: QuickReplyFilters = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    scope: scopeFilter !== 'all' ? scopeFilter : undefined,
    category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
    sort: sortBy,
    limit: itemsPerPage,
    offset,
  }), [searchTerm, statusFilter, scopeFilter, categoryFilter, sortBy, offset]);

  // Hooks para dados
  const { data: quickRepliesData, isLoading, error } = useQuickReplies(filters);
  const { data: categoriesData } = useActiveCategories();
  const deleteQuickReply = useDeleteQuickReply();
  const duplicateQuickReply = useDuplicateQuickReply();
  const { addToFavorites, removeFromFavorites } = useToggleFavorite();
  const bulkMoveToCategory = useBulkMoveToCategory();

  // Dados processados
  const quickReplies = quickRepliesData?.data || [];
  const totalItems = quickRepliesData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const categories = categoriesData?.data || [];

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setScopeFilter('all');
    setCategoryFilter('all');
    setSortBy('created_at');
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(quickReplies.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta resposta rápida?')) {
      await deleteQuickReply.mutateAsync(id);
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateQuickReply.mutateAsync(id);
  };

  const handleToggleFavorite = async (quickReply: QuickReply) => {
    if (quickReply.is_favorite) {
      await removeFromFavorites(quickReply._id);
    } else {
      await addToFavorites(quickReply._id);
    }
  };

  const handleBulkMove = async (categoryId: string | null) => {
    if (selectedItems.length === 0) return;
    
    await bulkMoveToCategory.mutateAsync({
      ids: selectedItems,
      category_id: categoryId,
    });
    setSelectedItems([]);
  };

  // Handlers para drawers
  const handleCreateNew = () => {
    setSelectedQuickReply(null);
    setFormMode('create');
    setIsFormDrawerOpen(true);
  };

  const handleEdit = (quickReply: QuickReply) => {
    setSelectedQuickReply(quickReply);
    setFormMode('edit');
    setIsFormDrawerOpen(true);
  };

  const handleView = (quickReply: QuickReply) => {
    setSelectedQuickReply(quickReply);
    setIsViewDrawerOpen(true);
  };

  const handleEditFromView = () => {
    setIsViewDrawerOpen(false);
    setFormMode('edit');
    setIsFormDrawerOpen(true);
  };

  const handleCloseDrawers = () => {
    setIsFormDrawerOpen(false);
    setIsViewDrawerOpen(false);
    setSelectedQuickReply(null);
  };

  // Função para obter badge de status
  const getStatusBadge = (status: QuickReplyStatus) => {
    const variants = {
      ACTIVE: { variant: 'default' as const, label: 'Ativo', color: 'bg-green-100 text-green-800' },
      INACTIVE: { variant: 'secondary' as const, label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
    };
    const config = variants[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Função para obter badge de escopo
  const getScopeBadge = (scope: QuickReplyScope) => {
    const variants = {
      GLOBAL: { icon: Globe, label: 'Global', color: 'bg-blue-100 text-blue-800' },
      PERSONAL: { icon: User, label: 'Pessoal', color: 'bg-purple-100 text-purple-800' },
    };
    const config = variants[scope];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Função para truncar texto
  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Estatísticas
  const stats = useMemo(() => {
    const total = quickReplies.length;
    const active = quickReplies.filter(q => q.status === 'ACTIVE').length;
    const global = quickReplies.filter(q => q.scope === 'GLOBAL').length;
    const favorites = quickReplies.filter(q => q.is_favorite).length;
    
    return { total, active, global, favorites };
  }, [quickReplies]);

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Erro ao carregar respostas rápidas</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Respostas Rápidas
              </h1>
              <p className="text-gray-600">
                Gerencie templates e respostas automáticas para agilizar o atendimento
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsCategoryDrawerOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Categorias
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Resposta
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Tag className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Globais</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.global}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favoritas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.favorites}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por título ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value: QuickReplyStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={scopeFilter} onValueChange={(value: QuickReplyScope | 'all') => setScopeFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Escopo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                    <SelectItem value="PERSONAL">Pessoal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Mais recente</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="usage_count">Mais usado</SelectItem>
                    <SelectItem value="recent">Usado recente</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botão limpar filtros */}
                {(searchTerm || statusFilter !== 'all' || scopeFilter !== 'all' || categoryFilter !== 'all') && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    <FilterX className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Ações em lote */}
            {selectedItems.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedItems.length} item(ns) selecionado(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Folder className="h-4 w-4 mr-2" />
                          Mover para categoria
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                          Sem categoria
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category._id}
                            onClick={() => handleBulkMove(category._id)}
                          >
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando respostas rápidas...</p>
                </div>
              </div>
            ) : quickReplies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Tag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma resposta rápida encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || scopeFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Tente ajustar os filtros ou criar uma nova resposta rápida.'
                    : 'Comece criando sua primeira resposta rápida para agilizar o atendimento.'
                  }
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Resposta Rápida
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === quickReplies.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escopo</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quickReplies.map((quickReply) => (
                    <TableRow key={quickReply._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(quickReply._id)}
                          onCheckedChange={(checked) => handleSelectItem(quickReply._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite(quickReply)}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {quickReply.is_favorite ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <span className="font-medium text-gray-900">
                            {quickReply.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 text-sm">
                          {truncateText(quickReply.content)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {quickReply.category ? (
                          <div className="flex items-center gap-1">
                            {quickReply.category.icon && (
                              <span className="text-sm">{quickReply.category.icon}</span>
                            )}
                            <span className="text-sm text-gray-600">
                              {quickReply.category.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(quickReply.status)}
                      </TableCell>
                      <TableCell>
                        {getScopeBadge(quickReply.scope)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {quickReply.usage_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(quickReply.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(quickReply)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(quickReply)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(quickReply._id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(quickReply._id)}
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
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {offset + 1} a {Math.min(offset + itemsPerPage, totalItems)} de {totalItems} resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        {/* Drawers */}
        <QuickReplyFormDrawer
          isOpen={isFormDrawerOpen}
          onClose={handleCloseDrawers}
          quickReply={selectedQuickReply}
          mode={formMode}
        />

        <QuickReplyViewDrawer
          isOpen={isViewDrawerOpen}
          onClose={handleCloseDrawers}
          quickReply={selectedQuickReply}
          onEdit={handleEditFromView}
        />

        <CategoryManagementDrawer
          isOpen={isCategoryDrawerOpen}
          onClose={() => setIsCategoryDrawerOpen(false)}
        />
      </div>
    </div>
  );
};

export default QuickReplies;

