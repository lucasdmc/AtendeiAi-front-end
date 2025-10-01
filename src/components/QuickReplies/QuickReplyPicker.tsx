import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Star,
  TrendingUp,
  Globe,
  User,
  Tag,
  ArrowRight,
  Zap,
  AtSign,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuickRepliesPicker, useTrackUsage } from '@/hooks';
import {
  QuickReplyPickerItem,
  PickerFilters,
  AVAILABLE_PLACEHOLDERS,
} from '@/types/quickReplies';

interface QuickReplyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string, quickReplyId?: string) => void;
  trigger?: React.ReactNode;
  initialQuery?: string;
  placeholder?: string;
  maxHeight?: number;
}

interface ContactInfo {
  name?: string;
  phone?: string;
}

interface ClinicInfo {
  name?: string;
}

interface UserInfo {
  name?: string;
}

interface PlaceholderContext {
  contact?: ContactInfo;
  clinic?: ClinicInfo;
  user?: UserInfo;
}

const QuickReplyPicker: React.FC<QuickReplyPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  trigger,
  initialQuery = '',
  placeholder = 'Buscar respostas rápidas...',
  maxHeight = 400,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hook para buscar respostas
  const filters: PickerFilters = useMemo(() => ({
    query: query || undefined,
    category_id: categoryFilter || undefined,
  }), [query, categoryFilter]);

  const { data: quickRepliesData, isLoading } = useQuickRepliesPicker(filters);
  const trackUsage = useTrackUsage();

  const quickReplies = quickRepliesData?.data || [];

  // Resetar seleção quando a lista mudar
  useEffect(() => {
    setSelectedIndex(0);
  }, [quickReplies]);

  // Focar input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Atualizar query inicial
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, quickReplies.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (quickReplies[selectedIndex]) {
          handleSelect(quickReplies[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Scroll para item selecionado
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  // Processar placeholders (simulação - em produção viria do contexto)
  const processPlaceholders = (content: string, context?: PlaceholderContext): string => {
    let processedContent = content;
    
    // Simular dados do contexto (em produção, estes dados viriam das props ou contexto)
    const mockContext: PlaceholderContext = {
      contact: { name: 'João Silva', phone: '+55 11 99999-9999' },
      clinic: { name: 'Clínica Exemplo' },
      user: { name: 'Dr. Maria Santos' },
      ...context,
    };

    const now = new Date();
    const replacements: Record<string, string> = {
      '@nome': mockContext.contact?.name || 'Cliente',
      '@telefone': mockContext.contact?.phone || '+55 11 99999-9999',
      '@data': now.toLocaleDateString('pt-BR'),
      '@hora': now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      '@clinica': mockContext.clinic?.name || 'Nossa Clínica',
      '@atendente': mockContext.user?.name || 'Atendente',
    };

    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, replacement);
    });

    return processedContent;
  };

  // Selecionar resposta rápida
  const handleSelect = async (quickReply: QuickReplyPickerItem) => {
    const processedContent = processPlaceholders(quickReply.content);
    
    // Registrar uso
    try {
      await trackUsage.mutateAsync(quickReply._id);
    } catch (error) {
      // Erro silencioso - não impedir o uso
      console.warn('Erro ao registrar uso da resposta rápida:', error);
    }
    
    onSelect(processedContent, quickReply._id);
    onClose();
  };

  // Obter categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    quickReplies.forEach(qr => {
      if (qr.category) {
        uniqueCategories.set(qr.category.name, qr.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [quickReplies]);

  // Agrupar por categoria
  const groupedQuickReplies = useMemo(() => {
    const groups: Record<string, QuickReplyPickerItem[]> = {};
    
    quickReplies.forEach(qr => {
      const categoryName = qr.category?.name || 'Sem categoria';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(qr);
    });

    return groups;
  }, [quickReplies]);

  // Renderizar item da lista
  const renderQuickReplyItem = (quickReply: QuickReplyPickerItem, index: number) => {
    const isSelected = index === selectedIndex;
    const hasPlaceholders = AVAILABLE_PLACEHOLDERS.some(p => 
      quickReply.content.includes(p.key)
    );

    return (
      <div
        key={quickReply._id}
        className={`p-3 cursor-pointer border-l-2 transition-colors ${
          isSelected 
            ? 'bg-blue-50 border-l-blue-500' 
            : 'hover:bg-gray-50 border-l-transparent'
        }`}
        onClick={() => handleSelect(quickReply)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {quickReply.title}
              </h4>
              {quickReply.is_favorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
              )}
              {hasPlaceholders && (
                <AtSign className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {quickReply.content.length > 100 
                ? `${quickReply.content.substring(0, 100)}...`
                : quickReply.content
              }
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {quickReply.category && (
                <div className="flex items-center gap-1">
                  {quickReply.category.icon && (
                    <span>{quickReply.category.icon}</span>
                  )}
                  <span>{quickReply.category.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{quickReply.usage_count}</span>
              </div>
            </div>
          </div>
          
          <ArrowRight className={`h-4 w-4 text-gray-400 transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      </div>
    );
  };

  const content = (
    <div className="w-96" style={{ maxHeight }}>
      {/* Header com busca */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-gray-900">Respostas Rápidas</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filtro por categoria */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 mt-2 overflow-x-auto">
            <Button
              variant={categoryFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('')}
              className="flex-shrink-0"
            >
              Todas
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={categoryFilter === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category.name)}
                className="flex-shrink-0"
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de respostas */}
      <ScrollArea className="flex-1">
        <div ref={listRef}>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Carregando...</p>
            </div>
          ) : quickReplies.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {query ? 'Nenhuma resposta encontrada' : 'Nenhuma resposta disponível'}
              </p>
              {query && (
                <p className="text-xs text-gray-500">
                  Tente ajustar sua busca ou criar uma nova resposta
                </p>
              )}
            </div>
          ) : (
            <div>
              {Object.entries(groupedQuickReplies).map(([categoryName, items], groupIndex) => (
                <div key={categoryName}>
                  {Object.keys(groupedQuickReplies).length > 1 && (
                    <div className="px-3 py-2 bg-gray-50 border-b">
                      <span className="text-xs font-medium text-gray-700">
                        {categoryName}
                      </span>
                    </div>
                  )}
                  {items.map((quickReply, itemIndex) => {
                    const globalIndex = quickReplies.findIndex(qr => qr._id === quickReply._id);
                    return renderQuickReplyItem(quickReply, globalIndex);
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer com dicas */}
      {quickReplies.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>Enter Selecionar</span>
              <span>Esc Fechar</span>
            </div>
            <div className="flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              <span>Placeholders disponíveis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (trigger) {
    return (
      <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <PopoverTrigger asChild>
          {trigger}
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-auto" 
          align="start"
          onKeyDown={handleKeyDown}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  // Renderização como modal/overlay (para uso com comando /)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={onClose}
      />
      <div 
        className="relative bg-white rounded-lg shadow-lg border max-w-md w-full mx-4"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {content}
      </div>
    </div>
  );
};

export default QuickReplyPicker;


