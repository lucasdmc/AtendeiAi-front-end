import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Loading para lista de conversas
export const ConversationsLoading: React.FC = () => (
  <div className="p-4 text-center">
    <LoadingSpinner text="Carregando conversas..." />
  </div>
);

// Loading para mensagens
export const MessagesLoading: React.FC = () => (
  <div className="flex items-center justify-center h-32">
    <LoadingSpinner text="Carregando mensagens..." />
  </div>
);

// Loading para templates
export const TemplatesLoading: React.FC = () => (
  <div className="flex items-center justify-center h-32">
    <LoadingSpinner text="Carregando templates..." />
  </div>
);

// Loading para arquivos
export const FilesLoading: React.FC = () => (
  <div className="flex items-center justify-center h-32">
    <LoadingSpinner text="Carregando arquivos..." />
  </div>
);

// Loading inline para botões
export const ButtonLoading: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    {text}
  </div>
);

// Loading para cards
export const CardLoading: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-3 p-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Loading skeleton para lista
export const ListLoading: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <CardLoading key={index} />
    ))}
  </div>
);

// Loading para página inteira
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Carregando página...' }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

// Loading overlay
export const LoadingOverlay: React.FC<{ 
  isVisible: boolean; 
  text?: string;
  children: React.ReactNode;
}> = ({ isVisible, text = 'Carregando...', children }) => (
  <div className="relative">
    {children}
    {isVisible && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <LoadingSpinner text={text} />
      </div>
    )}
  </div>
);

// Estados vazios (não loading, mas relacionados)
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center h-32 text-center p-6">
    {icon && (
      <div className="w-12 h-12 mb-4 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-600 mb-4">{description}</p>
    )}
    {action}
  </div>
);

// Hook para gerenciar loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const withLoading = async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    try {
      const result = await operation();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    withLoading
  };
};
