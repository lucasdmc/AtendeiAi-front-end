import { PatientInfo, Flag } from '../types';

export const mockPatientInfo: PatientInfo = {
  name: 'Maria Silva',
  age: 34,
  phone: '+55 47 9719-2447',
  insurance: 'Unimed',
  status: 'Recado',
  description: "Don't tread on me. 😤",
  files: [
    { 
      id: '1', 
      type: 'image', 
      name: 'Exame_Sangue_2024.jpg', 
      url: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=100&h=100&fit=crop', 
      date: '15/03/2024' 
    },
    { 
      id: '2', 
      type: 'image', 
      name: 'Raio_X_Torax.jpg', 
      url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=100&h=100&fit=crop', 
      date: '10/03/2024' 
    },
    { 
      id: '3', 
      type: 'document', 
      name: 'Receita_Medica.pdf', 
      url: '#', 
      date: '08/03/2024' 
    },
    { 
      id: '4', 
      type: 'document', 
      name: 'Relatorio_Consulta.pdf', 
      url: '#', 
      date: '05/03/2024' 
    },
    { 
      id: '5', 
      type: 'image', 
      name: 'Ultrassom.jpg', 
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', 
      date: '02/03/2024' 
    }
  ]
};

export const mockFlags: Flag[] = [
  { id: '1', name: 'Manual', color: '#3B82F6', description: 'Atendimento manual por humano', createdAt: '2024-01-15' },
  { id: '2', name: 'Urgente', color: '#EF4444', description: 'Conversa que precisa de atenção imediata', createdAt: '2024-01-15' },
  { id: '3', name: 'Agendamento', color: '#E91E63', description: 'Relacionado a agendamentos de consultas', createdAt: '2024-01-16' },
  { id: '4', name: 'Financeiro', color: '#F59E0B', description: 'Questões de pagamento e faturamento', createdAt: '2024-01-16' },
  { id: '5', name: 'Suporte', color: '#8B5CF6', description: 'Suporte técnico e dúvidas', createdAt: '2024-01-17' },
  { id: '6', name: 'VIP', color: '#EC4899', description: 'Cliente VIP - atendimento prioritário', createdAt: '2024-01-18' },
  { id: '7', name: 'Retorno', color: '#F97316', description: 'Paciente de retorno', createdAt: '2024-01-18' },
  { id: '8', name: 'Primeira Consulta', color: '#06B6D4', description: 'Primeira vez na clínica', createdAt: '2024-01-19' },
  { id: '9', name: 'Cancelamento', color: '#6B7280', description: 'Solicitação de cancelamento', createdAt: '2024-01-19' },
  { id: '10', name: 'Reagendamento', color: '#84CC16', description: 'Solicitação de reagendamento', createdAt: '2024-01-20' },
  { id: '11', name: 'Exames', color: '#A855F7', description: 'Relacionado a exames', createdAt: '2024-01-20' },
  { id: '12', name: 'Receita', color: '#F59E0B', description: 'Solicitação de receita médica', createdAt: '2024-01-21' },
  { id: '13', name: 'Emergência', color: '#DC2626', description: 'Situação de emergência', createdAt: '2024-01-21' },
  { id: '14', name: 'Convênio', color: '#059669', description: 'Questões relacionadas ao convênio', createdAt: '2024-01-22' },
  { id: '15', name: 'Satisfação', color: '#7C3AED', description: 'Pesquisa de satisfação', createdAt: '2024-01-22' }
];

