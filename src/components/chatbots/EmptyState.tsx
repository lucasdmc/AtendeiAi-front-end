import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative mb-6">
        <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center">
          <button
            onClick={onCreateClick}
            className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
            aria-label="Criar chatbot"
          >
            <Plus className="h-8 w-8" />
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full border-2 border-slate-200 bg-white" />
        <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 border-slate-200 bg-white" />
        <div className="absolute top-1/2 -right-4 h-3 w-3 rounded-full border-2 border-slate-200 bg-white" />
      </div>
      <p className="text-slate-600 font-medium">Crie seu primeiro chatbot!</p>
    </div>
  );
}

