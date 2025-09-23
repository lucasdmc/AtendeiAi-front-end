import React from 'react';
import { categoryIcons, getRecentEmojis } from './emojiData';

interface EmojiCategoryProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const EmojiCategory: React.FC<EmojiCategoryProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  const recentEmojis = getRecentEmojis();

  const scrollToCategory = (categoryKey: string) => {
    onCategoryChange(categoryKey);
    
    // Scroll para a seção correspondente
    const container = document.querySelector('.emoji-grid-container');
    if (!container) return;

    if (categoryKey === 'recent') {
      // Scroll para o topo
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`category-${categoryKey}`);
      if (element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
        
        container.scrollTo({ 
          top: relativeTop - 10, // 10px de margem
          behavior: 'smooth' 
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {/* Categoria Recentes - só mostra se há emojis recentes */}
        {recentEmojis.length > 0 && (
          <button
            onClick={() => scrollToCategory('recent')}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-colors duration-150 ${
              activeCategory === 'recent'
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Recentes"
          >
            🕒
          </button>
        )}

        {/* Outras categorias */}
        {categoryIcons.slice(1).map((category) => (
          <button
            key={category.key}
            onClick={() => scrollToCategory(category.key)}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-colors duration-150 ${
              activeCategory === category.key
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={category.name}
          >
            {category.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
