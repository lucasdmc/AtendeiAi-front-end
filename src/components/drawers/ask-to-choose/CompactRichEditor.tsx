// Editor rico compacto com formatação e emojis
import { useRef, useEffect } from 'react';
import { Bold, Italic, Code, Strikethrough, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CompactRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Emojis comuns
const EMOJI_CATEGORIES = [
  {
    name: 'Rostos',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  },
  {
    name: 'Mãos',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  },
  {
    name: 'Símbolos',
    emojis: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '⭐', '🌟', '✨', '💫', '🔥', '💯', '💢', '💥', '💦', '💨'],
  },
];

export function CompactRichEditor({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  className,
  minHeight = '80px',
}: CompactRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sincronizar valor externo com o editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Atualizar conteúdo quando value mudar
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Aplicar formatação
  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  };

  // Inserir emoji
  const insertEmoji = (emoji: string) => {
    document.execCommand('insertText', false, emoji);
    editorRef.current?.focus();
  };

  const isEmpty = !value || value.trim() === '';

  return (
    <div className={cn('border border-neutral-200 rounded-xl overflow-hidden bg-white', className)}>
      {/* Toolbar compacto */}
      <div className="border-b border-neutral-100 px-2 py-1.5 flex items-center gap-0.5 bg-neutral-50">
        <TooltipProvider delayDuration={300}>
          {/* Bold */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => applyFormat('bold')}
                type="button"
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Negrito</TooltipContent>
          </Tooltip>

          {/* Italic */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => applyFormat('italic')}
                type="button"
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Itálico</TooltipContent>
          </Tooltip>

          {/* Strikethrough (Rasurado) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => applyFormat('strikeThrough')}
                type="button"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rasurado</TooltipContent>
          </Tooltip>

          {/* Code (Monoespaçado) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.toString()) {
                    const code = document.createElement('code');
                    code.className = 'bg-neutral-200 px-1 rounded font-mono text-sm';
                    const range = selection.getRangeAt(0);
                    code.appendChild(range.extractContents());
                    range.insertNode(code);
                  }
                  editorRef.current?.focus();
                }}
                type="button"
              >
                <Code className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Monoespaçado</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-neutral-300 mx-1" />

          {/* Emoji Picker */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    type="button"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="max-h-64 overflow-y-auto">
                {EMOJI_CATEGORIES.map((category) => (
                  <div key={category.name} className="p-2">
                    <div className="text-xs font-semibold text-neutral-500 mb-1.5">
                      {category.name}
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {category.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="text-xl hover:bg-neutral-100 rounded p-1 transition-colors"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </div>

      {/* Área de edição */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className={cn(
            'p-3 text-sm leading-relaxed outline-none',
            'focus:outline-none',
            // Estilos para elementos formatados
            '[&_strong]:font-bold',
            '[&_em]:italic',
            '[&_s]:line-through',
            '[&_strike]:line-through',
            '[&_code]:bg-neutral-200 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm',
          )}
          style={{ minHeight }}
          suppressContentEditableWarning
        />
        {isEmpty && (
          <div 
            className="absolute top-3 left-3 text-sm text-neutral-400 pointer-events-none"
            style={{ minHeight }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

