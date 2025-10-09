import { useState } from "react"
import { Link } from "react-router-dom"
import { Users as UsersIcon, Plus, Edit, Trash2, Search, Filter, Building2, Shield, Mail, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUsers } from "@/hooks/useApi"
import { useInstitution as useInstitutionContext } from "@/contexts/InstitutionContext"
import { useToast } from "../components/ui/use-toast"
import { userApi } from "@/services/api"

interface User {
  id: string
  name: string
  login: string
  role: 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador'
  institution_id: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// Mock data removed - now using real API data

const roleLabels = {
  admin_lify: "Admin Lify",
  suporte_lify: "Suporte Lify",
  atendente: "Atendente",
  gestor: "Gestor",
  administrador: "Administrador"
}

const roleColors = {
  admin_lify: "bg-purple-100 text-purple-800 border-purple-200",
  suporte_lify: "bg-orange-100 text-orange-800 border-orange-200",
  atendente: "bg-pink-100 text-pink-800 border-pink-200",
  gestor: "bg-blue-100 text-blue-800 border-blue-200",
  administrador: "bg-red-100 text-red-800 border-red-200"
}

export default function Users() {
  const { selectedInstitution } = useInstitutionContext()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // API hooks - Now using real API
  const { data: users = [], loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(selectedInstitution?.id)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.login.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }


  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const formData = new FormData(e.currentTarget)
      const userData = {
        name: formData.get('name') as string,
        login: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador',
        institution_id: selectedInstitution?.id || '',
        status: 'active' as 'active' | 'inactive'
      }
      
      console.log('Criando usuário:', userData)
      
      await userApi.createUser(userData)
      
      // Recarregar lista de usuários
      await refetchUsers()
      
      // Fechar modal e limpar formulário
      setIsCreateDialogOpen(false)
      e.currentTarget.reset()
      
      // Mostrar notificação de sucesso
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      })
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Verifique os dados e tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return
    
    try {
      const formData = new FormData(e.currentTarget)
      const updateData = {
        name: formData.get('edit-name') as string,
        login: formData.get('edit-email') as string,
        role: formData.get('edit-role') as 'admin_lify' | 'suporte_lify' | 'atendente' | 'gestor' | 'administrador',
        status: formData.get('edit-status') as 'active' | 'inactive'
      }
      
      console.log('Atualizando usuário:', editingUser.id, updateData)
      
      await userApi.updateUser(editingUser.id, updateData)
      
      // Recarregar lista de usuários
      await refetchUsers()
      
      // Fechar modal
      setIsEditDialogOpen(false)
      setEditingUser(null)
      
      // Mostrar notificação de sucesso
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      })
      
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast({
        title: "Erro",
        description: `Erro ao atualizar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        console.log('Deletando usuário:', user.id)
        
        await userApi.deleteUser(user.id)
        
        // Recarregar lista de usuários
        await refetchUsers()
        
        // Mostrar notificação de sucesso
        toast({
          title: "Sucesso",
          description: "Usuário deletado com sucesso!",
        })
        
      } catch (error) {
        console.error('Erro ao deletar usuário:', error)
        toast({
          title: "Erro",
          description: `Erro ao deletar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive"
        })
      }
    }
  }

  // No institution selected
  if (!selectedInstitution) {
    return (
      <div className="flex items-center justify-center h-64">
        <Building2 className="h-8 w-8 text-muted-foreground" />
        <div className="ml-2 text-center">
          <p className="text-muted-foreground">Nenhuma instituição selecionada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma instituição para visualizar os usuários
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
      </div>
    )
  }

  // Error state
  if (usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div className="ml-2 text-center">
          <p className="text-destructive font-medium">Erro ao carregar usuários</p>
          <p className="text-sm text-muted-foreground">{usersError?.message || 'Erro desconhecido'}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchUsers()}
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header com botão voltar */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
        <Link to="/settings">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Voltar para Configurações"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Gestão de Usuários</h1>
      </div>

      {/* Conteúdo da tela */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo usuário
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" name="name" placeholder="Digite o nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" name="email" type="email" placeholder="usuario@email.com" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Digite a senha" 
                  required 
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função *</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_lify">Admin Lify</SelectItem>
                    <SelectItem value="suporte_lify">Suporte Lify</SelectItem>
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos extras para testar scroll no modal */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" name="department" placeholder="Ex: Atendimento, Administração" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" placeholder="(48) 99999-9999" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" placeholder="Rua, número, bairro" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Observações sobre o usuário..." 
                  className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-date">Data de Início</Label>
                <Input id="start-date" name="start-date" type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permissions">Permissões Especiais</Label>
                <div className="space-y-2 max-h-24 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="admin" />
                    <span className="text-sm">Administração completa</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="reports" />
                    <span className="text-sm">Visualizar relatórios</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="export" />
                    <span className="text-sm">Exportar dados</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="backup" />
                    <span className="text-sm">Fazer backup</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="settings" />
                    <span className="text-sm">Alterar configurações</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="users" />
                    <span className="text-sm">Gerenciar usuários</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="permissions" value="institutions" />
                    <span className="text-sm">Gerenciar instituiçãos</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Usuário
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="admin_lify">Admin Lify</SelectItem>
              <SelectItem value="suporte_lify">Suporte Lify</SelectItem>
              <SelectItem value="atendente">Atendente</SelectItem>
              <SelectItem value="gestor">Gestor</SelectItem>
              <SelectItem value="administrador">Administrador</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.login}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.role]}>
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Clínica ID: {user.institution_id}</span>
                      </div>
                    </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{user.login}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' 
                        ? 'bg-pink-100 text-pink-800 border-pink-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  
                   <TableCell className="text-right">
                     <div className="flex justify-end space-x-1">
                       <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="text-destructive hover:text-destructive"
                         onClick={() => handleDelete(user)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                      <p className="text-muted-foreground text-center max-w-sm">
                        Não há usuários cadastrados para esta instituição.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input id="edit-name" name="edit-name" defaultValue={editingUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input id="edit-email" name="edit-email" type="email" defaultValue={editingUser.login} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Função</Label>
                  <Select name="edit-role" defaultValue={editingUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin_lify">Admin Lify</SelectItem>
                      <SelectItem value="suporte_lify">Suporte Lify</SelectItem>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="edit-status" defaultValue={editingUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}