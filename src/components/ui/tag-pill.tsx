import { cn } from "@/lib/utils";

interface TagPillProps {
  name: string;
  emoji?: string;
  color: string;
  className?: string;
}

export function TagPill({ name, emoji, color, className }: TagPillProps) {
  // Determinar se o texto deve ser escuro ou claro baseado na cor de fundo
  const isLightColor = (hexColor: string) => {
    // Remover # se existir
    const hex = hexColor.replace('#', '');
    
    // Converter para RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminância
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5;
  };

  const textColorClass = isLightColor(color) ? 'text-slate-700' : 'text-white';

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        textColorClass,
        className
      )}
      style={{ backgroundColor: color }}
    >
      {emoji && <span className="text-base leading-none">{emoji}</span>}
      <span className="leading-none">{name}</span>
    </div>
  );
}

