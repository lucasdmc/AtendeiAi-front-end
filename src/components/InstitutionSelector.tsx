import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Building2 } from 'lucide-react';

interface InstitutionSelectorProps {
  className?: string;
}

export default function InstitutionSelector({ className = '' }: InstitutionSelectorProps) {
  const { 
    selectedInstitution, 
    availableInstitutions, 
    isLoading: institutionLoading,
    selectInstitution 
  } = useInstitution();

  return (
    <div className={`w-full ${className}`}>
      {/* Seletor de Instituição - Sempre visível */}
      {availableInstitutions.length > 0 && (
        <Select
          value={selectedInstitution?._id || ''}
          onValueChange={(value) => {
            const institution = availableInstitutions.find(inst => inst._id === value);
            if (institution) {
              selectInstitution(institution);
            }
          }}
          disabled={institutionLoading}
        >
          <SelectTrigger className="w-full h-10 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <SelectValue placeholder="Selecionar instituição" className="truncate max-w-full" />
          </SelectTrigger>
          <SelectContent>
            {availableInstitutions
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map((institution) => (
              <SelectItem key={institution._id} value={institution._id}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{institution.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
