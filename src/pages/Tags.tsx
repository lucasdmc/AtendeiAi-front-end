import React from 'react';

const Tags: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Etiquetas</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página em Desenvolvimento</h2>
            <p className="text-gray-600 mb-4">
              A página de Etiquetas está sendo desenvolvida. Em breve você poderá configurar e gerenciar etiquetas da organização aqui.
            </p>
            <div className="text-sm text-gray-500">
              Funcionalidades planejadas:
              <ul className="mt-2 text-left inline-block">
                <li>• Criar e editar etiquetas</li>
                <li>• Organizar por categorias</li>
                <li>• Definir cores e ícones</li>
                <li>• Aplicar em conversas</li>
                <li>• Relatórios por etiqueta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tags;



