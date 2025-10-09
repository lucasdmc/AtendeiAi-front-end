import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { institutionService, Institution } from '../services/institutionService';

interface InstitutionContextType {
  selectedInstitution: Institution | null;
  availableInstitutions: Institution[];
  isLoading: boolean;
  error: string | null;
  selectInstitution: (institution: Institution) => void;
  refreshInstitutions: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

interface InstitutionProviderProps {
  children: ReactNode;
}

export function InstitutionProvider({ children }: InstitutionProviderProps) {
  const { user, attendant } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [availableInstitutions, setAvailableInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar instituições disponíveis para o usuário
  const loadAvailableInstitutions = async () => {
    if (!user) return;
    
    // Para admin_lify/suporte_lify, não precisa de attendant
    if ((user.global_role === 'admin_lify' || user.global_role === 'suporte_lify') && !attendant) {
      // OK - admin/suporte podem carregar sem attendant
    } else if (!attendant) {
      // Para client_user, precisa de attendant
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let institutions: Institution[] = [];

      // Se for admin_lify ou suporte_lify, pode ver todas as instituições
      if (user.global_role === 'admin_lify' || user.global_role === 'suporte_lify') {
        const response = await institutionService.getAllInstitutions();
        institutions = response.institutions || [];
      } else {
        // Para client_user, buscar todas as instituições onde o usuário é attendant
        try {
          const response = await fetch(`/api/v1/attendants/user/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const attendantsData = await response.json();
            // Extrair instituições únicas dos attendants
            const institutionMap = new Map();
            attendantsData.data.forEach((attendant: any) => {
              if (attendant.institution_id) {
                institutionMap.set(attendant.institution_id._id, attendant.institution_id);
              }
            });
            institutions = Array.from(institutionMap.values());
          } else {
            // Fallback: usar apenas a instituição do attendant atual
            if (attendant?.institution?.id) {
              const institution = await institutionService.getInstitution(attendant.institution.id);
              if (institution) {
                institutions = [institution as unknown as Institution];
              }
            }
          }
        } catch (fetchError) {
          console.warn('Erro ao buscar attendants do usuário, usando fallback:', fetchError);
          // Fallback: usar apenas a instituição do attendant atual
          if (attendant?.institution?.id) {
            const institution = await institutionService.getInstitution(attendant.institution.id);
            if (institution) {
              institutions = [institution as unknown as Institution];
            }
          }
        }
      }

      // Ordenar instituições por nome
      institutions.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      setAvailableInstitutions(institutions);

      // Se não há instituição selecionada e há instituições disponíveis, selecionar a primeira (ordenada)
      if (!selectedInstitution && institutions.length > 0) {
        setSelectedInstitution(institutions[0]);
      }

    } catch (err) {
      console.error('Erro ao carregar instituições:', err);
      setError('Erro ao carregar instituições');
    } finally {
      setIsLoading(false);
    }
  };

  // Selecionar uma instituição
  const selectInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    // Salvar no localStorage para persistir a seleção
    localStorage.setItem('selectedInstitutionId', institution._id);
  };

  // Refresh das instituições
  const refreshInstitutions = async () => {
    await loadAvailableInstitutions();
  };

  // Carregar instituições quando o usuário muda
  useEffect(() => {
    if (user) {
      // Para admin_lify/suporte_lify, carregar mesmo sem attendant
      if (user.global_role === 'admin_lify' || user.global_role === 'suporte_lify') {
        loadAvailableInstitutions();
      } else if (attendant) {
        // Para client_user, precisa de attendant
        loadAvailableInstitutions();
      }
    }
  }, [user, attendant]);

  // Restaurar instituição selecionada do localStorage
  useEffect(() => {
    if (availableInstitutions.length > 0 && !selectedInstitution) {
      const savedInstitutionId = localStorage.getItem('selectedInstitutionId');
      if (savedInstitutionId) {
        const savedInstitution = availableInstitutions.find(
          inst => inst._id === savedInstitutionId
        );
        if (savedInstitution) {
          setSelectedInstitution(savedInstitution);
        } else {
          // Se a instituição salva não existe mais, selecionar a primeira disponível
          setSelectedInstitution(availableInstitutions[0]);
        }
      } else {
        // Se não há instituição salva, selecionar a primeira disponível
        setSelectedInstitution(availableInstitutions[0]);
      }
    }
  }, [availableInstitutions, selectedInstitution]);

  const value: InstitutionContextType = {
    selectedInstitution,
    availableInstitutions,
    isLoading,
    error,
    selectInstitution,
    refreshInstitutions,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution(): InstitutionContextType {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}