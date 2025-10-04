// Select com busca para canais
import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface Channel {
  id: string;
  name: string;
}

interface ChannelSelectProps {
  channels: Channel[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ChannelSelect({
  channels,
  selectedIds,
  onChange,
  placeholder = 'Selecione',
  className,
}: ChannelSelectProps) {
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (selectedIds.length === 0) return placeholder;
    if (selectedIds.length === 1) {
      const channel = channels.find((c) => c.id === selectedIds[0]);
      return channel?.name || placeholder;
    }
    return `${selectedIds.length} canais selecionados`;
  }, [selectedIds, channels, placeholder]);

  const toggleChannel = (channelId: string) => {
    if (selectedIds.includes(channelId)) {
      onChange(selectedIds.filter((id) => id !== channelId));
    } else {
      onChange([...selectedIds, channelId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full h-11 justify-between rounded-2xl border-neutral-200',
            'bg-white shadow-inner text-[14px] font-normal text-neutral-700',
            'hover:bg-white hover:border-neutral-300',
            className
          )}
        >
          <span className={cn(
            selectedIds.length === 0 && 'text-neutral-400'
          )}>
            {displayValue}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-neutral-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 rounded-2xl shadow-lg border-neutral-200" 
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-2xl">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" />
            <CommandInput 
              placeholder="Search" 
              className="h-10 border-0 focus:ring-0 text-[14px]"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm text-neutral-500">
            Nenhum canal encontrado
          </CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto p-2">
            {channels.map((channel) => {
              const isSelected = selectedIds.includes(channel.id);
              return (
                <CommandItem
                  key={channel.id}
                  value={channel.id}
                  onSelect={() => toggleChannel(channel.id)}
                  className="rounded-xl px-3 py-2.5 cursor-pointer aria-selected:bg-neutral-50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center',
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-neutral-300'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-[14px] font-semibold text-neutral-900">
                      {channel.name}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

