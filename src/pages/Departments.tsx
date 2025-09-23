import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from '@/components/ui/use-toast';
import ProfileSidebar from '@/components/ProfileSidebar';

// Tipos
interface Department {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  clinic_id: string;
  order: number;
  created_at: string;
}

interface DepartmentFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export default function Departments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Usar clinic_id válido (obtido de clínica existente)
  const clinicId = '68cd84230e29f31cf5f5f1b8';

  const form = useForm<DepartmentFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'Building2',
      order: 0
    }
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/departments?clinic_id=${clinicId}`);
      const data = await response.json();

      if (data.success) {
        // Converter dados da API para o formato esperado pelo frontend
        const formattedDepartments: Department[] = data.data.items.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          color: item.color,
          icon: item.icon,
          is_active: item.is_active,
          clinic_id: item.clinic_id,
          order: item.order,
          created_at: item.created_at
        }));
        setDepartments(formattedDepartments);
      } else {
        toast({
          title: "Erro ao carregar departamentos",
          description: data.message || "Não foi possível carregar a lista de departamentos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    form.reset({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'Building2',
      order: departments.length
    });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || '',
      color: department.color || '#3B82F6',
      icon: department.icon || 'Building2',
      order: department.order
    });
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/departments/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Departamento excluído",
          description: "O departamento foi removido com sucesso.",
        });
        await loadDepartments(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível excluir o departamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/departments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: `O status do departamento foi alterado para ${!currentStatus ? 'ativo' : 'inativo'}.`,
        });
        await loadDepartments(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível alterar o status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      const url = editingDepartment
        ? `http://localhost:3000/api/v1/departments/${editingDepartment.id}`
        : 'http://localhost:3000/api/v1/departments';

      const method = editingDepartment ? 'PUT' : 'POST';

      const payload = {
        ...data,
        clinic_id: clinicId,
        is_active: true
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        if (editingDepartment) {
          toast({
            title: "Departamento atualizado",
            description: "Os dados foram salvos com sucesso.",
          });
        } else {
          toast({
            title: "Departamento criado",
            description: "O novo departamento foi adicionado com sucesso.",
          });
        }

        setIsModalOpen(false);
        await loadDepartments(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível salvar os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDepartmentIcon = () => {
    // Por enquanto, retorna sempre Building2. Futuramente pode ser expandido para múltiplos ícones
    return <Building2 className="h-4 w-4" />;
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Departamentos */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Departamentos</h1>
        </div>

        {/* Lista de opções na sidebar */}
        <ScrollArea className="flex-1 border-t-0">
          <div className="px-6 pt-0 pb-4 border-t-0">
            {/* Removendo qualquer linha divisória acima do título */}
            <div className="mb-4 border-t-0 border-b-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Gerenciar</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-200 transition-colors">
                <Building2 className="h-6 w-6 text-orange-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Gerenciar departamentos
                  </div>
                  <div className="text-xs text-gray-500">
                    Criar e organizar setores
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Perfil do usuário */}
        <ProfileSidebar />
      </div>

      {/* Área principal */}
      <div className="flex-1 p-8 bg-gray-50">
        {/* Header da área principal */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gerenciar Departamentos
          </h1>
          <p className="text-gray-600">
            Organize sua equipe em setores e especialidades
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              📊 Total de departamentos: {departments.length}
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Ativos: {departments.filter(d => d.is_active).length}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <Button onClick={handleCreateDepartment} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Departamento
          </Button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredDepartments.length} de {departments.length} departamentos
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          <span className="text-gray-500">Carregando departamentos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-center">
                          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">Nenhum departamento encontrado</p>
                          <p className="text-sm text-gray-400">Clique em "Novo Departamento" para adicionar</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: department.color || '#3B82F6' }}
                            >
                              {getDepartmentIcon()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{department.name}</div>
                              <div className="text-sm text-gray-500">ID: {department.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {department.description || 'Sem descrição'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: department.color || '#3B82F6' }}
                            />
                            <span className="text-sm font-mono">
                              {department.color || '#3B82F6'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{department.order}</TableCell>
                        <TableCell>{getStatusBadge(department.is_active)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDepartment(department)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(department.id, department.is_active)}
                              className={department.is_active
                                ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                              }
                            >
                              {department.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? 'Atualize as informações do departamento.'
                : 'Preencha os dados para criar um novo departamento.'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nome é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atendimento, Suporte, Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do departamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        className="h-10 w-full cursor-pointer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDepartment ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
