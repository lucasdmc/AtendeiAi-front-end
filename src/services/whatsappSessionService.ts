import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface WhatsAppSessionResponse {
  success: boolean;
  data?: {
    session_id: string;
  };
  message?: string;
}

export interface QRCodeResponse {
  success: boolean;
  data?: {
    qr_code: string;
    expires_at: string;
  };
  message?: string;
}

export interface SessionStatusResponse {
  success: boolean;
  data?: {
    session_id: string;
    clinic_id: string;
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    phone_number?: string;
    device_name: string;
    user_name: string;
    last_activity: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

export const whatsappSessionService = {
  /**
   * Criar nova sessão WhatsApp
   */
  async createSession(clinicId: string, deviceName?: string, userName?: string): Promise<WhatsAppSessionResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/whatsapp/sessions`, {
        clinic_id: clinicId,
        device_name: deviceName || `Dispositivo ${Date.now()}`,
        user_name: userName || 'Usuário'
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar sessão WhatsApp:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  },

  /**
   * Gerar QR Code para sessão
   */
  async generateQRCode(sessionId: string): Promise<QRCodeResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/whatsapp/sessions/${sessionId}/qr`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  },

  /**
   * Verificar status da sessão
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/whatsapp/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  },

  /**
   * Limpar sessões antigas de uma clínica
   */
  async cleanupSessions(clinicId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/whatsapp/sessions/cleanup`, {
        data: { clinic_id: clinicId }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao limpar sessões:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
};
