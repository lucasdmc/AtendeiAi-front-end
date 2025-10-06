import React from 'react';
import { EmojiCategory, getRecentEmojis } from './emojiData';

interface EmojiGridProps {
  categories: EmojiCategory[];
  searchQuery: string;
  onEmojiClick: (emoji: string) => void;
}

export const EmojiGrid: React.FC<EmojiGridProps> = ({
  categories,
  searchQuery,
  onEmojiClick
}) => {
  const recentEmojis = getRecentEmojis();

  // Filtrar emojis baseado na pesquisa
  const getFilteredEmojis = () => {
    if (!searchQuery.trim()) {
      return null; // Retorna null quando não há pesquisa para mostrar categorias normais
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: string[] = [];

    // Buscar em todas as categorias
    categories.forEach(category => {
      category.emojis.forEach(emoji => {
        if (filtered.length < 63) { // Máximo 9 linhas de 7 emojis
          // Aqui você pode implementar lógica mais sofisticada de busca
          // Por agora, vamos usar uma busca simples por nome da categoria
          if (category.name.toLowerCase().includes(query)) {
            filtered.push(emoji);
          }
        }
      });
    });

    return filtered;
  };

  const filteredEmojis = getFilteredEmojis();

  // Se há pesquisa, mostrar resultados filtrados
  if (filteredEmojis) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-3">
          Resultados da pesquisa
        </h3>
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-7 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`search-${emoji}-${index}`}
                onClick={() => onEmojiClick(emoji)}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors duration-150"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhum emoji encontrado</p>
          </div>
        )}
      </div>
    );
  }

  // Mostrar categorias normais
  return (
    <div className="p-4 space-y-6">
        {/* Seção Recentes */}
        {recentEmojis.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">Recentes</h3>
            <div className="grid grid-cols-7 gap-1">
              {recentEmojis.slice(0, 21).map((emoji, index) => (
                <button
                  key={`recent-${emoji}-${index}`}
                  onClick={() => onEmojiClick(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors duration-150"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categorias */}
        {categories.map((category) => (
          <div key={category.key} id={`category-${category.key}`}>
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              {category.name}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {category.emojis.map((emoji, index) => (
                <button
                  key={`${category.key}-${emoji}-${index}`}
                  onClick={() => onEmojiClick(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors duration-150"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
