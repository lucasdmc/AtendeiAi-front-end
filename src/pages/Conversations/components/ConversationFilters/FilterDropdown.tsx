import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../../components/ui/button';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface FilterDropdownProps {
  label: string;
  icon?: LucideIcon;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  multiSelect?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange,
  multiSelect = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calcular posição do dropdown
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    setDropdownPosition({
      top: buttonRect.bottom + scrollY + 4, // 4px de margem
      left: buttonRect.left + scrollX,
      width: Math.max(buttonRect.width, 200) // Mínimo 200px
    });
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newValues);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
    }
  };


  const hasSelection = selectedValues.length > 0;

  const handleToggleDropdown = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={handleToggleDropdown}
        className={`
          px-3 py-1.5 h-auto rounded-full text-sm font-medium transition-colors 
          flex items-center space-x-1 border whitespace-nowrap
          ${hasSelection 
            ? 'bg-gray-100 text-gray-800 border-gray-300' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }
        `}
      >
        {Icon && <Icon className="h-3 w-3" />}
        <span>{label}</span>
        {hasSelection && (
          <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 max-h-60 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999
          }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    w-full px-3 py-2 text-left text-sm hover:bg-gray-50 
                    flex items-center space-x-2 transition-colors
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  {multiSelect && (
                    <div className={`
                      w-4 h-4 border rounded flex items-center justify-center
                      ${isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  {OptionIcon && <OptionIcon className="h-4 w-4" />}
                  <span className="flex-1">{option.label}</span>
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
