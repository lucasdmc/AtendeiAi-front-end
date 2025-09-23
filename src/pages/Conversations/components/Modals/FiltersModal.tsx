import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  Filter, 
  Search,
  Check,
  Calendar,
  Users,
  Bot,
  MessageCircle,
  Flag as FlagIcon,
  RotateCcw
} from 'lucide-react';
import { useConversationsContext } from '../../context';
import { hexToRgba } from '../../utils';

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  attendantType: string[];
  status: string[];
  flags: string[];
  unreadOnly: boolean;
  searchInMessages: string;
}

export const FiltersModal: React.FC = () => {
  const { 
    filterModalOpen, 
    setFilterModalOpen,
    flags,
    setActiveFilter
  } = useConversationsContext();

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    attendantType: [],
    status: [],
    flags: [],
    unreadOnly: false,
    searchInMessages: ''
  });

  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Opções de filtro
  const attendantTypes = [
    { id: 'manual', label: 'Atendimento Manual', icon: Users, color: '#3B82F6' },
    { id: 'bot', label: 'Atendimento IA', icon: Bot, color: '#E91E63' }
  ];

  const statusOptions = [
    { id: 'active', label: 'Ativa', color: '#10B981' },
    { id: 'archived', label: 'Arquivada', color: '#6B7280' },
    { id: 'closed', label: 'Fechada', color: '#EF4444' }
  ];

  // Handlers para filtros
  const handleAttendantTypeToggle = (typeId: string) => {
    setFilters(prev => ({
      ...prev,
      attendantType: prev.attendantType.includes(typeId)
        ? prev.attendantType.filter(id => id !== typeId)
        : [...prev.attendantType, typeId]
    }));
  };

  const handleStatusToggle = (statusId: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(statusId)
        ? prev.status.filter(id => id !== statusId)
        : [...prev.status, statusId]
    }));
  };

  const handleFlagToggle = (flagId: string) => {
    setFilters(prev => ({
      ...prev,
      flags: prev.flags.includes(flagId)
        ? prev.flags.filter(id => id !== flagId)
        : [...prev.flags, flagId]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      attendantType: [],
      status: [],
      flags: [],
      unreadOnly: false,
      searchInMessages: ''
    });
    setAppliedFiltersCount(0);
  };

  const handleApplyFilters = () => {
    // Contar filtros aplicados
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.attendantType.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.flags.length > 0) count++;
    if (filters.unreadOnly) count++;
    if (filters.searchInMessages.trim()) count++;

    setAppliedFiltersCount(count);

    // Aplicar filtros (aqui seria integrado com o sistema de filtros real)
    console.log('Aplicando filtros:', filters);
    
    // Se há flags selecionadas, mudar para o filtro de flags personalizadas
    if (filters.flags.length > 0) {
      setActiveFilter('Flags Personalizadas');
    }

    setFilterModalOpen(false);
  };

  const handleCancel = () => {
    setFilterModalOpen(false);
  };

  // Obter data atual para validação
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {appliedFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {appliedFiltersCount} aplicado{appliedFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Período */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                Período
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date-start" className="text-sm">Data inicial</Label>
                  <Input
                    id="date-start"
                    type="date"
                    max={today}
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-end" className="text-sm">Data final</Label>
                  <Input
                    id="date-end"
                    type="date"
                    max={today}
                    min={filters.dateRange.start}
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Atendimento */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4" />
                Tipo de Atendimento
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {attendantTypes.map((type) => {
                  const isSelected = filters.attendantType.includes(type.id);
                  const Icon = type.icon;
                  
                  return (
                    <Button
                      key={type.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAttendantTypeToggle(type.id)}
                      className="flex items-center gap-2"
                      style={isSelected ? { backgroundColor: type.color } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                      {isSelected && <Check className="h-3 w-3" />}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Status da Conversa */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <MessageCircle className="h-4 w-4" />
                Status da Conversa
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                  const isSelected = filters.status.includes(status.id);
                  
                  return (
                    <Button
                      key={status.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusToggle(status.id)}
                      className="flex items-center gap-2"
                      style={isSelected ? { backgroundColor: status.color } : {}}
                    >
                      {status.label}
                      {isSelected && <Check className="h-3 w-3" />}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Flags Personalizadas */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <FlagIcon className="h-4 w-4" />
                Flags Personalizadas
              </Label>
              
              {flags.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma flag personalizada criada ainda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {flags.map((flag) => {
                    const isSelected = filters.flags.includes(flag.id);
                    
                    return (
                      <Button
                        key={flag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlagToggle(flag.id)}
                        className={`flex items-center gap-2 ${
                          isSelected ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{
                          backgroundColor: isSelected 
                            ? hexToRgba(flag.color, 0.3)
                            : hexToRgba(flag.color, 0.1),
                          borderColor: flag.color,
                          color: flag.color
                        }}
                      >
                        <FlagIcon className="h-3 w-3" />
                        {flag.name}
                        {isSelected && <Check className="h-3 w-3" />}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mensagens não lidas */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-medium">
                <MessageCircle className="h-4 w-4" />
                Mensagens
              </Label>
              
              <div className="flex items-center gap-3">
                <Button
                  variant={filters.unreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, unreadOnly: !prev.unreadOnly }))}
                  className="flex items-center gap-2"
                >
                  Apenas não lidas
                  {filters.unreadOnly && <Check className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Busca em mensagens */}
            <div className="space-y-3">
              <Label htmlFor="search-messages" className="flex items-center gap-2 font-medium">
                <Search className="h-4 w-4" />
                Buscar em Mensagens
              </Label>
              
              <Input
                id="search-messages"
                placeholder="Buscar texto específico nas mensagens..."
                value={filters.searchInMessages}
                onChange={(e) => setFilters(prev => ({ ...prev, searchInMessages: e.target.value }))}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar Filtros
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>

        {/* Resumo dos filtros ativos */}
        {appliedFiltersCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{appliedFiltersCount} filtro{appliedFiltersCount > 1 ? 's' : ''} ativo{appliedFiltersCount > 1 ? 's' : ''}:</strong>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.attendantType.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Atendimento: {filters.attendantType.length}
                </Badge>
              )}
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status.length}
                </Badge>
              )}
              {filters.flags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Flags: {filters.flags.length}
                </Badge>
              )}
              {filters.unreadOnly && (
                <Badge variant="secondary" className="text-xs">
                  Não lidas
                </Badge>
              )}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <Badge variant="secondary" className="text-xs">
                  Período
                </Badge>
              )}
              {filters.searchInMessages.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Busca em mensagens
                </Badge>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
