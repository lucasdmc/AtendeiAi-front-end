import { MessageCircle } from 'lucide-react';
import { Channel } from '@/types/chatbot';
import { Badge } from '@/components/ui/badge';

interface ChannelChipProps {
  channel: Channel;
}

export function ChannelChip({ channel }: ChannelChipProps) {
  return (
    <Badge 
      variant="secondary" 
      className="bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 px-2.5 py-0.5 font-normal"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      <span>{channel.name}</span>
    </Badge>
  );
}

