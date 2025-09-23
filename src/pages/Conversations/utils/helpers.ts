import { Conversation, Message } from '../../../services/api';
import { Users, Bot } from 'lucide-react';

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
export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Formata timestamp para exibição de data
 */
export const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

/**
 * Formata timestamp para exibição completa
 */
export const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('pt-BR');
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
    return {
      name: 'IA',
      color: '#E91E63', // Rosa Lify
      icon: Bot
    };
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
 * Filtra conversas baseado no tipo de filtro
 */
export const filterConversationsByType = (
  conversations: Conversation[], 
  filterType: string
): Conversation[] => {
  switch (filterType) {
    case 'Manual':
      return conversations.filter(c => !!c.assigned_user_id);
    case 'IA':
      return conversations.filter(c => !c.assigned_user_id);
    case 'Não lidas':
      return conversations.filter(c => (c.unread_count || 0) > 0);
    case 'Grupos':
      return conversations.filter(c => c.conversation_type === 'group');
    case 'Individuais':
      return conversations.filter(c => c.conversation_type === 'individual');
    case 'Flags Personalizadas':
      // Por enquanto retorna todas - será implementado com flags reais
      return conversations;
    case 'Tudo':
    default:
      return conversations;
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
