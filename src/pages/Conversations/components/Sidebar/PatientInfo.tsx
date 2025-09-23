import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Download,
  Eye,
  Heart,
  Activity,
  User,
  Clock
} from 'lucide-react';
import { Conversation } from '../../types';
import { useConversationsContext } from '../../context';
import { getInitials } from '../../utils';

interface PatientInfoProps {
  conversation: Conversation;
  onClose: () => void;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ conversation, onClose }) => {
  const { patientInfo, setFilesModalOpen } = useConversationsContext();
  
  const displayName = conversation.customer_name || conversation.customer_phone;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Informações do Contato</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Perfil do paciente */}
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage 
                src={conversation.customer_profile_pic || conversation.avatar} 
                alt={displayName} 
              />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              {patientInfo.name}
            </h4>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {patientInfo.age} anos
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  patientInfo.status === 'Ativo' ? 'border-green-200 text-green-700' : 'border-gray-200'
                }`}
              >
                {patientInfo.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">
              {patientInfo.description}
            </p>
          </div>

          {/* Informações de contato */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contato
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{patientInfo.phone}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">email@exemplo.com</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Blumenau, SC</span>
              </div>
            </div>
          </div>

          {/* Informações médicas */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Informações Médicas
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-gray-900">Convênio: {patientInfo.insurance}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-gray-600">Última consulta: 15/03/2024</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-gray-600">Próxima consulta: 22/03/2024</span>
              </div>
            </div>
          </div>

          {/* Arquivos do paciente */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivos ({patientInfo.files.length})
              </h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilesModalOpen(true)}
                className="text-xs"
              >
                Ver todos
              </Button>
            </div>
            
            <div className="space-y-2">
              {patientInfo.files.slice(0, 3).map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {file.type === 'image' ? (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.date}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900">Ações Rápidas</h5>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Agendar
              </Button>
              
              <Button variant="outline" size="sm" className="text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Ligar
              </Button>
              
              <Button variant="outline" size="sm" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Receita
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
