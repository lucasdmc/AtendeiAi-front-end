import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, Attendant } from '../services/authService';

// Interface para o contexto de autenticação
interface AuthContextType {
  // Estado
  user: User | null;
  attendant: Attendant | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Métodos
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    institutionName: string;
    institutionType: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string, method: 'email' | 'whatsapp') => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Verificações de permissão
  hasRole: (role: string) => boolean;
  isAdminLify: () => boolean;
  isSuporteLify: () => boolean;
  isClientUser: () => boolean;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Props do provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider do contexto de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [attendant, setAttendant] = useState<Attendant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se está autenticado
  const isAuthenticated = authService.isAuthenticated() && (!!user || !!attendant);

  // Carregar dados do usuário
  const loadUser = async (): Promise<void> => {
    try {
      // Se já temos dados do usuário, não precisamos carregar novamente
      if (user && attendant) {
        setIsLoading(false);
        return;
      }
      
      if (authService.isAuthenticated()) {
        const data = await authService.getCurrentUser();
        setUser(data.user);
        setAttendant(data.attendant || null);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      // Se falhou, limpar estado
      setUser(null);
      setAttendant(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar dados do usuário
  const refreshUser = async (): Promise<void> => {
    await loadUser();
  };

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.login({ email, password });
      setUser(authData.user);
      setAttendant(authData.attendant || null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    institutionName: string;
    institutionType: string;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.register(data);
      setUser(authData.user);
      setAttendant(authData.attendant || null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setAttendant(null);
      setIsLoading(false);
    }
  };

  // Esqueci minha senha
  const forgotPassword = async (email: string, method: 'email' | 'whatsapp'): Promise<void> => {
    await authService.forgotPassword({ email, method });
  };

  // Redefinir senha
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await authService.resetPassword({ token, newPassword });
  };

  // Verificar se usuário tem role específico
  const hasRole = (role: string): boolean => {
    return user?.global_role === role;
  };

  // Verificar se é admin Lify
  const isAdminLify = (): boolean => {
    return hasRole('admin_lify');
  };

  // Verificar se é suporte Lify
  const isSuporteLify = (): boolean => {
    return hasRole('suporte_lify') || hasRole('admin_lify');
  };

  // Verificar se é cliente
  const isClientUser = (): boolean => {
    return hasRole('client_user');
  };

  // Carregar usuário na inicialização
  useEffect(() => {
    loadUser();
  }, []);

  // Valor do contexto
  const value: AuthContextType = {
    // Estado
    user,
    attendant,
    isLoading,
    isAuthenticated,

    // Métodos
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,

    // Verificações de permissão
    hasRole,
    isAdminLify,
    isSuporteLify,
    isClientUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente de loading para autenticação
export const AuthLoading: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para proteger rotas
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar esta página.</p>
          <a 
            href="/login" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Permissão Insuficiente</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

