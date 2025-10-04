// Editor contentEditable com formatação visual
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ContentEditableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ContentEditableEditor({
  value,
  onChange,
  placeholder = 'Clique para editar...',
  className,
}: ContentEditableEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Atualizar conteúdo quando value mudar externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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

  const isEmpty = !value || value.trim() === '';

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className={cn(
          'min-h-[120px] p-3 text-sm leading-relaxed outline-none',
          'focus:outline-none',
          // Estilos para elementos formatados
          '[&_strong]:font-bold',
          '[&_em]:italic',
          '[&_code]:bg-neutral-200 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm',
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1',
          '[&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-2',
          '[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:my-2',
          '[&_li]:ml-4',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_blockquote]:my-2',
          '[&_a]:text-blue-600 [&_a]:underline',
          className
        )}
        suppressContentEditableWarning
      />
      {isEmpty && (
        <div className="absolute top-3 left-3 text-sm text-neutral-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}

