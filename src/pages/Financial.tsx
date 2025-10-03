import React from 'react';

const Financial: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Financeiro</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página em Desenvolvimento</h2>
            <p className="text-gray-600 mb-4">
              A página Financeiro está sendo desenvolvida. Em breve você poderá gerenciar todas as informações de pagamento aqui.
            </p>
            <div className="text-sm text-gray-500">
              Funcionalidades planejadas:
              <ul className="mt-2 text-left inline-block">
                <li>• Histórico de pagamentos</li>
                <li>• Cartões registrados</li>
                <li>• Faturas e recibos</li>
                <li>• Planos e assinaturas</li>
                <li>• Relatórios financeiros</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;



