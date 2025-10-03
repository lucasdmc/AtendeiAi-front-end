import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/types/activityLogs';

interface AgentSelectProps {
  agents: Agent[];
  value: string[];
  onChange: (agentIds: string[]) => void;
}

export function AgentSelect({ agents, value, onChange }: AgentSelectProps) {
  const [open, setOpen] = useState(false);

  const hasSelection = value.length > 0;
  const selectedCount = value.length;

  const toggleAgent = (agentId: string) => {
    if (value.includes(agentId)) {
      onChange(value.filter(id => id !== agentId));
    } else {
      onChange([...value, agentId]);
    }
  };

  const clearSelection = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 justify-between min-w-[180px] relative"
        >
          <span className="truncate">
            {hasSelection && selectedCount === 1
              ? agents.find(a => a.id === value[0])?.name
              : hasSelection
              ? `${selectedCount} atendentes`
              : 'Atendentes'}
          </span>
          {hasSelection && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-400 text-white text-xs"
            >
              {selectedCount}
            </Badge>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>Nenhum atendente encontrado.</CommandEmpty>
            <CommandGroup>
              <div className="px-2 py-1.5 text-xs text-slate-500">
                {hasSelection
                  ? `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`
                  : 'Exibindo todos os itens'}
                {hasSelection && (
                  <button
                    onClick={clearSelection}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.name}
                  onSelect={() => toggleAgent(agent.id)}
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                    <AvatarFallback className="text-xs">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{agent.name}</span>
                  {agent.isYou && (
                    <Badge 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-700 text-xs px-2 py-0"
                    >
                      Você
                    </Badge>
                  )}
                  {value.includes(agent.id) && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

