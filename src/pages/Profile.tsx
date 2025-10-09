import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Camera,
  Save,
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import ProfileSidebar from '@/components/ProfileSidebar';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, attendant } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dados do usuário autenticado
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: user?.id || '',
    name: attendant?.name || user?.email || 'Usuário',
    email: user?.email || '',
    phone: attendant?.phone || '',
    avatar: attendant?.avatar || `https://via.placeholder.com/150x150/f3f4f6/6b7280?text=${attendant?.name?.charAt(0) || 'U'}`,
    status: 'Olá! Eu estou usando o WhatsApp'
  });

  // Formulário de edição
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone || '',
    status: userProfile.status
  });

  // Atualizar formData quando userProfile mudar
  useEffect(() => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      status: userProfile.status
    });
  }, [userProfile]);

  // Formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Em produção, faria upload do arquivo para o servidor
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUserProfile(prev => ({
          ...prev,
          avatar: result
        }));
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setUserProfile(prev => ({
      ...prev,
      avatar: undefined
    }));
    toast({
      title: "Foto removida",
      description: "Sua foto de perfil foi removida.",
    });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Em produção, faria chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay

      setUserProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status
      }));

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Em produção, faria chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsPasswordDialogOpen(false);

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2) // Limitar a apenas 2 palavras
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar de Perfil */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Clean com botão voltar */}
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">Perfil</h1>
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
                <UserCheck className="h-6 w-6 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Meu Perfil
                  </div>
                  <div className="text-xs text-gray-500">
                    Gerenciar informações pessoais
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
            Meu Perfil
          </h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Foto de Perfil */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="text-3xl">
                      {getInitials(userProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile.name}</h3>
                  <p className="text-sm text-gray-500">{userProfile.email}</p>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar
                  </Button>
                  {userProfile.avatar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita - Informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                        placeholder="+55 11 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status/Mensagem</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    placeholder="Digite seu status"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.status.length}/100 caracteres</p>
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Alterar Senha</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Mantenha sua conta segura alterando sua senha regularmente.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha desejada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}