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
import { Badge } from '@/components/ui/badge';
import { ActivityType, ACTIVITY_LABELS } from '@/types/activityLogs';

interface ActivitySelectProps {
  value: ActivityType[];
  onChange: (activities: ActivityType[]) => void;
}

// Ordenar atividades alfabeticamente pelo label
const SORTED_ACTIVITIES = (Object.entries(ACTIVITY_LABELS) as [ActivityType, string][])
  .sort((a, b) => a[1].localeCompare(b[1]));

export function ActivitySelect({ value, onChange }: ActivitySelectProps) {
  const [open, setOpen] = useState(false);

  const hasSelection = value.length > 0;
  const selectedCount = value.length;

  const toggleActivity = (activityType: ActivityType) => {
    if (value.includes(activityType)) {
      onChange(value.filter(type => type !== activityType));
    } else {
      onChange([...value, activityType]);
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
              ? ACTIVITY_LABELS[value[0]]
              : hasSelection
              ? `${selectedCount} atividades`
              : 'Atividade'}
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
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
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
              {SORTED_ACTIVITIES.map(([type, label]) => (
                <CommandItem
                  key={type}
                  value={label}
                  onSelect={() => toggleActivity(type)}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <span className="flex-1">{label}</span>
                  {value.includes(type) && (
                    <Check className="h-4 w-4 text-blue-600 ml-2" />
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

