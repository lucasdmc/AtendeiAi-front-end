// Componente de nó customizado para React Flow
import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Hand, Calendar, Clock, GitBranch, GitMerge,
  MessageSquare, FileText, Building, Tag, User, Bot, Lock, List,
  Keyboard, FileCode, Zap, Star, Database, Timer, CheckCircle,
  StickyNote, Code, AlertCircle, Copy, Trash2, Pencil, HelpCircle,
} from 'lucide-react';
import { BLOCK_DEFINITIONS } from '@/lib/blockDefinitions';
import { NodeType } from '@/types/flow';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ICON_MAP: Record<string, any> = {
  MessageCircle, Hand, Calendar, Clock, GitBranch, GitMerge,
  MessageSquare, FileText, Building, Tag, User, Bot, Lock, List,
  Keyboard, FileCode, Zap, Star, Database, Timer, CheckCircle,
  StickyNote, Code, HelpCircle,
};

interface FlowNodeProps extends NodeProps {
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    error?: boolean;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
  };
}

export const FlowNode = memo(({ id, type, data, selected }: FlowNodeProps) => {
  const blockDef = useMemo(
    () => BLOCK_DEFINITIONS.find((b) => b.type === type),
    [type]
  );

  if (!blockDef) return null;

  const Icon = ICON_MAP[blockDef.icon];
  const hasInput = blockDef.hasInput;
  const outputCount = typeof blockDef.outputs === 'number' ? blockDef.outputs : 1;

  return (
    <div
      className={`
        relative bg-white rounded-2xl shadow-sm border-2 px-4 py-3 min-w-[220px] max-w-[280px]
        transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-slate-200'}
        ${data.error ? '!border-red-500' : ''}
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      {/* Input Handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
        />
      )}

      {/* Badge de categoria */}
      <Badge
        variant="secondary"
        className="absolute -top-2.5 left-3 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200"
      >
        {blockDef.badge}
      </Badge>

      {/* Botões de ação (hover) */}
      <div className="absolute -top-2.5 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDuplicate?.();
                }}
                className="p-1 bg-white rounded border border-slate-200 hover:bg-slate-50"
              >
                <Copy className="w-3 h-3 text-slate-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Duplicar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onEdit?.();
                }}
                className="p-1 bg-white rounded border border-slate-200 hover:bg-slate-50"
              >
                <Pencil className="w-3 h-3 text-slate-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete?.();
                }}
                className="p-1 bg-white rounded border border-slate-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Ícone de erro */}
      {data.error && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-2.5 right-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Complete a configuração</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Conteúdo */}
      <div className="flex items-start gap-3 mt-2">
        {/* Ícone */}
        <div
          className="flex-shrink-0 p-2 rounded-lg"
          style={{ backgroundColor: `${blockDef.color}15` }}
        >
          {Icon && <Icon className="w-5 h-5" style={{ color: blockDef.color }} />}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
            {data.label || blockDef.title}
          </h4>
          {data.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Output Handles */}
      {outputCount > 0 && (
        <>
          {Array.from({ length: outputCount }).map((_, idx) => (
            <Handle
              key={idx}
              type="source"
              position={Position.Bottom}
              id={`output-${idx}`}
              className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
              style={{
                left: outputCount === 1 
                  ? '50%' 
                  : `${((idx + 1) / (outputCount + 1)) * 100}%`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
});

FlowNode.displayName = 'FlowNode';

