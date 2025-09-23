import { 
  Home, 
  MessageSquare, 
  CalendarCheck, 
  Calendar 
} from "lucide-react";
import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  { path: '/', icon: Home, label: 'Dashboard', description: 'Visão geral do sistema' },
  { path: '/conversations', icon: MessageSquare, label: 'Conversas', description: 'Chat e atendimento' },
  { path: '/appointments', icon: CalendarCheck, label: 'Agendamentos', description: 'Consultas e compromissos' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', description: 'Calendário completo' },
];

