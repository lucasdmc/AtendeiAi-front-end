import React from 'react';
import { Search } from 'lucide-react';

interface EmojiSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EmojiSearch: React.FC<EmojiSearchProps> = ({
  value,
  onChange,
  placeholder = "Pesquisar emoji"
}) => {
  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={16} 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          autoComplete="off"
        />
      </div>
    </div>
  );
};
