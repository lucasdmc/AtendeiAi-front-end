// Painel de biblioteca de blocos
import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BLOCKS_BY_CATEGORY, CATEGORY_LABELS } from '@/lib/blockDefinitions';
import { BlockDefinition } from '@/types/flow';
import { ActionCard } from '@/components/action-cards/ActionCard';
import * as Icons from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  ...Icons,
};

// Mapeia cores dos blocos para cores do ActionCard
const getIconColor = (blockColor: string): 'green' | 'orange' | 'blue' | 'violet' | 'gray' | 'red' | 'pink' | 'cyan' | 'amber' | 'purple' => {
  // Mapeamento baseado nas cores hex definidas nos blocos
  if (blockColor.includes('10B981')) return 'green';     // emerald
  if (blockColor.includes('F59E0B')) return 'amber';     // amber
  if (blockColor.includes('EF4444')) return 'red';       // red
  if (blockColor.includes('8B5CF6')) return 'purple';    // purple
  if (blockColor.includes('EC4899')) return 'pink';      // pink
  if (blockColor.includes('06B6D4')) return 'cyan';      // cyan
  if (blockColor.includes('64748B')) return 'gray';      // gray
  if (blockColor.includes('3B82F6')) return 'blue';      // blue
  return 'blue'; // default
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
      ask: BLOCKS_BY_CATEGORY.ask.filter(
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
    <Card className="fixed left-[76px] top-[106px] bottom-[10px] w-[588px] overflow-hidden flex flex-col shadow-xl border-slate-200 z-50">
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

              {/* Cards padronizados usando ActionCard */}
              <div className="grid gap-3 grid-cols-2">
                {blocks.map((block) => {
                  const Icon = ICON_MAP[block.icon];
                  
                  return (
                    <ActionCard
                      key={block.type}
                      icon={Icon}
                      iconColor={getIconColor(block.color)}
                      title={block.title}
                      description={block.description}
                      as="div"
                      draggable
                      onClick={() => onBlockClick(block)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow', JSON.stringify(block));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className="w-full"
                      data-test={`action-card-${block.type}`}
                    />
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

