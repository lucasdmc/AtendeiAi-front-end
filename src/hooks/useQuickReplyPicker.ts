import { useState, useCallback, useRef, useEffect } from 'react';

interface UseQuickReplyPickerOptions {
  onSelect?: (content: string, quickReplyId?: string) => void;
  triggerChar?: string;
  minQueryLength?: number;
}

interface UseQuickReplyPickerReturn {
  isOpen: boolean;
  query: string;
  position: { x: number; y: number } | null;
  openPicker: (query?: string, position?: { x: number; y: number }) => void;
  closePicker: () => void;
  handleTextareaKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
  handleTextareaInput: (e: React.FormEvent<HTMLTextAreaElement>) => boolean;
  handleSelect: (content: string, quickReplyId?: string) => void;
}

export const useQuickReplyPicker = ({
  onSelect,
  triggerChar = '/',
  minQueryLength = 0,
}: UseQuickReplyPickerOptions = {}): UseQuickReplyPickerReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [triggerPosition, setTriggerPosition] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Abrir picker
  const openPicker = useCallback((initialQuery = '', pos?: { x: number; y: number }) => {
    setQuery(initialQuery);
    setPosition(pos || null);
    setIsOpen(true);
  }, []);

  // Fechar picker
  const closePicker = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setPosition(null);
    setTriggerPosition(-1);
  }, []);

  // Calcular posição do cursor no textarea
  const getCaretCoordinates = useCallback((textarea: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = getComputedStyle(textarea);
    
    // Copiar estilos relevantes
    [
      'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight',
      'padding', 'border', 'boxSizing', 'whiteSpace', 'wordWrap'
    ].forEach(prop => {
      div.style[prop as any] = style[prop as any];
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = textarea.clientWidth + 'px';
    div.style.top = '0';
    div.style.left = '0';
    
    // Inserir texto até a posição do cursor
    const textBeforeCursor = textarea.value.substring(0, position);
    div.textContent = textBeforeCursor;
    
    // Adicionar span para marcar a posição
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);
    
    document.body.appendChild(div);
    
    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    const coordinates = {
      x: spanRect.left - rect.left,
      y: spanRect.top - rect.top + spanRect.height,
    };
    
    document.body.removeChild(div);
    return coordinates;
  }, []);

  // Handler para keydown no textarea
  const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textareaRef.current = textarea;

    // Se o picker estiver aberto, deixar ele lidar com a navegação
    if (isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        return true; // Indica que o picker deve lidar com o evento
      }
    }

    // Detectar comando de trigger
    if (e.key === triggerChar && !isOpen) {
      const cursorPosition = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPosition);
      
      // Verificar se está no início ou após espaço/quebra de linha
      if (cursorPosition === 0 || /\s$/.test(textBefore)) {
        const coordinates = getCaretCoordinates(textarea, cursorPosition);
        const rect = textarea.getBoundingClientRect();
        
        setTriggerPosition(cursorPosition + 1); // +1 para incluir o caractere trigger
        openPicker('', {
          x: rect.left + coordinates.x,
          y: rect.top + coordinates.y,
        });
        
        return false; // Não prevenir o evento, deixar o caractere ser digitado
      }
    }

    return false;
  }, [isOpen, triggerChar, openPicker, getCaretCoordinates]);

  // Handler para input no textarea
  const handleTextareaInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textareaRef.current = textarea;

    if (isOpen && triggerPosition >= 0) {
      const cursorPosition = textarea.selectionStart;
      const textAfterTrigger = textarea.value.substring(triggerPosition, cursorPosition);
      
      // Verificar se ainda estamos na mesma linha e sem espaços
      if (textAfterTrigger.includes('\n') || textAfterTrigger.includes(' ')) {
        closePicker();
        return false;
      }
      
      // Atualizar query
      const newQuery = textAfterTrigger;
      if (newQuery.length >= minQueryLength) {
        setQuery(newQuery);
      }
      
      return true; // Indica que o picker está ativo
    }

    return false;
  }, [isOpen, triggerPosition, minQueryLength, closePicker]);

  // Handler para seleção de resposta rápida
  const handleSelect = useCallback((content: string, quickReplyId?: string) => {
    if (textareaRef.current && triggerPosition >= 0) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, triggerPosition - 1); // -1 para remover o trigger char
      const textAfter = textarea.value.substring(cursorPosition);
      
      // Substituir o comando pelo conteúdo
      const newValue = textBefore + content + textAfter;
      textarea.value = newValue;
      
      // Posicionar cursor após o conteúdo inserido
      const newCursorPosition = textBefore.length + content.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      
      // Disparar evento de input para notificar mudanças
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);
    }
    
    // Chamar callback personalizado
    onSelect?.(content, quickReplyId);
    
    closePicker();
  }, [triggerPosition, onSelect, closePicker]);

  // Fechar picker quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        closePicker();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closePicker]);

  return {
    isOpen,
    query,
    position,
    openPicker,
    closePicker,
    handleTextareaKeyDown,
    handleTextareaInput,
    handleSelect,
  };
};

export default useQuickReplyPicker;


