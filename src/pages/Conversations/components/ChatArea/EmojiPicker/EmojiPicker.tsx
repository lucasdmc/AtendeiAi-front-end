import React, { useState, useEffect, useRef } from 'react';
import { EmojiSearch } from './EmojiSearch';
import { EmojiCategory } from './EmojiCategory';
import { EmojiGrid } from './EmojiGrid';
import { emojiCategories, addRecentEmoji } from './emojiData';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  anchorRef
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileysAndPeople');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calcular posição do picker
  const getPickerPosition = () => {
    if (!anchorRef.current) return {};

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const pickerHeight = 420;
    const pickerWidth = 350;
    
    // Verificar se há espaço acima
    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    
    let top: number;
    let bottom: number | undefined;
    
    if (spaceAbove >= pickerHeight + 10) {
      // Mostrar acima
      bottom = window.innerHeight - anchorRect.top + 5;
    } else {
      // Mostrar abaixo
      top = anchorRect.bottom + 5;
    }

    // Posição horizontal (centralizar com o botão)
    let left = anchorRect.left + (anchorRect.width / 2) - (pickerWidth / 2);
    
    // Ajustar se sair da tela
    if (left < 10) left = 10;
    if (left + pickerWidth > window.innerWidth - 10) {
      left = window.innerWidth - pickerWidth - 10;
    }

    return {
      position: 'fixed' as const,
      top: top!,
      bottom,
      left,
      width: pickerWidth,
      height: pickerHeight,
      zIndex: 1000
    };
  };

  const handleEmojiClick = (emoji: string) => {
    addRecentEmoji(emoji);
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      style={getPickerPosition()}
      className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
    >
      {/* Header com categorias */}
      <EmojiCategory
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Barra de pesquisa */}
      <EmojiSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Pesquisar emoji"
      />

      {/* Grid de emojis */}
      <div className="emoji-grid-container flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <EmojiGrid
          categories={emojiCategories}
          searchQuery={searchQuery}
          onEmojiClick={handleEmojiClick}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
    </div>
  );
};
