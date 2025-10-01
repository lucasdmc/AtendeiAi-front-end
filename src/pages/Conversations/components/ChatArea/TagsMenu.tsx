import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { 
  Tag, 
  Search, 
  User, 
  MessageCircle, 
  X 
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
  type: 'contact' | 'conversation';
}

interface TagsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
  onCreateTag: (name: string, color: string, type: 'contact' | 'conversation') => void;
}

const PREDEFINED_COLORS = [
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

const SAMPLE_TAGS: Tag[] = [
  { id: '1', name: 'Vendido', color: '#10B981', type: 'conversation' },
  { id: '2', name: 'Recusado', color: '#EF4444', type: 'conversation' },
  { id: '3', name: 'Pendente', color: '#F59E0B', type: 'conversation' },
  { id: '4', name: 'VIP', color: '#8B5CF6', type: 'contact' },
  { id: '5', name: 'Urgente', color: '#EF4444', type: 'contact' },
];

export const TagsMenu: React.FC<TagsMenuProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onTagToggle,
  onCreateTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'contact' | 'conversation'>('contact');
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PREDEFINED_COLORS[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const filteredTags = SAMPLE_TAGS.filter(tag => 
    tag.type === activeTab && 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), newTagColor, activeTab);
      setNewTagName('');
      setIsCreating(false);
    }
  };

  const isTagSelected = (tag: Tag) => {
    return selectedTags.some(selected => selected.id === tag.id);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Etiquetas</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="text-blue-600 hover:text-blue-700"
          >
            Criar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'contact'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contact')}
        >
          <User className="h-4 w-4" />
          Contato ({SAMPLE_TAGS.filter(t => t.type === 'contact').length})
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'conversation'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('conversation')}
        >
          <MessageCircle className="h-4 w-4" />
          Conversa ({SAMPLE_TAGS.filter(t => t.type === 'conversation').length})
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Create Tag Form */}
      {isCreating && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Nome da etiqueta"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="h-9"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cor:</span>
              <div className="flex gap-1">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newTagColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                Criar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="max-h-60 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhuma etiqueta encontrada
          </div>
        ) : (
          <div className="p-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => onTagToggle(tag)}
              >
                <input
                  type="checkbox"
                  checked={isTagSelected(tag)}
                  onChange={() => onTagToggle(tag)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <Badge
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: `${tag.color}40`
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
