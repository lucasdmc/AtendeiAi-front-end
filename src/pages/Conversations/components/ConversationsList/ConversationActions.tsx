import React from 'react';
import { Button } from '../../../../components/ui/button';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  FileText,
  ArrowUp,
  MessageSquare
} from 'lucide-react';
import { Conversation } from '../../../../services/api';

export interface ConversationActionsProps {
  conversation: Conversation;
  activeTab: 'bot' | 'entrada' | 'aguardando' | 'em_atendimento' | 'finalizadas';
  onAction: (action: string, conversation: Conversation) => void;
}

export const ConversationActions: React.FC<ConversationActionsProps> = ({
  conversation,
  activeTab,
  onAction
}) => {
  const renderActions = () => {
    switch (activeTab) {
      case 'bot':
        return null;

      case 'entrada':
        return null;

      case 'aguardando':
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('iniciar', conversation)}
            >
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
          </div>
        );

      case 'em_atendimento':
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('esperar', conversation)}
            >
              <Clock className="h-3 w-3 mr-1" />
              Esperar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('escalar', conversation)}
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Escalar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('finalizar', conversation)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Finalizar
            </Button>
          </div>
        );

      case 'finalizadas':
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('historico', conversation)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Histórico
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onAction('reabrir', conversation)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Reabrir
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-end">
      {renderActions()}
    </div>
  );
};
