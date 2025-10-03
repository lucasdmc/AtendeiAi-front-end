import { useState, useMemo } from 'react';
import { Search, Smile, Leaf, Coffee, Globe, Heart, Activity, Flag } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    label: 'Pessoas',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍',
      '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋',
      '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢',
      '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑',
      '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '😌',
    ]
  },
  {
    id: 'nature',
    label: 'Natureza',
    icon: Leaf,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
      '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
      '🌱', '🌿', '🍀', '🌾', '🌻', '🌺', '🌸', '🌼',
      '🌷', '🥀', '🌹', '🏵️', '💐', '🍄', '🌰', '🦀',
    ]
  },
  {
    id: 'food',
    label: 'Comida',
    icon: Coffee,
    emojis: [
      '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
      '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
      '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑',
      '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
      '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
    ]
  },
  {
    id: 'activities',
    label: 'Atividades',
    icon: Activity,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
      '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
      '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
      '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
      '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
    ]
  },
  {
    id: 'travel',
    label: 'Viagens',
    icon: Globe,
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
      '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽',
      '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔',
      '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋',
      '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇',
    ]
  },
  {
    id: 'objects',
    label: 'Objetos',
    icon: Heart,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️',
      '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷',
      '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟',
      '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️',
      '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌',
    ]
  },
  {
    id: 'symbols',
    label: 'Símbolos',
    icon: Flag,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓',
      '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️',
      '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
    ]
  },
];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  children: React.ReactNode;
}

export function EmojiPicker({ onChange, children }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');

  // Filtrar emojis por busca
  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return EMOJI_CATEGORIES;
    }

    return EMOJI_CATEGORIES.map(category => ({
      ...category,
      emojis: category.emojis.filter(() => {
        // Aqui você pode adicionar lógica mais sofisticada de busca
        // Por enquanto, mantemos todos os emojis quando há busca
        return true;
      })
    })).filter(category => category.emojis.length > 0);
  }, [search]);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex flex-col h-[400px]">
          {/* Header com título e busca */}
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm mb-2">Emojis</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Nome do emoji"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Tabs de categorias */}
          <div className="flex items-center gap-1 px-2 py-2 border-b overflow-x-auto">
            {EMOJI_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={() => setActiveCategory(category.id)}
                  title={category.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {/* Grid de emojis */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredCategories
              .filter(cat => search.trim() || cat.id === activeCategory)
              .map((category) => (
                <div key={category.id} className="mb-3">
                  {search.trim() && (
                    <h4 className="text-xs font-medium text-slate-500 mb-2 px-1">
                      {category.label}
                    </h4>
                  )}
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        className="h-8 w-8 flex items-center justify-center text-xl hover:bg-slate-100 rounded transition-colors"
                        onClick={() => handleEmojiSelect(emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

