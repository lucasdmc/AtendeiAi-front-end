// Painel de biblioteca de blocos
import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BLOCKS_BY_CATEGORY, CATEGORY_LABELS } from '@/lib/blockDefinitions';
import { BlockDefinition } from '@/types/flow';
import * as Icons from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  ...Icons,
};

interface BlockLibraryPanelProps {
  onClose: () => void;
  onBlockClick: (block: BlockDefinition, position?: { x: number; y: number }) => void;
}

export function BlockLibraryPanel({ onClose, onBlockClick }: BlockLibraryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlocks = useMemo(() => {
    if (!searchTerm) return BLOCKS_BY_CATEGORY;

    const term = searchTerm.toLowerCase();
    return {
      start: BLOCKS_BY_CATEGORY.start.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
      condition: BLOCKS_BY_CATEGORY.condition.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
      action: BLOCKS_BY_CATEGORY.action.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
      end: BLOCKS_BY_CATEGORY.end.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
      util: BLOCKS_BY_CATEGORY.util.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
      integration: BLOCKS_BY_CATEGORY.integration.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term)
      ),
    };
  }, [searchTerm]);

  return (
    <Card className="fixed left-4 top-20 w-[420px] max-h-[calc(100vh-120px)] overflow-hidden flex flex-col shadow-xl border-slate-200 z-50">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-900">
            👋 Clique ou arraste
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar passo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {(Object.keys(filteredBlocks) as Array<keyof typeof filteredBlocks>).map((category) => {
          const blocks = filteredBlocks[category];
          if (blocks.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-slate-300" />
                {CATEGORY_LABELS[category]}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {blocks.map((block) => {
                  const Icon = ICON_MAP[block.icon];
                  
                  return (
                    <div
                      key={block.type}
                      onClick={() => onBlockClick(block)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow', JSON.stringify(block));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className="
                        group relative p-3 rounded-xl border border-slate-200 bg-white
                        hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5
                        transition-all duration-200 cursor-grab active:cursor-grabbing
                      "
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="flex-shrink-0 p-1.5 rounded-lg"
                          style={{ backgroundColor: `${block.color}15` }}
                        >
                          {Icon && <Icon className="w-4 h-4" style={{ color: block.color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {block.title}
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {block.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

