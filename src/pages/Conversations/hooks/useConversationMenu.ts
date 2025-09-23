import { useState, useCallback, useEffect } from 'react';
import { Conversation, UseConversationMenuReturn } from '../types';

export const useConversationMenu = (): UseConversationMenuReturn => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuClick = useCallback((conversationId: string) => {
    setOpenMenuId(prev => prev === conversationId ? null : conversationId);
  }, []);

  const handleMenuAction = useCallback((action: string, conversation: Conversation) => {
    console.log(`Ação ${action} executada para conversa:`, conversation);
    
    switch (action) {
      case 'archive':
        console.log('Arquivando conversa...');
        break;
      case 'delete':
        console.log('Excluindo conversa...');
        break;
      case 'star':
        console.log('Marcando conversa como favorita...');
        break;
      case 'pin':
        console.log('Fixando conversa...');
        break;
      case 'mute':
        console.log('Silenciando conversa...');
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
    
    // Fecha o menu após executar a ação
    setOpenMenuId(null);
  }, []);

  // Fecha o menu quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verifica se o clique foi fora do menu
      if (!target.closest('.conversation-menu') && !target.closest('[data-menu-trigger]')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  return {
    openMenuId,
    handleMenuClick,
    handleMenuAction
  };
};

