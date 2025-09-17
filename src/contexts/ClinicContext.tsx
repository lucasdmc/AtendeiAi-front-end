import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface ClinicContextType {
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
  clinics: Clinic[];
  setClinics: (clinics: Clinic[]) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

interface ClinicProviderProps {
  children: ReactNode;
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>({
    id: '1',
    name: 'Clínica Demo',
    address: 'Rua das Flores, 123',
    phone: '(48) 3333-3333',
    email: 'contato@clinicademo.com'
  });
  
  const [clinics, setClinics] = useState<Clinic[]>([
    {
      id: '1',
      name: 'Clínica Demo',
      address: 'Rua das Flores, 123',
      phone: '(48) 3333-3333',
      email: 'contato@clinicademo.com'
    }
  ]);

  return (
    <ClinicContext.Provider
      value={{
        selectedClinic,
        setSelectedClinic,
        clinics,
        setClinics,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};
