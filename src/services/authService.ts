// Serviço de autenticação para comunicação com a API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Interfaces para tipagem
export interface User {
  id: string;
  email: string;
  global_role: 'admin_lify' | 'suporte_lify' | 'client_user';
  status: string;
  last_login?: string;
}

export interface Attendant {
  id: string;
  name: string;
  role: 'membro' | 'operador' | 'admin' | 'proprietario';
  avatar?: string;
  phone?: string;
  institution: {
    id: string;
    name: string;
    type: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  attendant?: Attendant;
  institution?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  institutionName: string;
  institutionType: string;
}

export interface ForgotPasswordData {
  email: string;
  method: 'email' | 'whatsapp';
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Classe para gerenciar autenticação
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Carregar tokens do localStorage na inicialização
    this.loadTokensFromStorage();
  }

  // Carregar tokens do localStorage
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Salvar tokens no localStorage
  private saveTokensToStorage(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Limpar tokens do localStorage
  private clearTokensFromStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Obter token de acesso atual
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Fazer requisição autenticada
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se token expirou, tentar renovar
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Tentar novamente com novo token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, {
          ...options,
          headers,
        });
      }
    }

    return response;
  }

  // Renovar token de acesso
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.tokens) {
          this.saveTokensToStorage(
            data.data.tokens.accessToken,
            data.data.tokens.refreshToken
          );
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
    }

    // Se falhou, limpar tokens
    this.clearTokensFromStorage();
    return false;
  }

  // Login
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    if (data.success && data.data) {
      this.saveTokensToStorage(
        data.data.tokens.accessToken,
        data.data.tokens.refreshToken
      );
      return data.data;
    }

    throw new Error('Resposta inválida do servidor');
  }

  // Registro
  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar conta');
    }

    if (data.success && data.data) {
      this.saveTokensToStorage(
        data.data.tokens.accessToken,
        data.data.tokens.refreshToken
      );
      return data.data;
    }

    throw new Error('Resposta inválida do servidor');
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<{ user: User; attendant?: Attendant }> {
    const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter dados do usuário');
    }

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error('Resposta inválida do servidor');
  }

  // Esqueci minha senha
  async forgotPassword(forgotData: ForgotPasswordData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(forgotData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao solicitar recuperação de senha');
    }

    if (!data.success) {
      throw new Error(data.message || 'Erro ao solicitar recuperação de senha');
    }
  }

  // Redefinir senha
  async resetPassword(resetData: ResetPasswordData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao redefinir senha');
    }

    if (!data.success) {
      throw new Error(data.message || 'Erro ao redefinir senha');
    }
  }

  // Verificar se usuário tem role específico
  hasRole(_role: string): boolean {
    // Esta função será implementada quando tivermos os dados do usuário
    return false;
  }

  // Verificar se é admin Lify
  isAdminLify(): boolean {
    return this.hasRole('admin_lify');
  }

  // Verificar se é suporte Lify
  isSuporteLify(): boolean {
    return this.hasRole('suporte_lify') || this.hasRole('admin_lify');
  }

  // Verificar se é cliente
  isClientUser(): boolean {
    return this.hasRole('client_user');
  }
}

// Instância singleton do serviço
export const authService = new AuthService();

// Exportar também a classe para testes
export { AuthService };

// Exportar instância como default
export default authService;

