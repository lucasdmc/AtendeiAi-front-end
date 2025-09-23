import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  Clock, 
  X, 
  Edit3, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ScheduledMessage, useCancelScheduledMessage } from '../../../../hooks/useScheduledMessages';
import { formatTime, formatDate } from '../../utils';

interface ScheduledMessageItemProps {
  message: ScheduledMessage;
  onEdit?: (message: ScheduledMessage) => void;
}

export const ScheduledMessageItem: React.FC<ScheduledMessageItemProps> = ({
  message,
  onEdit
}) => {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const { mutate: cancelMessage, isPending: isCancelling } = useCancelScheduledMessage();

  const scheduledDate = new Date(message.scheduled_at);
  const now = new Date();
  const isOverdue = scheduledDate < now && message.status === 'pending';

  // Renderizar ícone de status
  const renderStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return isOverdue ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Clock className="h-4 w-4 text-orange-500" />
        );
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Renderizar texto de status
  const renderStatusText = () => {
    switch (message.status) {
      case 'pending':
        return isOverdue ? (
          <span className="text-red-600 font-medium">Atrasada</span>
        ) : (
          <span className="text-orange-600 font-medium">Agendada</span>
        );
      case 'sent':
        return <span className="text-green-600 font-medium">Enviada</span>;
      case 'cancelled':
        return <span className="text-gray-600 font-medium">Cancelada</span>;
      case 'failed':
        return <span className="text-red-600 font-medium">Falhou</span>;
      default:
        return <span className="text-gray-600 font-medium">Desconhecido</span>;
    }
  };

  // Cor do bubble baseada no status
  const getBubbleColor = () => {
    switch (message.status) {
      case 'pending':
        return isOverdue 
          ? 'bg-red-50 border-red-200' 
          : 'bg-orange-50 border-orange-200';
      case 'sent':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleCancel = () => {
    if (showConfirmCancel) {
      cancelMessage(message._id);
      setShowConfirmCancel(false);
    } else {
      setShowConfirmCancel(true);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
  };

  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%] group relative">
        {/* Bubble da mensagem agendada */}
        <div className={`rounded-lg shadow-sm border-2 ${getBubbleColor()} p-4`}>
          {/* Header com status e ações */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {renderStatusIcon()}
              {renderStatusText()}
            </div>
            
            {/* Ações (só para mensagens pendentes) */}
            {message.status === 'pending' && (
              <div className="flex items-center gap-1">
                {/* Botão Editar */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                  title="Editar mensagem"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>

                {/* Botão Cancelar */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className={`h-6 w-6 p-0 transition-colors ${
                    showConfirmCancel 
                      ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                  title={showConfirmCancel ? 'Confirmar cancelamento' : 'Cancelar mensagem'}
                >
                  {isCancelling ? (
                    <div className="h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Data e hora de agendamento */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(scheduledDate)} às {formatTime(scheduledDate)}
            </span>
          </div>

          {/* Conteúdo da mensagem */}
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Informações adicionais para status não-pending */}
          {message.status !== 'pending' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {message.status === 'sent' && message.sent_at && (
                  <span>Enviada em {formatDate(new Date(message.sent_at))} às {formatTime(new Date(message.sent_at))}</span>
                )}
                {message.status === 'cancelled' && message.cancelled_at && (
                  <span>Cancelada em {formatDate(new Date(message.cancelled_at))} às {formatTime(new Date(message.cancelled_at))}</span>
                )}
                {message.status === 'failed' && message.failure_reason && (
                  <span className="text-red-600">Erro: {message.failure_reason}</span>
                )}
              </div>
            </div>
          )}

          {/* Confirmação de cancelamento */}
          {showConfirmCancel && message.status === 'pending' && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Cancelar esta mensagem?</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmCancel(false)}
                    className="h-6 text-xs px-2"
                  >
                    Não
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="h-6 text-xs px-2"
                  >
                    Sim
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-1 text-right">
          Criada em {formatTime(new Date(message.created_at))}
        </div>
      </div>
    </div>
  );
};
