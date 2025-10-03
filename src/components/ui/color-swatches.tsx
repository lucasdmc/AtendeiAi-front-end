import { cn } from "@/lib/utils";

// Paleta de cores seguindo as imagens de referência
export const TAG_COLORS = [
  // Linha 1
  { id: 'blue-100', value: '#DBEAFE', label: 'Azul claro' },
  { id: 'blue-200', value: '#BFDBFE', label: 'Azul' },
  { id: 'cyan-100', value: '#CFFAFE', label: 'Ciano claro' },
  { id: 'cyan-200', value: '#A5F3FC', label: 'Ciano' },
  { id: 'green-100', value: '#D1FAE5', label: 'Verde claro' },
  { id: 'lime-100', value: '#ECFCCB', label: 'Lima claro' },
  { id: 'yellow-100', value: '#FEF3C7', label: 'Amarelo claro' },
  { id: 'amber-100', value: '#FEF3C7', label: 'Âmbar claro' },
  { id: 'orange-100', value: '#FFEDD5', label: 'Laranja claro' },
  { id: 'stone-200', value: '#E7E5E4', label: 'Pedra' },
  { id: 'red-100', value: '#FEE2E2', label: 'Vermelho claro' },
  
  // Linha 2
  { id: 'red-200', value: '#FECACA', label: 'Vermelho' },
  { id: 'pink-100', value: '#FCE7F3', label: 'Rosa claro' },
  { id: 'pink-200', value: '#FBCFE8', label: 'Rosa' },
  { id: 'fuchsia-200', value: '#F5D0FE', label: 'Fúcsia' },
  { id: 'purple-200', value: '#E9D5FF', label: 'Roxo' },
  { id: 'violet-200', value: '#DDD6FE', label: 'Violeta' },
  { id: 'indigo-100', value: '#E0E7FF', label: 'Índigo claro' },
  { id: 'slate-200', value: '#E2E8F0', label: 'Ardósia' },
  { id: 'gray-200', value: '#E5E7EB', label: 'Cinza' },
];

interface ColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorSwatches({ value, onChange, className }: ColorSwatchesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-slate-700">
        Cor de fundo
      </label>
      <div className="grid grid-cols-11 gap-2">
        {TAG_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              "hover:scale-110 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              value === color.value && "ring-2 ring-offset-2 ring-blue-600 scale-110"
            )}
            style={{ backgroundColor: color.value }}
            title={color.label}
            aria-label={color.label}
          />
        ))}
      </div>
    </div>
  );
}

