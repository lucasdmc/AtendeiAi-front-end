/**
 * Utilitários para acessibilidade
 */

// Gera IDs únicos para elementos
export const generateId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Atributos ARIA comuns
export const ariaAttributes = {
  // Para botões
  button: (label: string, expanded?: boolean, controls?: string) => ({
    'aria-label': label,
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    ...(controls && { 'aria-controls': controls })
  }),

  // Para inputs
  input: (label: string, required?: boolean, invalid?: boolean, describedBy?: string) => ({
    'aria-label': label,
    ...(required && { 'aria-required': true }),
    ...(invalid && { 'aria-invalid': true }),
    ...(describedBy && { 'aria-describedby': describedBy })
  }),

  // Para listas
  list: (label: string, itemCount?: number) => ({
    role: 'list',
    'aria-label': label,
    ...(itemCount !== undefined && { 'aria-setsize': itemCount })
  }),

  // Para itens de lista
  listItem: (position?: number, selected?: boolean) => ({
    role: 'listitem',
    ...(position !== undefined && { 'aria-posinset': position }),
    ...(selected !== undefined && { 'aria-selected': selected })
  }),

  // Para menus
  menu: (label: string, expanded: boolean, orientation: 'horizontal' | 'vertical' = 'vertical') => ({
    role: 'menu',
    'aria-label': label,
    'aria-expanded': expanded,
    'aria-orientation': orientation
  }),

  // Para itens de menu
  menuItem: (label: string, hasSubmenu?: boolean) => ({
    role: 'menuitem',
    'aria-label': label,
    ...(hasSubmenu && { 'aria-haspopup': true })
  }),

  // Para diálogos/modais
  dialog: (label: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-label': label,
    'aria-modal': true,
    ...(describedBy && { 'aria-describedby': describedBy })
  }),

  // Para regiões
  region: (label: string) => ({
    role: 'region',
    'aria-label': label
  }),

  // Para status/live regions
  status: (polite: boolean = true) => ({
    role: 'status',
    'aria-live': polite ? 'polite' : 'assertive',
    'aria-atomic': true
  }),

  // Para tabs
  tab: (label: string, selected: boolean, controls: string) => ({
    role: 'tab',
    'aria-label': label,
    'aria-selected': selected,
    'aria-controls': controls
  }),

  // Para painéis de tab
  tabPanel: (labelledBy: string) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy
  })
};

// Teclas de navegação
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
} as const;

// Handlers para navegação por teclado
export const keyboardHandlers = {
  // Para listas navegáveis
  list: (
    event: React.KeyboardEvent,
    items: any[],
    currentIndex: number,
    onSelect: (index: number) => void,
    onActivate?: (index: number) => void
  ) => {
    switch (event.key) {
      case KEYS.ARROW_UP:
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onSelect(prevIndex);
        break;
      
      case KEYS.ARROW_DOWN:
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onSelect(nextIndex);
        break;
      
      case KEYS.HOME:
        event.preventDefault();
        onSelect(0);
        break;
      
      case KEYS.END:
        event.preventDefault();
        onSelect(items.length - 1);
        break;
      
      case KEYS.ENTER:
      case KEYS.SPACE:
        event.preventDefault();
        onActivate?.(currentIndex);
        break;
    }
  },

  // Para menus
  menu: (
    event: React.KeyboardEvent,
    onClose: () => void,
    onNavigate?: (direction: 'up' | 'down') => void
  ) => {
    switch (event.key) {
      case KEYS.ESCAPE:
        event.preventDefault();
        onClose();
        break;
      
      case KEYS.ARROW_UP:
        event.preventDefault();
        onNavigate?.('up');
        break;
      
      case KEYS.ARROW_DOWN:
        event.preventDefault();
        onNavigate?.('down');
        break;
    }
  },

  // Para modais
  modal: (event: React.KeyboardEvent, onClose: () => void) => {
    if (event.key === KEYS.ESCAPE) {
      event.preventDefault();
      onClose();
    }
  }
};

// Hook para gerenciar foco
export const useFocusManagement = () => {
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYS.TAB || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  return { focusElement, trapFocus };
};

// Utilitários para anúncios de screen reader
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Classes CSS para screen readers
export const srOnlyClass = 'sr-only';

// Verifica se o usuário prefere movimento reduzido
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Verifica se o usuário prefere alto contraste
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

