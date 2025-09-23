import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { 
  Settings,
  LogOut
} from 'lucide-react';
import { useConversationsContext } from '../../context';

interface NavigationSidebarProps {
  isMinimized: boolean;
  onToggleMinimized: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isMinimized,
  onToggleMinimized
}) => {
  const location = useLocation();
  const { menuItems } = useConversationsContext();

  return (
    <div className={`
      bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-200
      ${isMinimized ? 'w-16' : 'w-64'}
    `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!isMinimized && (
              <img 
                src="/images/lify-logo.png" 
                alt="Lify" 
                className="h-12 w-auto object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimized}
              className="h-8 w-8 p-0"
              title={isMinimized ? "Expandir sidebar" : "Minimizar sidebar"}
            >
              {isMinimized ? "→" : "←"}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center rounded-lg text-sm font-medium transition-colors duration-200 relative
                    ${isMinimized ? 'px-2 py-3 justify-center' : 'px-3 py-3'}
                    ${active 
                      ? 'bg-orange-100 text-orange-900' + (isMinimized ? '' : ' border-r-4 border-orange-500')
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={isMinimized ? item.label : ''}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5 ${isMinimized ? '' : 'mr-3'}
                    ${active ? 'text-orange-600' : 'text-gray-400'}
                  `} />
                  {!isMinimized && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  )}
                  {isMinimized && active && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isMinimized ? (
              <div className="flex space-x-2">
                <Link to="/settings" className="flex-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
                
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="px-3" title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Link to="/settings">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

    </div>
  );
};

