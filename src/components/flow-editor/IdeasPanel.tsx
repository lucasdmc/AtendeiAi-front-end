// Painel de ideias/templates
import { useState } from 'react';
import { X, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FLOW_TEMPLATES } from '@/lib/blockDefinitions';
import { TemplateFlow } from '@/types/flow';

interface IdeasPanelProps {
  onClose: () => void;
  onTemplateClick: (template: TemplateFlow) => void;
}

export function IdeasPanel({ onClose, onTemplateClick }: IdeasPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = FLOW_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="fixed left-4 top-20 w-[420px] max-h-[calc(100vh-120px)] overflow-hidden flex flex-col shadow-xl border-slate-200 z-50">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-900">
            👉 Clique para usar uma ideia
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
            placeholder="Pesquisar ideia"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            AVALIAÇÕES
          </h4>

          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onTemplateClick(template)}
                className="
                  group p-3 rounded-xl border border-slate-200 bg-white
                  hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5
                  transition-all duration-200 cursor-pointer
                "
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 p-1.5 rounded-lg bg-amber-100">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-slate-900">
                      {template.title}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Nenhuma ideia encontrada</p>
          </div>
        )}
      </div>
    </Card>
  );
}

