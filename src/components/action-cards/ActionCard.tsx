// Componente padronizado para cards de ação
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type IconColor = 'green' | 'orange' | 'blue' | 'violet' | 'gray' | 'red' | 'pink' | 'cyan' | 'amber' | 'purple';

export interface ActionCardProps {
  icon: React.ElementType;
  iconColor?: IconColor;
  title: string;
  description: string;
  as?: 'button' | 'div' | 'a';
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
  className?: string;
  'data-test'?: string;
}

const iconColorMap: Record<IconColor, string> = {
  green: 'text-emerald-500',
  orange: 'text-orange-500',
  blue: 'text-blue-500',
  violet: 'text-violet-500',
  gray: 'text-neutral-500',
  red: 'text-red-500',
  pink: 'text-pink-500',
  cyan: 'text-cyan-500',
  amber: 'text-amber-500',
  purple: 'text-purple-500',
};

export const ActionCard = forwardRef<HTMLButtonElement | HTMLDivElement | HTMLAnchorElement, ActionCardProps>(
  (
    {
      icon: Icon,
      iconColor = 'blue',
      title,
      description,
      as = 'button',
      href,
      disabled = false,
      onClick,
      onDragStart,
      draggable = false,
      className,
      'data-test': dataTest,
    },
    ref
  ) => {
    const iconColorClass = iconColorMap[iconColor];

    const baseClasses = cn(
      // Layout
      'group relative rounded-xl border border-neutral-200 bg-white shadow-sm',
      'w-[264px] min-h-[112px] p-4',
      'flex flex-col space-y-1.5',
      // Interação
      'transition-all duration-200',
      'hover:shadow-md hover:border-neutral-300',
      // Focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2',
      // Disabled
      disabled && 'opacity-50 pointer-events-none',
      // Cursor
      draggable && 'cursor-grab active:cursor-grabbing',
      !draggable && !disabled && 'cursor-pointer',
      className
    );

    const content = (
      <>
        {/* Linha 1: Ícone + Título */}
        <div className="flex items-center gap-2">
          <Icon size={20} className={cn(iconColorClass, 'flex-shrink-0')} aria-hidden="true" />
          <h3 className="font-semibold text-[14px] text-neutral-900 truncate flex-1">
            {title}
          </h3>
        </div>

        {/* Linha 2: Descrição */}
        <p className="text-[12.5px] leading-5 text-neutral-500 line-clamp-2">
          {description}
        </p>
      </>
    );

    const ariaLabel = `${title}: ${description}`;

    if (as === 'a' && href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          aria-label={ariaLabel}
          data-test={dataTest}
          draggable={draggable}
          onDragStart={onDragStart}
        >
          {content}
        </a>
      );
    }

    if (as === 'div') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={baseClasses}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          onClick={!disabled ? onClick : undefined}
          data-test={dataTest}
          draggable={draggable}
          onDragStart={onDragStart}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={baseClasses}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        data-test={dataTest}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {content}
      </button>
    );
  }
);

ActionCard.displayName = 'ActionCard';

