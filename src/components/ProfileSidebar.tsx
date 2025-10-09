import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSidebarProps {
  className?: string;
}

export default function ProfileSidebar({ className = '' }: ProfileSidebarProps) {
  const navigate = useNavigate();
  const { user, attendant } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2) // Limitar a apenas 2 palavras
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Usar dados do usuário autenticado
  const displayName = attendant?.name || user?.email || 'Usuário';
  const userAvatar = attendant?.avatar || `https://via.placeholder.com/64x64/f3f4f6/6b7280?text=${attendant?.name?.charAt(0) || 'U'}`;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Badge de Perfil */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleProfileClick}
        className="w-full justify-start p-2 text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white"
      >
        <Avatar className="h-6 w-6 mr-2">
          <AvatarImage src={userAvatar} alt={displayName} />
          <AvatarFallback className="bg-white bg-opacity-20 text-white text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="truncate text-sm font-medium">{displayName}</span>
          {user?.email && (
            <span className="truncate text-xs text-white text-opacity-50">{user.email}</span>
          )}
        </div>
      </Button>
    </div>
  );
}