import React from 'react';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export const handleError = (error: unknown): AppError => {
  console.error('Error handled:', error);
  
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'Erro inesperado. Tente novamente.',
    details: error,
    timestamp: new Date()
  };
};

export const showError = (error: AppError | unknown): void => {
  const appError = typeof error === 'object' && error !== null && 'code' in error 
    ? error as AppError 
    : handleError(error);
  
  console.error('Toast Error:', appError.message);
};

export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-center p-6">
      <h3 className="text-lg font-medium text-red-900 mb-2">
        Oops! Algo deu errado
      </h3>
      <p className="text-red-700 mb-4">
        Ocorreu um erro inesperado. Por favor, recarregue a página.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Recarregar Página
      </button>
      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-red-600 font-medium">
            Detalhes do erro
          </summary>
          <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);