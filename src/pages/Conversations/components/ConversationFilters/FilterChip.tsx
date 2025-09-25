import React from 'react';
import { Badge } from '../../../../components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  count?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  primary: {
    active: 'bg-pink-100 text-pink-800 border-pink-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  },
  secondary: {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  },
  success: {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  },
  warning: {
    active: 'bg-orange-100 text-orange-800 border-orange-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  },
  danger: {
    active: 'bg-red-100 text-red-800 border-red-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  },
  info: {
    active: 'bg-purple-100 text-purple-800 border-purple-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  }
};

const countBadgeStyles = {
  primary: 'bg-pink-200 text-pink-800',
  secondary: 'bg-blue-200 text-blue-800',
  success: 'bg-green-200 text-green-800',
  warning: 'bg-orange-200 text-orange-800',
  danger: 'bg-red-200 text-red-800',
  info: 'bg-purple-200 text-purple-800'
};

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive,
  onClick,
  icon: Icon,
  count,
  variant = 'primary'
}) => {
  const styles = variantStyles[variant];
  const badgeStyle = countBadgeStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-colors 
        flex items-center space-x-1 border whitespace-nowrap
        ${isActive ? styles.active : styles.inactive}
      `}
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant="secondary" 
          className={`ml-1 text-xs ${badgeStyle}`}
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </button>
  );
};
