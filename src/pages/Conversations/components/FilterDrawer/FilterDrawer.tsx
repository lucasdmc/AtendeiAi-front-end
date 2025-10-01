import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface FilterColumnProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterColumn: React.FC<FilterColumnProps> = ({ isOpen, onClose }) => {
  const [filters, setFilters] = useState({
    setor: 'Todos',
    etiqueta: 'Todos',
    atendente: 'Todos',
    canal: 'Todos',
    data: 'Todos'
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearAll = () => {
    setFilters({
      setor: 'Todos',
      etiqueta: 'Todos',
      atendente: 'Todos',
      canal: 'Todos',
      data: 'Todos'
    });
  };

  const handleSaveShortcut = () => {
    // TODO: Implementar salvamento de atalho
    console.log('Salvar atalho:', filters);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col animate-in slide-in-from-left-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-gray-600 hover:text-gray-800"
          >
            Limpar tudo
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Setor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setor
          </label>
          <select
            value={filters.setor}
            onChange={(e) => handleFilterChange('setor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Todos">Todos</option>
            <option value="Comercial">Comercial</option>
            <option value="Suporte">Suporte</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Atendimento">Atendimento</option>
          </select>
        </div>

        {/* Etiqueta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiqueta
          </label>
          <select
            value={filters.etiqueta}
            onChange={(e) => handleFilterChange('etiqueta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Todos">Todos</option>
            <option value="Urgente">Urgente</option>
            <option value="VIP">VIP</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Reclamação">Reclamação</option>
            <option value="Vendido">Vendido</option>
          </select>
        </div>

        {/* Atendente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atendente
          </label>
          <select
            value={filters.atendente}
            onChange={(e) => handleFilterChange('atendente', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Todos">Todos</option>
            <option value="Paulo">Paulo</option>
            <option value="Ana">Ana</option>
            <option value="Carlos">Carlos</option>
            <option value="Maria">Maria</option>
            <option value="Bot">Bot</option>
          </select>
        </div>

        {/* Canal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canal
          </label>
          <select
            value={filters.canal}
            onChange={(e) => handleFilterChange('canal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Todos">Todos</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Telegram">Telegram</option>
            <option value="E-mail">E-mail</option>
          </select>
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <div className="relative">
            <select
              value={filters.data}
              onChange={(e) => handleFilterChange('data', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="Todos">Todos</option>
              <option value="Hoje">Hoje</option>
              <option value="Ontem">Ontem</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Personalizado">Personalizado</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Salvar Atalho */}
        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={handleSaveShortcut}
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Salvar Atalho
          </Button>
        </div>

        {/* Atalhos Salvos */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Atalhos salvos
          </h3>
          <div className="text-sm text-gray-500 text-center py-4">
            Nenhum atalho salvo
          </div>
        </div>
      </div>
    </div>
  );
};
