import React from 'react';

const ActivityLogs: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Logs de Atividade</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página em Desenvolvimento</h2>
            <p className="text-gray-600 mb-4">
              A página de Logs de Atividade está sendo desenvolvida. Em breve você poderá consultar logs detalhados aqui.
            </p>
            <div className="text-sm text-gray-500">
              Funcionalidades planejadas:
              <ul className="mt-2 text-left inline-block">
                <li>• Logs de sistema</li>
                <li>• Atividades dos usuários</li>
                <li>• Histórico de mudanças</li>
                <li>• Filtros por data e tipo</li>
                <li>• Exportar logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;



