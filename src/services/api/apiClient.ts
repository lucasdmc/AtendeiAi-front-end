import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retryOnError?: boolean;
}

/**
 * Cliente HTTP para comunicação com a API
 */
class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;
  private authToken: string | null = null;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  /**
   * Configurar interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: any) => {
        // Adicionar token de autenticação se disponível
        if (this.authToken && !config.skipAuth) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Adicionar timestamp para evitar cache
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }
        
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
        return config;
      },
      (error: any) => {
        console.error('❌ Erro no request interceptor:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;
        
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data);
        
        // Retry em caso de erro de rede
        if (error.code === 'NETWORK_ERROR' && originalRequest.retryOnError !== false) {
          console.log('🔄 Tentando novamente...');
          return this.instance(originalRequest);
        }
        
        // Tratar erro de autenticação
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // TODO: Redirecionar para login
          window.location.href = '/login';
        }
        
        // Tratar erro de rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            console.log(`⏳ Rate limit atingido. Tentando novamente em ${retryAfter} segundos...`);
            await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
            return this.instance(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Definir token de autenticação
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }
  
  /**
   * Obter token de autenticação
   */
  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }
  
  /**
   * Limpar token de autenticação
   */
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }
  
  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
  
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config);
  }
  
  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, data, config);
  }
  
  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put(url, data, config);
  }
  
  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch(url, data, config);
  }
  
  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete(url, config);
  }
  
  /**
   * Upload de arquivo
   */
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
  
  /**
   * Download de arquivo
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
  
  /**
   * Obter instância do axios
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
  
  /**
   * Atualizar URL base
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.instance.defaults.baseURL = url;
  }
  
  /**
   * Obter URL base
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient();
