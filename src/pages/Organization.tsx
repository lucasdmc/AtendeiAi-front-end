import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { organizationService } from '@/services/organizationService';
import { BRAZILIAN_STATES, DELETE_REASONS } from '@/types/organization';
import { maskCNPJ, maskCEP, maskPhone, removeMask, validateCNPJ } from '@/lib/masks';
import { useInstitution } from '@/contexts/InstitutionContext';

// Schema de validação
const organizationSchema = z.object({
  id: z.string(),
  razaoSocial: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres'),
  cnpj: z.string().refine((val) => validateCNPJ(val), 'CNPJ inválido'),
  avatarUrl: z.string().optional(),
  responsavel: z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
  endereco: z.object({
    cep: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    bairro: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
  }),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function Organization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedInstitution, isLoading: institutionLoading, error: institutionError } = useInstitution();

  const [isCepLoading, setIsCepLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      id: 'ab0AfzqminKeqVbz',
      razaoSocial: '',
      cnpj: '',
      avatarUrl: '',
      responsavel: {
        nome: 'Lify Healthtech',
        email: '',
        telefone: '',
        whatsapp: '',
      },
      endereco: {
        cep: '',
        cidade: '',
        estado: '',
        bairro: '',
        rua: '',
        numero: '',
        complemento: '',
      },
    },
  });

  // Carregar dados da instituição selecionada
  useEffect(() => {
    if (selectedInstitution) {
      // Mapear dados da instituição para o formulário
      setValue('id', selectedInstitution._id);
      setValue('razaoSocial', selectedInstitution.name || '');
      setValue('cnpj', selectedInstitution.cnpj || '');
      setValue('avatarUrl', selectedInstitution.logo_url || '');
      
      // Dados do responsável (usar dados do primeiro atendente admin/proprietario se disponível)
      setValue('responsavel.nome', selectedInstitution.contact_name || '');
      setValue('responsavel.email', selectedInstitution.contact_email || '');
      setValue('responsavel.telefone', selectedInstitution.contact_phone || '');
      setValue('responsavel.whatsapp', selectedInstitution.whatsapp_config?.phone_number || '');
      
      // Dados do endereço
      setValue('endereco.cep', selectedInstitution.address?.zipCode || '');
      setValue('endereco.cidade', selectedInstitution.address?.city || '');
      setValue('endereco.estado', selectedInstitution.address?.state || '');
      setValue('endereco.bairro', selectedInstitution.address?.neighborhood || '');
      setValue('endereco.rua', selectedInstitution.address?.street || '');
      setValue('endereco.numero', selectedInstitution.address?.number || '');
      setValue('endereco.complemento', selectedInstitution.address?.complement || '');
    }
  }, [selectedInstitution, setValue]);

  // Handlers para upload de avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload (mock - em produção, descomentar)
    try {
      // const result = await organizationService.uploadAvatar(file);
      // setValue('avatarUrl', result.url);
      toast({
        title: 'Avatar atualizado',
        description: 'A imagem foi carregada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao fazer upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  // Handler para buscar CEP
  const handleCepBlur = useCallback(async () => {
    const cep = watch('endereco.cep');
    if (!cep || removeMask(cep).length !== 8) return;

    setIsCepLoading(true);
    try {
      const data = await organizationService.lookupCep(cep);
      
      setValue('endereco.rua', data.logradouro);
      setValue('endereco.bairro', data.bairro);
      setValue('endereco.cidade', data.localidade);
      setValue('endereco.estado', data.uf);

      toast({
        title: 'CEP encontrado',
        description: 'Endereço preenchido automaticamente.',
      });
    } catch (error) {
      toast({
        title: 'CEP não encontrado',
        description: error instanceof Error ? error.message : 'Erro ao buscar CEP',
        variant: 'destructive',
      });
    } finally {
      setIsCepLoading(false);
    }
  }, [watch, setValue, toast]);

  // Submit do formulário
  const onSubmit = async (data: OrganizationFormData) => {
    try {
      // Remover máscaras antes de enviar
      await organizationService.updateOrganization({
        ...data,
        cnpj: removeMask(data.cnpj),
        responsavel: {
          ...data.responsavel,
          telefone: data.responsavel.telefone ? removeMask(data.responsavel.telefone) : undefined,
          whatsapp: data.responsavel.whatsapp ? removeMask(data.responsavel.whatsapp) : undefined,
        },
        endereco: {
          ...data.endereco,
          cep: data.endereco.cep ? removeMask(data.endereco.cep) : undefined,
        },
      });

      toast({
        title: 'Dados salvos',
        description: 'Dados da organização salvos com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  // Handler de exclusão
  const handleDelete = async () => {
    const expectedText = `Excluir minha organização ${watch('responsavel.nome')} e tudo associado a ela`;
    if (deleteConfirmText !== expectedText) return;

    setIsDeleting(true);
    try {
      // await organizationService.deleteOrganization(deleteReason);

      toast({
        title: 'Organização excluída',
        description: 'Sua organização foi excluída com sucesso.',
      });

      // Redirecionar para tela de login/welcome
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Mostrar erro se não houver instituição selecionada
  if (institutionError) {
    return (
      <div className="min-h-screen bg-[#F4F6FD] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {institutionError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedInstitution && !institutionLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FD] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma instituição selecionada. Selecione uma instituição no sidebar para continuar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (institutionLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FD] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando dados da instituição...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FD]">
      <div className="px-6 py-6 max-w-[1200px] mx-auto">
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
            <span>Configurações da instituição</span>
          </div>

          {/* Título e descrição */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-1">
            Configurações da instituição
          </h1>
          <p className="text-slate-500">
            Gerencie as informações da instituição <strong>{selectedInstitution?.name}</strong>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="bg-white border-b border-slate-200 rounded-none h-auto p-0 mb-6">
            <TabsTrigger 
              value="perfil" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger value="conversas" disabled>Conversas</TabsTrigger>
            <TabsTrigger value="reatribuicao" disabled>Reatribuição</TabsTrigger>
            <TabsTrigger value="inatividade" disabled>Inatividade</TabsTrigger>
            <TabsTrigger value="espera" disabled>Espera</TabsTrigger>
            <TabsTrigger value="atalhos" disabled>Atalhos de chatbot</TabsTrigger>
            <TabsTrigger value="transferencia" disabled>Transferência</TabsTrigger>
            <TabsTrigger value="listar" disabled>Listar todas as conversas</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            {/* Card principal */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção: Identidade */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Identidade</h3>
                  
                  <div className="flex items-start gap-6 mb-6">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || watch('avatarUrl')} />
                        <AvatarFallback className="text-2xl">
                          {watch('responsavel.nome')?.slice(0, 2).toUpperCase() || 'OR'}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                        aria-label="Alterar avatar"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* ID */}
                  <div className="mb-4">
                    <Label htmlFor="id">ID</Label>
                    <Input
                      id="id"
                      {...register('id')}
                      readOnly
                      className="bg-slate-50 mt-1"
                    />
                  </div>

                  {/* Razão Social e CNPJ */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="razaoSocial">Razão social</Label>
                      <Input
                        id="razaoSocial"
                        {...register('razaoSocial')}
                        className="mt-1"
                        placeholder="Digite a razão social"
                      />
                      {errors.razaoSocial && (
                        <p className="text-xs text-red-500 mt-1">{errors.razaoSocial.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        {...register('cnpj')}
                        onChange={(e) => {
                          const masked = maskCNPJ(e.target.value);
                          setValue('cnpj', masked);
                        }}
                        value={watch('cnpj')}
                        className="mt-1"
                        placeholder="00.000.000/0000-00"
                      />
                      {errors.cnpj && (
                        <p className="text-xs text-red-500 mt-1">{errors.cnpj.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do responsável */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Dados do responsável pela conta
                  </h3>

                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <Label htmlFor="responsavel.nome">
                        Nome <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="responsavel.nome"
                        {...register('responsavel.nome')}
                        className="mt-1"
                        placeholder="Digite o nome"
                      />
                      {errors.responsavel?.nome && (
                        <p className="text-xs text-red-500 mt-1">{errors.responsavel.nome.message}</p>
                      )}
                    </div>

                    {/* Email, Telefone, WhatsApp */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="responsavel.email">E-mail</Label>
                        <Input
                          id="responsavel.email"
                          type="email"
                          {...register('responsavel.email')}
                          className="mt-1"
                          placeholder="email@exemplo.com"
                        />
                        {errors.responsavel?.email && (
                          <p className="text-xs text-red-500 mt-1">{errors.responsavel.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="responsavel.telefone">Telefone</Label>
                        <Input
                          id="responsavel.telefone"
                          {...register('responsavel.telefone')}
                          onChange={(e) => {
                            const masked = maskPhone(e.target.value);
                            setValue('responsavel.telefone', masked);
                          }}
                          value={watch('responsavel.telefone')}
                          className="mt-1"
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div>
                        <Label htmlFor="responsavel.whatsapp">WhatsApp</Label>
                        <Input
                          id="responsavel.whatsapp"
                          {...register('responsavel.whatsapp')}
                          onChange={(e) => {
                            const masked = maskPhone(e.target.value);
                            setValue('responsavel.whatsapp', masked);
                          }}
                          value={watch('responsavel.whatsapp')}
                          className="mt-1"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    Endereço da empresa
                  </h3>

                  <div className="space-y-4">
                    {/* CEP */}
                    <div className="md:w-1/3">
                      <Label htmlFor="endereco.cep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="endereco.cep"
                          {...register('endereco.cep')}
                          onChange={(e) => {
                            const masked = maskCEP(e.target.value);
                            setValue('endereco.cep', masked);
                          }}
                          onBlur={handleCepBlur}
                          value={watch('endereco.cep')}
                          className="mt-1"
                          placeholder="00000-000"
                        />
                        {isCepLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Cidade, Estado, Bairro */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="endereco.cidade">Cidade</Label>
                        <Input
                          id="endereco.cidade"
                          {...register('endereco.cidade')}
                          className="mt-1"
                          placeholder="Digite a cidade"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endereco.estado">Estado</Label>
                        <Select
                          value={watch('endereco.estado')}
                          onValueChange={(value) => setValue('endereco.estado', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="endereco.bairro">Bairro</Label>
                        <Input
                          id="endereco.bairro"
                          {...register('endereco.bairro')}
                          className="mt-1"
                          placeholder="Digite o bairro"
                        />
                      </div>
                    </div>

                    {/* Rua, Número, Complemento */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="endereco.rua">Rua</Label>
                        <Input
                          id="endereco.rua"
                          {...register('endereco.rua')}
                          className="mt-1"
                          placeholder="Digite a rua"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endereco.numero">Número</Label>
                        <Input
                          id="endereco.numero"
                          {...register('endereco.numero')}
                          className="mt-1"
                          placeholder="Nº"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endereco.complemento">Complemento</Label>
                        <Input
                          id="endereco.complemento"
                          {...register('endereco.complemento')}
                          className="mt-1"
                          placeholder="Apto, bloco, etc"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão Salvar */}
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </form>
            </div>

            {/* Card de exclusão */}
            <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Excluir organização
              </h3>
              <p className="text-sm font-bold text-red-600 mb-2">
                Leia com muita atenção!
              </p>
              <p className="text-sm text-slate-700 mb-6">
                Uma vez excluída, esta operação não poderá ser desfeita. Não serão feitas futuras cobranças.
              </p>

              <div className="mb-4">
                <Label htmlFor="deleteReason" className="text-sm">
                  Motivo da exclusão <span className="text-slate-500">(Opcional)</span>
                </Label>
                <Select value={deleteReason} onValueChange={setDeleteReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Escolha uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELETE_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="destructive"
                className="w-full h-12"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Excluir organização
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de confirmação de exclusão */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                🗑️ Excluir organização
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-slate-700">
                Tem certeza <span className="font-bold text-red-600">absoluta</span> que deseja excluir a organização{' '}
                <span className="font-bold text-red-600">{watch('responsavel.nome')}</span>?
              </p>

              <p className="text-sm text-slate-700">
                <span className="font-bold">Todo</span> o conteúdo da organização será excluído.{' '}
                <span className="font-bold">Incluindo chats, contatos, mídias, chatbots, etiquetas etc.</span>
              </p>

              <p className="text-sm text-slate-700">
                Os atendentes associados a essa organização perderão o acesso imediatamente após a exclusão
              </p>

              <p className="text-2xl font-bold text-red-500 text-center py-2">
                Esta ação não é reversível!
              </p>

              <div>
                <p className="text-sm text-slate-700 mb-2">
                  Digite <span className="font-bold">Excluir minha organização {watch('responsavel.nome')} e tudo associado a ela</span> para continuar
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder=""
                  className="text-sm"
                />
          </div>
        </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
                disabled={deleteConfirmText !== `Excluir minha organização ${watch('responsavel.nome')} e tudo associado a ela` || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
