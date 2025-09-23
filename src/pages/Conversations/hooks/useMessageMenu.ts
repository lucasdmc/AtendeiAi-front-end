import { useState, useCallback, useEffect } from 'react';
import { Message, UseMessageMenuReturn, MenuPosition } from '../types';
import { calculateMenuPosition } from '../utils';

export const useMessageMenu = (): UseMessageMenuReturn => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, right: 0 });

  const handleMenuClick = useCallback((messageId: string, event: React.MouseEvent) => {
    if (openMenuId === messageId) {
      setOpenMenuId(null);
      return;
    }

    // Calcula a posição do menu baseado no botão clicado
    const position = calculateMenuPosition(event);
    setMenuPosition(position);
    setOpenMenuId(messageId);
  }, [openMenuId]);

  const handleMenuAction = useCallback((action: string, message: Message) => {
    console.log(`Ação ${action} executada para mensagem:`, message);
    
    switch (action) {
      case 'info':
        console.log('Mostrando informações da mensagem...');
        break;
      case 'reply':
        console.log('Respondendo mensagem...');
        break;
      case 'copy':
        console.log('Copiando mensagem...');
        // Implementar cópia para clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(message.content);
        }
        break;
      case 'forward':
        console.log('Encaminhando mensagem...');
        break;
      case 'star':
        console.log('Marcando mensagem como favorita...');
        break;
      case 'ban':
        console.log('Banindo usuário...');
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
      if (!target.closest('.message-menu') && !target.closest('[data-message-menu-trigger]')) {
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
    menuPosition,
    handleMenuClick,
    handleMenuAction
  };
};

