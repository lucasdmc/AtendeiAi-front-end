import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { 
  X, 
  Edit, 
  User, 
  MessageSquare, 
  Tag, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Download,
  MessageCircle,
  Bot,
  BarChart3
} from 'lucide-react';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
  initialTab?: 'contact' | 'conversation';
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  isOpen,
  onClose,
  conversation,
  initialTab = 'contact'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen || !conversation) return null;

  const displayName = conversation.customer_name || conversation.customer_phone;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[538px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md">
              <AvatarImage src={conversation.customer_profile_pic} alt={displayName} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">{displayName}</span>
              <span className="text-sm text-gray-400 mt-0.5">{conversation.customer_phone}</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-2 p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            className={`flex-1 flex items-center gap-2 justify-center py-3 text-base font-medium transition-colors duration-150 border-b-2 ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            <User className="h-4 w-4 mr-1" />
            <span>Contato</span>
          </button>
          <button
            className={`flex-1 flex items-center gap-2 justify-center py-3 text-base font-medium transition-colors duration-150 border-b-2 ${
              activeTab === 'conversation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('conversation')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Detalhes da conversa</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'contact' ? (
            <ContactTab conversation={conversation} />
          ) : (
            <ConversationTab conversation={conversation} />
          )}
        </div>
      </div>
    </>
  );
};

// Aba Contato
const ContactTab: React.FC<{ conversation: any }> = ({ conversation }) => {
  return (
    <div className="p-4 space-y-6">
      {/* Etiquetas do contato */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Etiquetas do contato</h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs font-medium gap-1 border border-orange-100">
            <span className="text-base">📎</span>
            Pendente
          </span>
        </div>
      </div>

      {/* Observações do contato */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">Observações do contato</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>

      {/* Logs de atividade do contato */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">Logs de atividade do contato</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>

      {/* Informações de contato */}
      <div className="space-y-2 mt-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm">Telefone fixo</span>
          <Button variant="ghost" size="sm" className="text-blue-500 font-normal px-2 py-0 h-6">Adicionar</Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm">E-mail</span>
          <Button variant="ghost" size="sm" className="text-blue-500 font-normal px-2 py-0 h-6">Adicionar</Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-sm">Gênero</span>
          <Button variant="ghost" size="sm" className="text-blue-500 font-normal px-2 py-0 h-6">Adicionar</Button>
        </div>
      </div>

      {/* Ativo pela última vez */}
      <div className="mt-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="h-4 w-4" />
          <span>11 horas atrás</span>
        </div>
      </div>

      {/* Data de criação da conta */}
      <div className="mt-2">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="h-4 w-4" />
          <span>30/09/2025 19:05</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-700 text-sm">Endereço</span>
        <Button variant="ghost" size="sm" className="text-blue-500 font-normal px-2 py-0 h-6">Adicionar</Button>
      </div>

      {/* Ações */}
      <div className="pt-8 pb-2 space-y-3">
        <Button variant="outline" className="w-full justify-center border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 h-11 rounded-xl">
          <Phone className="h-4 w-4 mr-2" />
          Bloquear contato
        </Button>
        <Button variant="default" className="w-full justify-center bg-red-600 hover:bg-red-700 text-white h-11 rounded-xl border-none">
          <X className="h-4 w-4 mr-2" />
          Excluir contato
        </Button>
      </div>
    </div>
  );
};

// Aba Detalhes da Conversa
const ConversationTab: React.FC<{ conversation: any }> = ({ conversation }) => {
  return (
    <div className="p-4 space-y-6">
      {/* Etiquetas da conversa */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Etiquetas da conversa</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Tag className="h-3 w-3 mr-1" />
            Vendido
          </Badge>
        </div>
      </div>

      {/* Canal */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Canal</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm text-gray-600">Canal do suporte (WhatsApp Starter)</span>
        </div>
      </div>

      {/* Setor */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Setor</h3>
        <span className="text-sm text-gray-500">Comerci...</span>
      </div>

      {/* Atendentes */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Atendentes</h3>
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-500 text-white text-xs">EP</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">EdnadePaula</div>
            <div className="text-xs text-gray-500">está atendendo</div>
          </div>
          <div className="flex ml-auto">
            <Avatar className="h-6 w-6 -ml-1 border-2 border-white">
              <AvatarFallback className="bg-teal-500 text-white text-xs"></AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6 -ml-1 border-2 border-white">
              <AvatarFallback className="bg-yellow-500 text-white text-xs"></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Quem está vendo */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Quem está vendo</h3>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-teal-500 text-white text-xs"></AvatarFallback>
        </Avatar>
      </div>

      {/* Última mensagem do contato */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Última mensagem do contato</h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm">11 horas atrás</span>
        </div>
      </div>

      {/* Data de criação */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Data de criação</h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">30/09/2025 19:05</span>
        </div>
      </div>

      {/* Ações da conversa */}
      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Todas as conversas deste contato</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Download className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Baixar esta conversa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Chatbots executados nesta conversa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Logs de atividade desta conversa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
