import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload
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
interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  tags: string[];
  source: 'manual' | 'import' | 'conversation' | 'api';
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  custom_fields?: Record<string, any>;
  institution_id: string;
  last_contact?: string;
  created_at: string;
}

interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  tags: string[];
  source: 'manual' | 'import' | 'conversation' | 'api';
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function Contacts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedInstitution } = useInstitution();
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Usar institution_id da instituição selecionada
  const institutionId = selectedInstitution?._id || '';

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      tags: [],
      source: 'manual',
      status: 'active',
      notes: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      }
    }
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/contacts?institution_id=${institutionId}`);
      const data = await response.json();

      if (data.success) {
        // Converter dados da API para o formato esperado pelo frontend
        const formattedContacts: Contact[] = data.data.items.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          whatsapp: item.whatsapp,
          avatar: item.avatar,
          tags: item.tags || [],
          source: item.source,
          status: item.status,
          notes: item.notes,
          address: item.address,
          custom_fields: item.custom_fields,
          institution_id: item.institution_id,
          last_contact: item.last_contact,
          created_at: item.created_at
        }));
        setContacts(formattedContacts);
      } else {
        toast({
          title: "Erro ao carregar contatos",
          description: data.message || "Não foi possível carregar a lista de contatos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setSelectedTags([]);
    form.reset({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      tags: [],
      source: 'manual',
      status: 'active',
      notes: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setSelectedTags(contact.tags || []);
    form.reset({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      whatsapp: contact.whatsapp || '',
      tags: contact.tags || [],
      source: contact.source,
      status: contact.status,
      notes: contact.notes || '',
      address: contact.address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/contacts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contato excluído",
          description: "O contato foi removido com sucesso.",
        });
        await loadContacts(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível excluir o contato.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
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
        newStatus = 'blocked';
      } else {
        newStatus = 'active';
      }

      const response = await fetch(`http://localhost:3000/api/v1/contacts/${id}/status`, {
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
          description: `O status do contato foi alterado para ${newStatus}.`,
        });
        await loadContacts(); // Recarregar a lista
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

  const onSubmit = async (data: ContactFormData) => {
    try {
      const url = editingContact
        ? `http://localhost:3000/api/v1/contacts/${editingContact.id}`
        : 'http://localhost:3000/api/v1/contacts';

      const method = editingContact ? 'PUT' : 'POST';

      const payload = {
        ...data,
        tags: selectedTags,
        institution_id: institutionId
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
        if (editingContact) {
          toast({
            title: "Contato atualizado",
            description: "Os dados foram salvos com sucesso.",
          });
        } else {
          toast({
            title: "Contato criado",
            description: "O novo contato foi adicionado com sucesso.",
          });
        }

        setIsModalOpen(false);
        await loadContacts(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível salvar os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
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
      case 'blocked':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Bloqueado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels = {
      manual: 'Manual',
      import: 'Importado',
      conversation: 'Conversa',
      api: 'API'
    };

    return (
      <Badge variant="outline" className="text-xs">
        {sourceLabels[source as keyof typeof sourceLabels] || source}
      </Badge>
    );
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.whatsapp && contact.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      setSelectedTags([...selectedTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const formatAddress = (address?: Contact['address']) => {
    if (!address) return '';
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}`;
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Contatos */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Contatos</h1>
        </div>

        {/* Lista de opções na sidebar */}
        <ScrollArea className="flex-1 border-t-0">
          <div className="px-6 pt-0 pb-4 border-t-0">
            {/* Removendo qualquer linha divisória acima do título */}
            <div className="mb-4 border-t-0 border-b-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Gerenciar</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-teal-50 border border-teal-200 transition-colors">
                <User className="h-6 w-6 text-teal-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Gerenciar contatos
                  </div>
                  <div className="text-xs text-gray-500">
                    Importar, editar e organizar contatos
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
            Gerenciar Contatos
          </h1>
          <p className="text-gray-600">
            Organize e gerencie sua base de contatos
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              👥 Total de contatos: {contacts.length}
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Ativos: {contacts.filter(c => c.status === 'active').length}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <Button onClick={handleCreateContact} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
          <Button variant="outline" disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredContacts.length} de {contacts.length} contatos
          </div>
        </div>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contato</TableHead>
                    <TableHead>Informações</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Origem</TableHead>
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
                          <span className="text-gray-500">Carregando contatos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-center">
                          <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">Nenhum contato encontrado</p>
                          <p className="text-sm text-gray-400">Clique em "Novo Contato" para adicionar</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-500">ID: {contact.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{contact.phone}</span>
                              </div>
                            )}
                            {contact.whatsapp && (
                              <div className="flex items-center space-x-1 text-sm">
                                <MessageCircle className="h-3 w-3 text-green-500" />
                                <span className="text-gray-600">{contact.whatsapp}</span>
                              </div>
                            )}
                            {formatAddress(contact.address) && (
                              <div className="flex items-center space-x-1 text-sm">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600 truncate max-w-xs">
                                  {formatAddress(contact.address)}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags && contact.tags.length > 0 ? (
                              contact.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">Sem tags</span>
                            )}
                            {contact.tags && contact.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getSourceBadge(contact.source)}</TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(contact.id, contact.status)}
                              className={
                                contact.status === 'active'
                                  ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                  : contact.status === 'inactive'
                                  ? "border-red-300 text-red-600 hover:bg-red-50"
                                  : "border-green-300 text-green-600 hover:bg-green-50"
                              }
                            >
                              {contact.status === 'active' ? <XCircle className="h-4 w-4" /> :
                               contact.status === 'inactive' ? <AlertTriangle className="h-4 w-4" /> :
                               <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
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
              {editingContact ? 'Editar Contato' : 'Novo Contato'}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? 'Atualize as informações do contato.'
                : 'Preencha os dados para adicionar um novo contato.'
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
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+5511999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="import">Importado</SelectItem>
                          <SelectItem value="conversation">Conversa</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="blocked">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma tag e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addTag(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Digite uma tag e pressione Enter"]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        addTag(input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Observações sobre o contato" {...field} />
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
                  {editingContact ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
