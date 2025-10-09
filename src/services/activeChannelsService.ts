import { apiService } from './api';

export interface ActiveChannel {
  id: string;
  name: string;
  type: 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'sms';
  session_type?: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  label: string;
  value: string;
}

export interface ActiveChannelsResponse {
  success: boolean;
  data: ActiveChannel[];
}

/**
 * Busca canais ativos com sessões conectadas para uso no flow editor
 */
export const getActiveChannels = async (institutionId: string): Promise<ActiveChannel[]> => {
  try {
    const response = await apiService.get<ActiveChannelsResponse>(`/channels/active`, {
      institution_id: institutionId
    });

    if (response.success) {
      return response.data;
    }

    throw new Error('Falha ao buscar canais ativos');
  } catch (error) {
    console.error('Erro ao buscar canais ativos:', error);
    throw error;
  }
};

/**
 * Associa uma sessão a um canal
 */
export const associateChannelSession = async (
  channelId: string, 
  sessionId: string, 
  sessionType: string,
  institutionId: string
) => {
  try {
    const response = await apiService.post(`/channels/${channelId}/session`, {
      session_id: sessionId,
      session_type: sessionType
    }, { institution_id: institutionId });

    return response;
  } catch (error) {
    console.error('Erro ao associar sessão ao canal:', error);
    throw error;
  }
};

/**
 * Dissocia uma sessão de um canal
 */
export const dissociateChannelSession = async (channelId: string, institutionId: string) => {
  try {
    const response = await apiService.delete(`/channels/${channelId}/session`, { institution_id: institutionId });

    return response;
  } catch (error) {
    console.error('Erro ao dissociar sessão do canal:', error);
    throw error;
  }
};

/**
 * Obtém informações da sessão associada a um canal
 */
export const getChannelSessionInfo = async (channelId: string, institutionId: string) => {
  try {
    const response = await apiService.get(`/channels/${channelId}/session`, {
      institution_id: institutionId
    });

    return response;
  } catch (error) {
    console.error('Erro ao obter informações da sessão:', error);
    throw error;
  }
};
