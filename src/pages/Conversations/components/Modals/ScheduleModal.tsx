import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  Send,
  AlertCircle,
  CheckCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../../../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useConversationsContext } from '../../context';
import { ScheduleMessageData } from '../../types';

export const ScheduleModal: React.FC = () => {
  const { 
    scheduleModalOpen, 
    setScheduleModalOpen,
    selectedConversation 
  } = useConversationsContext();

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ScheduleMessageData>({
    message: '',
    date: '',
    time: ''
  });

  const [isScheduling, setIsScheduling] = useState(false);

  // Obter data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];
  
  // Obter horário atual para validação
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Validações
  const isValidDate = formData.date && formData.date >= today;
  const isValidTime = formData.time && (formData.date > today || formData.time > currentTime);
  const isValidMessage = formData.message.trim().length > 0;
  const canSchedule = isValidDate && isValidTime && isValidMessage;

  const handleSchedule = async () => {
    if (!canSchedule || !selectedConversation) return;

    setIsScheduling(true);

    try {
      // Criar data no fuso horário local
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      
      console.log('📅 [SCHEDULE MODAL] Enviando mensagem agendada:', {
        conversationId: selectedConversation._id,
        message: formData.message,
        localTime: `${formData.date}T${formData.time}`,
        scheduledAtLocal: scheduledAt.toLocaleString('pt-BR'),
        scheduledAtUTC: scheduledAt.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: scheduledAt.getTimezoneOffset()
      });

      // Fazer requisição real para o backend (enviando como está - JavaScript já converte para UTC)
      const response = await apiService.sendMessage(selectedConversation._id, {
        content: formData.message,
        message_type: 'text',
        scheduled_at: scheduledAt.toISOString()
      });

      console.log('📅 [SCHEDULE MODAL] Resposta do backend:', response);

      if (response.success) {
        // Reset form
        setFormData({ message: '', date: '', time: '' });
        setScheduleModalOpen(false);
        
        alert('Mensagem agendada com sucesso!');
        
        // Invalidar cache para atualizar a lista
        queryClient.invalidateQueries({ 
          queryKey: ['scheduled-messages', selectedConversation._id] 
        });
      } else {
        throw new Error(response.message || 'Erro ao agendar mensagem');
      }
      
    } catch (error) {
      console.error('❌ [SCHEDULE MODAL] Erro ao agendar mensagem:', error);
      alert('Erro ao agendar mensagem. Tente novamente.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancel = () => {
    setFormData({ message: '', date: '', time: '' });
    setScheduleModalOpen(false);
  };

  // Sugestões de horário
  const timeSuggestions = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Templates de mensagem rápida
  const messageTemplates = [
    'Olá! Este é um lembrete sobre seu agendamento.',
    'Boa tarde! Gostaríamos de confirmar sua consulta.',
    'Lembrete: Sua consulta está marcada para hoje.',
    'Olá! Por favor, confirme sua presença na consulta.'
  ];

  return (
    <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendar Mensagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do destinatário */}
          {selectedConversation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedConversation.customer_name || selectedConversation.customer_phone}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.customer_phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem */}
          <div className="space-y-3">
            <Label htmlFor="message">Mensagem</Label>
            
            {/* Templates rápidos */}
            <div className="flex flex-wrap gap-2 mb-2">
              {messageTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, message: template }))}
                  className="text-xs"
                >
                  {template.substring(0, 20)}...
                </Button>
              ))}
            </div>

            <Textarea
              id="message"
              placeholder="Digite a mensagem que será enviada..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[100px]"
            />
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              {formData.message.length} caracteres
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
              {formData.date && !isValidDate && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Data deve ser hoje ou no futuro
                </div>
              )}
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
              
              {/* Sugestões de horário */}
              <div className="flex flex-wrap gap-1">
                {timeSuggestions.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, time }))}
                    className="text-xs px-2 py-1"
                  >
                    {time}
                  </Button>
                ))}
              </div>

              {formData.time && formData.date && !isValidTime && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Horário deve ser no futuro
                </div>
              )}
            </div>
          </div>

          {/* Preview do agendamento */}
          {canSchedule && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-2">
                    Preview do Agendamento
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>
                        {new Date(formData.date).toLocaleDateString('pt-BR')} às {formData.time}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200">
                      <p className="text-gray-900">{formData.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isScheduling}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSchedule}
              disabled={!canSchedule || isScheduling}
              className="flex items-center gap-2"
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Agendar Mensagem
                </>
              )}
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="mb-1">
              <strong>Importante:</strong> A mensagem será enviada automaticamente no horário agendado.
            </p>
            <p>
              Você pode cancelar mensagens agendadas na seção de mensagens programadas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
