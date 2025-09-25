import { Conversation, Message } from '../../../services/api';
import { Users } from 'lucide-react';

/**
 * Gera iniciais a partir de um nome
 */
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Formata timestamp para exibição de hora
 */
export const formatTime = (timestamp: string | Date | undefined | null): string => {
  if (!timestamp) {
    return '--:--';
  }
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) {
    return '--:--';
  }
  
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Formata timestamp para exibição de data
 */
export const formatDate = (timestamp: string | Date | undefined | null): string => {
  if (!timestamp) {
    return '--/--/----';
  }
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) {
    return '--/--/----';
  }
  
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata timestamp para exibição completa
 */
export const formatDateTime = (timestamp: string | Date | undefined | null): string => {
  if (!timestamp) {
    return '--/--/---- --:--';
  }
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) {
    return '--/--/---- --:--';
  }
  
  return date.toLocaleString('pt-BR');
};

/**
 * Trunca texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Obtém a flag padrão baseada no tipo de atendimento
 */
export const getStandardFlag = (conversation: Conversation) => {
  if (conversation.assigned_user_id) {
    return {
      name: 'Manual',
      color: '#3B82F6', // Azul
      icon: Users
    };
  } else {
    // Não retorna mais flag para conversas automáticas
    return null;
  }
};

/**
 * Filtra conversas baseado em termo de busca
 */
export const filterConversationsBySearch = (
  conversations: Conversation[], 
  searchTerm: string
): Conversation[] => {
  if (!searchTerm.trim()) return conversations;
  
  const term = searchTerm.toLowerCase();
  return conversations.filter(conversation => {
    // ✅ Buscar em campos diferentes baseado no tipo de conversa
    if (conversation.conversation_type === 'group') {
      return (
        conversation.group_name?.toLowerCase().includes(term) ||
        conversation.group_id?.toLowerCase().includes(term) ||
        conversation.customer_phone?.toLowerCase().includes(term)
      );
    } else {
      return (
        conversation.customer_phone?.toLowerCase().includes(term) ||
        conversation.customer_name?.toLowerCase().includes(term)
      );
    }
  });
};

/**
 * Aplica filtros de configuração (newsletter, grupos)
 */
export const applyConfigurationFilters = (
  conversations: Conversation[],
  settings?: {
    show_newsletter?: boolean;
    show_groups?: boolean;
  }
): Conversation[] => {
  console.log('🔍 [FILTERS] Aplicando filtros de configuração:', {
    totalConversations: conversations.length,
    settings,
    conversationIds: conversations.map(c => c._id).slice(0, 3)
  });

  if (!settings) {
    console.log('🔍 [FILTERS] Nenhuma configuração fornecida, retornando todas as conversas');
    return conversations;
  }

  let filtered = conversations;

  // Filtrar newsletters se desabilitado
  if (settings.show_newsletter === false) {
    console.log('🔍 [FILTERS] Filtro de newsletter ATIVO (show_newsletter = false)');
    
    const beforeCount = filtered.length;
    filtered = filtered.filter(c => {
      // Usar campo conversation_subtype se disponível, senão usar detecção por nome
      const isNewsletter = 
        (c as any).conversation_subtype === 'newsletter' ||
        c.customer_name?.toLowerCase().includes('newsletter') ||
        c.customer_phone?.toLowerCase().includes('newsletter') ||
        c.group_name?.toLowerCase().includes('newsletter');
      
      if (isNewsletter) {
        console.log('🔍 [FILTERS] Conversa identificada como NEWSLETTER e será REMOVIDA:', {
          _id: c._id,
          customer_name: c.customer_name,
          customer_phone: c.customer_phone,
          conversation_subtype: (c as any).conversation_subtype
        });
      }
      
      return !isNewsletter;
    });
    
    console.log(`🔍 [FILTERS] Filtro newsletter: ${beforeCount} → ${filtered.length} conversas`);
  }

  // Filtrar grupos se desabilitado
  if (settings.show_groups === false) {
    console.log('🔍 [FILTERS] Filtro de grupos ATIVO (show_groups = false)');
    
    const beforeCount = filtered.length;
    filtered = filtered.filter(c => {
      const isGroup = c.conversation_type === 'group';
      if (isGroup) {
        console.log('🔍 [FILTERS] Conversa de GRUPO será REMOVIDA:', {
          _id: c._id,
          group_name: c.group_name,
          conversation_type: c.conversation_type
        });
      }
      return !isGroup;
    });
    
    console.log(`🔍 [FILTERS] Filtro grupos: ${beforeCount} → ${filtered.length} conversas`);
  }

  console.log('🔍 [FILTERS] Resultado final:', {
    totalOriginal: conversations.length,
    totalFiltrado: filtered.length,
    removidas: conversations.length - filtered.length
  });

  return filtered;
};

/**
 * Filtra conversas baseado no tipo de filtro
 */
export const filterConversationsByType = (
  conversations: Conversation[], 
  filterType: string,
  settings?: {
    show_newsletter?: boolean;
    show_groups?: boolean;
  }
): Conversation[] => {
  // Primeiro aplicar filtros de configuração
  const configFiltered = applyConfigurationFilters(conversations, settings);

  // Depois aplicar filtros de tipo
  switch (filterType) {
    case 'BOT':
      return configFiltered.filter(c => c.assigned_to === 'bot' || c.assigned_to === 'ai');
    case 'Não lidas':
      return configFiltered.filter(c => (c.unread_count || 0) > 0);
    case 'Grupos':
      return configFiltered.filter(c => c.conversation_type === 'group');
    case 'Individuais':
      return configFiltered.filter(c => c.conversation_type === 'individual');
    case 'Favoritas':
      return configFiltered.filter(c => c.is_favorite);
    case 'Tudo':
    default:
      return configFiltered;
  }
};

/**
 * Filtra mensagens baseado em termo de busca
 */
export const filterMessagesBySearch = (
  messages: Message[], 
  searchTerm: string
): Message[] => {
  if (!searchTerm.trim()) return messages;
  
  const term = searchTerm.toLowerCase();
  return messages.filter(message => 
    message.content?.toLowerCase().includes(term)
  );
};

/**
 * Conta conversas não lidas
 */
export const getUnreadConversationsCount = (conversations: Conversation[]): number => {
  return conversations.filter(c => (c.unread_count || 0) > 0).length;
};

/**
 * Valida se uma string é um email válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se uma string é um telefone válido (formato brasileiro)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?55\s?\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Formata número de telefone brasileiro
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Gera ID único simples
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function para otimizar buscas
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Copia texto para área de transferência
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar texto:', error);
    return false;
  }
};

/**
 * Calcula posição do menu baseado no elemento clicado
 */
export const calculateMenuPosition = (
  event: React.MouseEvent,
  _menuWidth: number = 192
) => {
  const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
  
  return {
    top: buttonRect.bottom + 4,
    right: window.innerWidth - buttonRect.right
  };
};

/**
 * Verifica se o elemento está visível na viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Scroll suave para um elemento
 */
export const scrollToElement = (element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void => {
  element.scrollIntoView({ behavior, block: 'nearest' });
};

/**
 * Converte cor hex para rgba
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Formata a exibição do remetente em mensagens de grupo
 * Especificação:
 * - Se nome e numero: mostrar os dois
 * - Se só nome: mostrar só o nome  
 * - Se só numero: mostrar só o número
 * - Se nenhum nem outro: mostrar "Não identificado"
 */
export const formatGroupSender = (senderName?: string, senderPhone?: string): string => {
  // Função para detectar se é um ID do WhatsApp
  const isWhatsAppId = (value: string): boolean => {
    return value.includes('@s.whatsapp.net') || 
           value.includes('@g.us') || 
           value.startsWith('+120') ||
           /^\d{15,}$/.test(value); // IDs muito longos
  };

  // Limpar e validar nome
  let cleanName = senderName?.trim();
  let hasValidName = false;
  
  if (cleanName && cleanName.length > 0) {
    // Se o nome é um ID do WhatsApp, considerar inválido
    if (!isWhatsAppId(cleanName) && !cleanName.startsWith('+') && cleanName !== 'null') {
      hasValidName = true;
    } else {
      cleanName = undefined; // Limpar nome inválido
    }
  }
  
  // Limpar e validar telefone
  let cleanPhone = senderPhone?.trim();
  let hasValidPhone = false;
  
  if (cleanPhone && cleanPhone.length > 0 && cleanPhone !== 'null') {
    // Validar se é um telefone válido (apenas dígitos, não muito longo)
    if (/^\d+$/.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 15) {
      hasValidPhone = true;
    } else {
      cleanPhone = undefined; // Limpar telefone inválido
    }
  }
  
  // Se temos nome e telefone válidos, mostrar ambos
  if (hasValidName && hasValidPhone) {
    const formattedPhone = formatPhoneNumberForGroup(cleanPhone!);
    return `${cleanName} ${formattedPhone}`;
  }
  
  // Se temos apenas o nome válido
  if (hasValidName) {
    return cleanName!;
  }
  
  // Se temos apenas o telefone válido
  if (hasValidPhone) {
    return formatPhoneNumberForGroup(cleanPhone!);
  }
  
  // Se não temos nem nome nem telefone válidos
  return 'Não identificado';
};

/**
 * Formata número de telefone para exibição em grupos (com código do país)
 */
export const formatPhoneNumberForGroup = (phone: string): string => {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se começar com 55 (código do Brasil), formatar como brasileiro
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 13) {
    const number = cleanPhone.substring(2); // Remove o 55
    const ddd = number.substring(0, 2);
    const firstPart = number.substring(2, 7);
    const secondPart = number.substring(7);
    return `+55 ${ddd} ${firstPart}-${secondPart}`;
  }
  
  // Para outros formatos, apenas adicionar +
  return `+${cleanPhone}`;
};
