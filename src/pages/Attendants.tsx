import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Crown,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from '@/components/ui/use-toast';
import ProfileSidebar from '@/components/ProfileSidebar';

// Tipos
interface Attendant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'attendant';
  status: 'active' | 'inactive';
  department: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AttendantFormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'attendant';
  department: string;
}

export default function Attendants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);


  // Usar clinic_id válido (obtido de clínica existente)
  const clinicId = '68cd84230e29f31cf5f5f1b8';

  const form = useForm<AttendantFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'attendant',
      department: ''
    }
  });

  useEffect(() => {
    loadAttendants();
  }, []);

  const loadAttendants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/attendants?clinic_id=${clinicId}`);
      const data = await response.json();

      if (data.success) {
        // Converter dados da API para o formato esperado pelo frontend
        const formattedAttendants: Attendant[] = data.data.items.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          phone: item.phone || '',
          role: item.role,
          status: item.status,
          department: item.department,
          avatar: item.avatar,
          createdAt: item.created_at,
          lastLogin: item.last_login
        }));
        setAttendants(formattedAttendants);
      } else {
        toast({
          title: "Erro ao carregar atendentes",
          description: data.message || "Não foi possível carregar a lista de atendentes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendant = () => {
    setEditingAttendant(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      role: 'attendant',
      department: ''
    });
    setIsModalOpen(true);
  };

  const handleEditAttendant = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    form.reset({
      name: attendant.name,
      email: attendant.email,
      phone: attendant.phone,
      role: attendant.role,
      department: attendant.department
    });
    setIsModalOpen(true);
  };

  const handleDeleteAttendant = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este atendente?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/attendants/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Atendente excluído",
          description: "O atendente foi removido com sucesso.",
        });
        await loadAttendants(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível excluir o atendente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir atendente:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const attendant = attendants.find(att => att.id === id);
      if (!attendant) {
        toast({
          title: "Erro",
          description: "Atendente não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const newStatus = attendant.status === 'active' ? 'inactive' : 'active';

      const response = await fetch(`http://localhost:3000/api/v1/attendants/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Status atualizado",
          description: `O status do atendente foi alterado para ${newStatus === 'active' ? 'ativo' : 'inativo'}.`,
        });
        await loadAttendants(); // Recarregar a lista
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

  const onSubmit = async (data: AttendantFormData) => {
    try {
      const url = editingAttendant
        ? `http://localhost:3000/api/v1/attendants/${editingAttendant.id}`
        : 'http://localhost:3000/api/v1/attendants';

      const method = editingAttendant ? 'PUT' : 'POST';

      const payload = {
        ...data,
        clinic_id: clinicId
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
        if (editingAttendant) {
          toast({
            title: "Atendente atualizado",
            description: "Os dados foram salvos com sucesso.",
          });
        } else {
          toast({
            title: "Atendente criado",
            description: "O novo atendente foi adicionado com sucesso.",
          });
        }

        setIsModalOpen(false);
        await loadAttendants(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível salvar os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar atendente:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-green-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      default:
        return 'Atendente';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
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

  const filteredAttendants = attendants.filter(attendant =>
    attendant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendant.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Atendentes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Atendentes</h1>
        </div>

        {/* Lista de opções na sidebar */}
        <ScrollArea className="flex-1 border-t-0">
          <div className="px-6 pt-0 pb-4 border-t-0">
            {/* Removendo qualquer linha divisória acima do título */}
            <div className="mb-4 border-t-0 border-b-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Gerenciar</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Gerenciar atendentes
                  </div>
                  <div className="text-xs text-gray-500">
                    Adicionar, editar e gerenciar equipe
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
            Gerenciar Atendentes
          </h1>
          <p className="text-gray-600">
            Configure e monitore sua equipe de atendimento
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              👥 Total de atendentes: {attendants.length}
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Ativos: {attendants.filter(a => a.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <Button onClick={handleCreateAttendant} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendente
          </Button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar atendentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredAttendants.length} de {attendants.length} atendentes
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atendente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          <span className="text-gray-500">Carregando atendentes...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-center">
                          <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">Nenhum atendente encontrado</p>
                          <p className="text-sm text-gray-400">Clique em "Novo Atendente" para adicionar</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendants.map((attendant) => (
                      <TableRow key={attendant.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={attendant.avatar} alt={attendant.name} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {attendant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{attendant.name}</div>
                              <div className="text-sm text-gray-500">{attendant.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{attendant.email}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{attendant.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(attendant.role)}
                            <span className="text-sm font-medium">{getRoleLabel(attendant.role)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{attendant.department}</TableCell>
                        <TableCell>{getStatusBadge(attendant.status)}</TableCell>
                        <TableCell>
                          {attendant.lastLogin ? (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(attendant.lastLogin).toLocaleDateString('pt-BR')}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAttendant(attendant)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(attendant.id)}
                              className={attendant.status === 'active'
                                ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                              }
                            >
                              {attendant.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAttendant(attendant.id)}
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
              {editingAttendant ? 'Editar Atendente' : 'Novo Atendente'}
            </DialogTitle>
            <DialogDescription>
              {editingAttendant
                ? 'Atualize as informações do atendente.'
                : 'Preencha os dados para criar um novo atendente.'
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
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: "Telefone é obrigatório",
                  pattern: {
                    value: /^\+?[\d\s\-\(\)]+$/,
                    message: "Telefone inválido"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 11 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Função é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="attendant">Atendente</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                rules={{ required: "Departamento é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atendimento, Suporte, Administração" {...field} />
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
                  {editingAttendant ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
