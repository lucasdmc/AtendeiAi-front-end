import React from 'react';

const Contacts: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contatos</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página em Desenvolvimento</h2>
            <p className="text-gray-600 mb-4">
              A página de Contatos está sendo desenvolvida. Em breve você poderá gerenciar todos os seus contatos aqui.
            </p>
            <div className="text-sm text-gray-500">
              Funcionalidades planejadas:
              <ul className="mt-2 text-left inline-block">
                <li>• Listar todos os contatos</li>
                <li>• Criar e editar contatos</li>
                <li>• Organizar por grupos</li>
                <li>• Importar/exportar contatos</li>
                <li>• Histórico de conversas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;



