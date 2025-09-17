import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Flag {
  id: string;
  name: string;
  color: string;
}

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  flags: Flag[];
  initialDate?: Date;
}

const AgendamentoModal: React.FC<AgendamentoModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  flags,
  initialDate
}) => {
  const [formData, setFormData] = useState({
    paciente_nome: '',
    data: initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    horario_inicio: '',
    horario_fim: '',
    flag_id: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'agendado'
    });
    
    // Reset form
    setFormData({
      paciente_nome: '',
      data: new Date().toISOString().split('T')[0],
      horario_inicio: '',
      horario_fim: '',
      flag_id: '',
      observacoes: ''
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha as informações do agendamento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Nome do Paciente *</Label>
              <Input
                id="paciente"
                value={formData.paciente_nome}
                onChange={(e) => handleInputChange('paciente_nome', e.target.value)}
                placeholder="Digite o nome do paciente"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inicio">Horário de Início *</Label>
              <Input
                id="inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => handleInputChange('horario_inicio', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fim">Horário de Fim *</Label>
              <Input
                id="fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => handleInputChange('horario_fim', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Agendamento *</Label>
            <Select value={formData.flag_id} onValueChange={(value) => handleInputChange('flag_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {flags.map((flag) => (
                  <SelectItem key={flag.id} value={flag.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: flag.color }}
                      />
                      <span>{flag.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Criar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgendamentoModal;