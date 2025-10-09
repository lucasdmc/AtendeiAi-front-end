import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
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
interface ServiceProvider {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  type: 'Clínica' | 'Consultório' | 'Laboratório' | 'Hospital' | 'Profissional';
  description?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  website?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  contract_start?: string;
  contract_end?: string;
  institution_id: string;
  created_at: string;
}

interface ServiceProviderFormData {
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  type: 'Clínica' | 'Consultório' | 'Laboratório' | 'Hospital' | 'Profissional';
  description?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  website?: string;
  contract_start?: string;
  contract_end?: string;
}

export default function ServiceProviders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);

  // Usar institution_id da instituição selecionada
  const institutionId = selectedInstitution?._id || '';

  const form = useForm<ServiceProviderFormData>({
    defaultValues: {
      name: '',
      company_name: '',
      email: '',
      phone: '',
      type: 'Clínica',
      description: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      website: '',
      contract_start: '',
      contract_end: ''
    }
  });

  useEffect(() => {
    loadServiceProviders();
  }, []);

  const loadServiceProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/service-providers?institution_id=${institutionId}`);
      const data = await response.json();

      if (data.success) {
        // Converter dados da API para o formato esperado pelo frontend
        const formattedProviders: ServiceProvider[] = data.data.items.map((item: any) => ({
          id: item._id,
          name: item.name,
          company_name: item.company_name,
          email: item.email,
          phone: item.phone,
          type: item.type,
          description: item.description,
          address: item.address,
          website: item.website,
          logo: item.logo,
          status: item.status,
          contract_start: item.contract_start,
          contract_end: item.contract_end,
          institution_id: item.institution_id,
          created_at: item.created_at
        }));
        setServiceProviders(formattedProviders);
      } else {
        toast({
          title: "Erro ao carregar prestadores",
          description: data.message || "Não foi possível carregar a lista de prestadores.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = () => {
    setEditingProvider(null);
    form.reset({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      type: 'Clínica',
      description: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      website: '',
      contract_start: '',
      contract_end: ''
    });
    setIsModalOpen(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    form.reset({
      name: provider.name,
      company_name: provider.company_name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      type: provider.type,
      description: provider.description || '',
      address: provider.address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      website: provider.website || '',
      contract_start: provider.contract_start || '',
      contract_end: provider.contract_end || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prestador de serviço?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/service-providers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Prestador excluído",
          description: "O prestador de serviço foi removido com sucesso.",
        });
        await loadServiceProviders(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível excluir o prestador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir prestador:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      let newStatus: string;
      if (currentStatus === 'active') {
        newStatus = 'inactive';
      } else if (currentStatus === 'inactive') {
        newStatus = 'suspended';
      } else {
        newStatus = 'active';
      }

      const response = await fetch(`http://localhost:3000/api/v1/service-providers/${id}/status`, {
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
          description: `O status do prestador foi alterado para ${newStatus}.`,
        });
        await loadServiceProviders(); // Recarregar a lista
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

  const onSubmit = async (data: ServiceProviderFormData) => {
    try {
      const url = editingProvider
        ? `http://localhost:3000/api/v1/service-providers/${editingProvider.id}`
        : 'http://localhost:3000/api/v1/service-providers';

      const method = editingProvider ? 'PUT' : 'POST';

      const payload = {
        ...data,
        institution_id: institutionId,
        status: 'active'
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
        if (editingProvider) {
          toast({
            title: "Prestador atualizado",
            description: "Os dados foram salvos com sucesso.",
          });
        } else {
          toast({
            title: "Prestador criado",
            description: "O novo prestador foi adicionado com sucesso.",
          });
        }

        setIsModalOpen(false);
        await loadServiceProviders(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível salvar os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspenso
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProviders = serviceProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (provider.company_name && provider.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    provider.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (provider.email && provider.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Prestadores */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Prestadores</h1>
        </div>

        {/* Lista de opções na sidebar */}
        <ScrollArea className="flex-1 border-t-0">
          <div className="px-6 pt-0 pb-4 border-t-0">
            {/* Removendo qualquer linha divisória acima do título */}
            <div className="mb-4 border-t-0 border-b-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Gerenciar</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200 transition-colors">
                <Shield className="h-6 w-6 text-purple-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Prestadores de serviço
                  </div>
                  <div className="text-xs text-gray-500">
                    Parceiros e fornecedores externos
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
            Prestadores de Serviço
          </h1>
          <p className="text-gray-600">
            Gerencie seus parceiros e fornecedores externos
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              🤝 Total de prestadores: {serviceProviders.length}
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Ativos: {serviceProviders.filter(p => p.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <Button onClick={handleCreateProvider} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prestador
          </Button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar prestadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredProviders.length} de {serviceProviders.length} prestadores
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          <span className="text-gray-500">Carregando prestadores...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-center">
                          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">Nenhum prestador encontrado</p>
                          <p className="text-sm text-gray-400">Clique em "Novo Prestador" para adicionar</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={provider.logo} alt={provider.name} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {provider.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{provider.name}</div>
                              {provider.company_name && (
                                <div className="text-sm text-gray-500">{provider.company_name}</div>
                              )}
                              <div className="text-sm text-gray-500">ID: {provider.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm font-medium">{provider.type}</div>
                            {provider.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {provider.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {provider.email && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{provider.email}</span>
                              </div>
                            )}
                            {provider.phone && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{provider.phone}</span>
                              </div>
                            )}
                            {provider.website && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Globe className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{provider.website}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(provider.status)}</TableCell>
                        <TableCell>
                          {provider.contract_end ? (
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{new Date(provider.contract_end).toLocaleDateString('pt-BR')}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sem contrato</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProvider(provider)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(provider.id, provider.status)}
                              className={
                                provider.status === 'active'
                                  ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                  : provider.status === 'inactive'
                                  ? "border-red-300 text-red-600 hover:bg-red-50"
                                  : "border-green-300 text-green-600 hover:bg-green-50"
                              }
                            >
                              {provider.status === 'active' ? <XCircle className="h-4 w-4" /> :
                               provider.status === 'inactive' ? <AlertTriangle className="h-4 w-4" /> :
                               <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProvider(provider.id)}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? 'Editar Prestador' : 'Novo Prestador'}
            </DialogTitle>
            <DialogDescription>
              {editingProvider
                ? 'Atualize as informações do prestador de serviço.'
                : 'Preencha os dados para adicionar um novo prestador.'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Nome é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Prestador</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da pessoa ou empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (opcional)</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+55 11 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Tipo é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clínica">Clínica</SelectItem>
                        <SelectItem value="Consultório">Consultório</SelectItem>
                        <SelectItem value="Laboratório">Laboratório</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Profissional">Profissional</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="Descrição dos serviços prestados" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos de endereço */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Endereço (opcional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="address.neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProvider ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
