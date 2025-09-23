import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSidebarProps {
  className?: string;
}

export default function ProfileSidebar({ className = '' }: ProfileSidebarProps) {
  const navigate = useNavigate();

  // Dados do usuário (simulados - em produção viriam do contexto/auth)
  const userProfile = {
    name: 'Paulo',
    avatar: '/api/placeholder/64/64'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <button
        onClick={handleProfileClick}
        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
          <AvatarFallback className="bg-gray-300 text-gray-700">
            {getInitials(userProfile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {userProfile.name}
          </div>
        </div>
      </button>
    </div>
  );
}
