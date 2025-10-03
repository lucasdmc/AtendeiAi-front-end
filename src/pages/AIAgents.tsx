import React from 'react';

const AIAgents: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Agentes de IA</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página em Desenvolvimento</h2>
            <p className="text-gray-600 mb-4">
              A página de Agentes de IA está sendo desenvolvida. Em breve você poderá configurar e gerenciar agentes inteligentes aqui.
            </p>
            <div className="text-sm text-gray-500">
              Funcionalidades planejadas:
              <ul className="mt-2 text-left inline-block">
                <li>• Criar agentes de IA especializados</li>
                <li>• Configurar personalidades</li>
                <li>• Treinar com dados específicos</li>
                <li>• Monitorar conversas</li>
                <li>• Análise de performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgents;



