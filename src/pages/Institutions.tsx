import { useState } from "react"
import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { TERMINOLOGY } from "@/constants/terminology"
import { institutionService, InstitutionWithStats } from "@/services/institutionService"
import { Building2, MapPin, Phone, Mail, Plus, Edit, Trash2, Search, Brain, Upload, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Institution {
  id: string
  name: string
  whatsapp_number: string
  meta_webhook_url?: string
  whatsapp_id?: string
  context_json: any
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// Mock data removed - now using real API data

export default function Institutions() {
  const { isAdminLify, isSuporteLify } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null)
  const [selectedInstitutionForJson, setSelectedInstitutionForJson] = useState<Institution | null>(null)
  const [jsonConfig, setJsonConfig] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Funções para compatibilidade com hooks
  const refetchInstitutions = async () => {
    await loadInstitutions()
  }

  const institutionsLoading = isLoading
  const institutionsError = error ? { message: error } : null

  // Verificar se o usuário tem permissão para acessar esta página
  const hasAccess = isAdminLify() || isSuporteLify()

  // Carregar instituições
  const loadInstitutions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await institutionService.getInstitutions()
      setInstitutions(response.institutions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar instituições')
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar instituições na montagem do componente
  React.useEffect(() => {
    if (hasAccess) {
      loadInstitutions()
    }
  }, [hasAccess])

  // Verificação de acesso
  if (!hasAccess) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar a gestão de {TERMINOLOGY.INSTITUTION.pluralLower}.
            </p>
            <p className="text-sm text-gray-500">
              Esta funcionalidade está disponível apenas para administradores e suporte da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const institutionData = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        description: formData.get('description') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        whatsapp_config: {
          phone_number: formData.get('whatsapp') as string
        }
      }
      
      console.log('Criando instituição:', institutionData)
      
      await institutionService.createInstitution(institutionData)
      
      // Recarregar lista de instituições
      await loadInstitutions()
      
      // Fechar modal e limpar formulário
      setIsCreateDialogOpen(false)
      e.currentTarget.reset()
      
      // Mostrar notificação de sucesso
      alert('Instituição criada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao criar instituição:', error)
      alert('Erro ao criar instituição. Verifique os dados e tente novamente.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (institution: InstitutionWithStats) => {
    setEditingInstitution(institution as Institution)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingInstitution) return
    
    try {
      const formData = new FormData(e.currentTarget)
      const updateData = {
        name: formData.get('edit-name') as string,
        whatsapp_id_number: formData.get('edit-whatsapp') as string,
        meta_webhook_url: formData.get('edit-webhook') as string,
        status: formData.get('edit-status') as string || 'active'
      }
      
      console.log('Atualizando instituição:', editingInstitution.id, updateData)
      
      // Chamada real para API de atualização
      const response = await fetch(`https://atendeai-20-production.up.railway.app/api/institutions/${editingInstitution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test',
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Erro ${response.status}: ${errorData.message || 'Falha ao atualizar instituição'}`)
      }
      
      const result = await response.json()
      console.log('Clínica atualizada com sucesso:', result)
      
      // Recarregar lista de instituiçãos
      await refetchInstitutions()
      
      // Fechar modal
      setIsEditDialogOpen(false)
      setEditingInstitution(null)
      
      // Mostrar notificação de sucesso
      alert('Clínica atualizada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao atualizar instituição:', error)
      alert(`Erro ao atualizar instituição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleJsonConfig = (institution: InstitutionWithStats) => {
    setSelectedInstitutionForJson(institution as Institution)
    setJsonConfig("")
    setIsJsonDialogOpen(true)
  }

  const handleDelete = async (institution: InstitutionWithStats) => {
    console.log('🗑️ Iniciando processo de deleção para instituição:', institution.id, institution.name)
    
    if (window.confirm(`Tem certeza que deseja deletar a instituição "${institution.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        console.log('✅ Confirmação recebida. Fazendo chamada DELETE para:', institution.id)
        
        // Chamada real para API de deleção
        const response = await fetch(`https://atendeai-20-production.up.railway.app/api/institutions/${institution.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test',
          },
        })
        
        console.log('📡 Resposta da API DELETE:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erro na resposta da API:', errorData)
          throw new Error(`Erro ${response.status}: ${errorData.message || 'Falha ao deletar instituição'}`)
        }
        
        const result = await response.json()
        console.log('✅ Clínica deletada com sucesso:', result)
        
        // Recarregar lista de instituiçãos
        console.log('🔄 Recarregando lista de instituiçãos...')
        await refetchInstitutions()
        console.log('✅ Lista de instituiçãos recarregada')
        
        // Mostrar notificação de sucesso
        alert('Clínica deletada com sucesso!')
        
      } catch (error) {
        console.error('❌ Erro ao deletar instituição:', error)
        alert(`Erro ao deletar instituição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    } else {
      console.log('❌ Deleção cancelada pelo usuário')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/json") {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const parsedJson = JSON.parse(content)
          setJsonConfig(JSON.stringify(parsedJson, null, 2))
        } catch (error) {
          alert("Erro ao ler o arquivo JSON. Verifique se o formato está correto.")
        }
      }
      reader.readAsText(file)
    } else {
      alert("Por favor, selecione um arquivo JSON válido.")
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ""
  }

  // Loading state
  if (institutionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando instituiçãos...</span>
      </div>
    )
  }

  // Error state
  if (institutionsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div className="ml-2 text-center">
          <p className="text-destructive font-medium">Erro ao carregar instituiçãos</p>
          <p className="text-sm text-muted-foreground">{institutionsError?.message || 'Erro desconhecido'}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchInstitutions()}
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
        <h1 className="text-xl font-semibold text-gray-900">{TERMINOLOGY.INSTITUTION.plural}</h1>
      </div>

      {/* Conteúdo da tela */}
      <div className="flex-1 bg-gray-50">
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Gerencie as {TERMINOLOGY.INSTITUTION.pluralLower} do sistema e suas configurações
              </p>
            </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova {TERMINOLOGY.INSTITUTION.singular}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Criar Nova {TERMINOLOGY.INSTITUTION.singular}</DialogTitle>
              <DialogDescription>
                Preencha as informações da nova {TERMINOLOGY.INSTITUTION.singularLower}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{TERMINOLOGY.LABELS.institutionName} *</Label>
                <Input id="name" name="name" placeholder={TERMINOLOGY.PLACEHOLDERS.institutionName} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" placeholder="Descrição da instituição" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="(11) 99999-9999" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="contato@institutiona.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" placeholder="Rua, número - Bairro" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook">Meta Webhook (Opcional)</Label>
                <Input id="webhook" name="webhook" placeholder="https://api.institutiona.com/webhook" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos extras para testar scroll no modal */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" name="address" placeholder="Rua, número, complemento" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" placeholder="Nome da cidade" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select name="state">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialties">Especialidades Oferecidas</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="institutiona-geral" />
                    <span className="text-sm">Clínica Geral</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="pediatria" />
                    <span className="text-sm">Pediatria</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="cardiologia" />
                    <span className="text-sm">Cardiologia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="dermatologia" />
                    <span className="text-sm">Dermatologia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="ginecologia" />
                    <span className="text-sm">Ginecologia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="ortopedia" />
                    <span className="text-sm">Ortopedia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="psicologia" />
                    <span className="text-sm">Psicologia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="specialties" value="neurologia" />
                    <span className="text-sm">Neurologia</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="opening-hours">Horário de Funcionamento</Label>
                <textarea 
                  id="opening-hours" 
                  name="opening-hours" 
                  placeholder="Ex: Segunda a Sexta: 08:00-18:00&#10;Sábado: 08:00-12:00" 
                  className="w-full p-2 border border-gray-300 rounded-md resize-none h-16"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Clínica</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="Descreva os serviços e diferenciais da instituição..." 
                  className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Clínica'}
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar ${TERMINOLOGY.INSTITUTION.pluralLower}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{TERMINOLOGY.INSTITUTION.singular}</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{institution.name}</span>
                      </div>
                      {institution.context_json && (() => {
                        try {
                          const contextData = JSON.parse(institution.context_json);
                          return contextData?.institution?.informacoes_basicas?.descricao && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {contextData.institution.informacoes_basicas.descricao}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-start space-x-2 max-w-xs">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">
                        {(() => {
                          if (!institution.context_json) return 'Endereço não informado';
                          try {
                            const contextData = JSON.parse(institution.context_json);
                            const endereco = contextData?.institution?.localizacao?.endereco_principal;
                            return typeof endereco === 'string' ? endereco : 'Endereço não informado';
                          } catch {
                            return 'Endereço não informado';
                          }
                        })()}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{(() => {
                          if (!institution.context_json) return 'Não informado';
                          try {
                            const contextData = JSON.parse(institution.context_json);
                            return contextData?.institution?.contatos?.telefone_principal || 'Não informado';
                          } catch {
                            return 'Não informado';
                          }
                        })()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{(() => {
                          if (!institution.context_json) return 'Não informado';
                          try {
                            const contextData = JSON.parse(institution.context_json);
                            return contextData?.institution?.contatos?.email_principal || 'Não informado';
                          } catch {
                            return 'Não informado';
                          }
                        })()}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">{institution.whatsapp_number}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={institution.status === 'active' ? 'default' : 'secondary'}
                      className={institution.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {institution.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      - usuários
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(institution.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  
                   <TableCell className="text-right">
                     <div className="flex justify-end space-x-1">
                       <Button variant="ghost" size="sm" onClick={() => handleJsonConfig(institution)}>
                         <Brain className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="sm" onClick={() => handleEdit(institution)}>
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="text-destructive hover:text-destructive"
                         onClick={() => handleDelete(institution)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredInstitutions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma instituição encontrada</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Não há instituiçãos que correspondam à sua busca.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Clínica</DialogTitle>
            <DialogDescription>
              Altere as informações da instituição
            </DialogDescription>
          </DialogHeader>
          {editingInstitution && (
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome da Clínica</Label>
                <Input id="edit-name" name="edit-name" defaultValue={editingInstitution.name} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Input id="edit-whatsapp" name="edit-whatsapp" defaultValue={editingInstitution.whatsapp_number} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-verify-token">WhatsApp Verify Token</Label>
                  <Input id="edit-verify-token" placeholder="verify_token_123" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-webhook">Meta Webhook (Opcional)</Label>
                <Input id="edit-webhook" name="edit-webhook" defaultValue={editingInstitution.meta_webhook_url || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="edit-status" defaultValue={editingInstitution.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Modal de Configuração JSON */}
      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Configuração JSON - {selectedInstitutionForJson?.name}</DialogTitle>
            <DialogDescription>
              Insira a configuração JSON para esta instituição
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <form className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="json-config">Configuração JSON</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar JSON
                  </Button>
                </div>
              </div>
              <Textarea 
                id="json-config"
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                placeholder='{"key": "value", "setting": "example"}'
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsJsonDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Configuração
              </Button>
            </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}