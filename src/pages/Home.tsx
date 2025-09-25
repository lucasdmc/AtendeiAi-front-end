import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Página Inicial
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao sistema AtendeAI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Página Inicial
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Esta página será desenvolvida em breve com o dashboard principal e informações importantes do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

