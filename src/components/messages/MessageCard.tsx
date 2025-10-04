// Card individual de mensagem com toolbar e ações
import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Smile,
  Braces,
  Heading,
  Copy,
  Trash2,
  GripVertical,
} from 'lucide-react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { ContentEditableEditor } from './ContentEditableEditor';

interface MessageCardProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  placeholder?: string;
  showDragHandle?: boolean;
}

// Variáveis/placeholders disponíveis
const VARIABLES = [
  { value: '@nome_cliente', label: 'Nome do cliente' },
  { value: '@telefone', label: 'Telefone' },
  { value: '@email', label: 'Email' },
  { value: '@empresa', label: 'Empresa' },
  { value: '@protocolo', label: 'Número de protocolo' },
];

export function MessageCard({
  id,
  value,
  onChange,
  onDuplicate,
  onDelete,
  placeholder = 'Clique para editar...',
  showDragHandle = true,
}: MessageCardProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showVariables, setShowVariables] = useState(false);

  // Configurar drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Aplicar formatação usando execCommand
  const applyFormat = (command: string, formatValue?: string) => {
    document.execCommand(command, false, formatValue);
    editorRef.current?.focus();
  };

  // Inserir variável
  const insertVariable = (variable: string) => {
    const span = document.createElement('span');
    span.contentEditable = 'false';
    span.className = 'inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono mx-0.5';
    span.textContent = variable;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setShowVariables(false);
    editorRef.current?.focus();
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header: Toolbar + Ações */}
      <div className="border-b border-neutral-100 px-3 py-2 flex items-center justify-between bg-neutral-50">
        {/* Toolbar de formatação */}
        <div className="flex items-center gap-1 flex-wrap">
          <TooltipProvider delayDuration={300}>
            {/* Bold */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('bold')}
                >
                  <Bold className="w-4 h-4" />
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
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Itálico</TooltipContent>
            </Tooltip>

            {/* Emoji */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('insertText', '😊')}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>

            {/* Code */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const selection = window.getSelection();
                    if (selection && selection.toString()) {
                      const code = document.createElement('code');
                      code.className = 'bg-neutral-200 px-1 rounded font-mono text-sm';
                      const range = selection.getRangeAt(0);
                      code.appendChild(range.extractContents());
                      range.insertNode(code);
                    }
                  }}
                >
                  <Code className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Código</TooltipContent>
            </Tooltip>

            {/* Heading */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('formatBlock', 'h2')}
                >
                  <Heading className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Título</TooltipContent>
            </Tooltip>

            {/* Lista ordenada */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('insertOrderedList')}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista numerada</TooltipContent>
            </Tooltip>

            {/* Lista */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('insertUnorderedList')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista</TooltipContent>
            </Tooltip>

            {/* Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const url = prompt('Digite a URL:');
                    if (url) applyFormat('createLink', url);
                  }}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>

            {/* Quote */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => applyFormat('formatBlock', 'blockquote')}
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Citação</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            {/* Usar campo (variáveis) */}
            <Popover open={showVariables} onOpenChange={setShowVariables}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium"
                >
                  <Braces className="w-3.5 h-3.5 mr-1.5" />
                  Usar campo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar variável..." />
                  <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
                  <CommandGroup heading="Variáveis disponíveis">
                    {VARIABLES.map((variable) => (
                      <CommandItem
                        key={variable.value}
                        onSelect={() => insertVariable(variable.value)}
                      >
                        <code className="text-xs font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                          {variable.value}
                        </code>
                        <span className="ml-2 text-sm text-neutral-600">
                          {variable.label}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </div>

        {/* Ações do card */}
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {/* Drag handle */}
            {showDragHandle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    {...attributes}
                    {...listeners}
                    className="p-1.5 hover:bg-neutral-200 rounded transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-4 h-4 text-neutral-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Arrastar</TooltipContent>
              </Tooltip>
            )}

            {/* Copiar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDuplicate}
                  className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-neutral-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Duplicar</TooltipContent>
            </Tooltip>

            {/* Deletar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Área de edição */}
      <div ref={editorRef}>
        <ContentEditableEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

