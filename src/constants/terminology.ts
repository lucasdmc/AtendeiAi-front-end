/**
 * Constantes de terminologia para unificar nomenclatura no sistema
 * 
 * Esta abordagem permite mudança gradual da terminologia sem quebrar
 * a compatibilidade com o backend que ainda usa "Institution"
 */

export const TERMINOLOGY = {
  // Terminologia principal
  INSTITUTION: {
    singular: 'Instituição',
    plural: 'Instituições',
    singularLower: 'instituição',
    pluralLower: 'instituições',
  },
  
  // Terminologia legada (para compatibilidade)
  CLINIC: {
    singular: 'Clínica',
    plural: 'Clínicas', 
    singularLower: 'instituição',
    pluralLower: 'instituiçãos',
  },
  
  // URLs e rotas
  ROUTES: {
    admin: '/settings/institutions',
    organization: '/settings/institution',
    api: '/api/v1/institutions', // Manter compatibilidade com backend
  },
  
  // Tipos de instituição
  INSTITUTION_TYPES: {
    hospital: 'Hospital',
    clinica: 'Clínica',
    consultor: 'Consultório',
    grupo: 'Grupo de saúde',
    laboratorio: 'Laboratório',
    farmacia: 'Farmácia',
    outros: 'Outros',
  },
  
  // Labels para formulários
  LABELS: {
    institutionName: 'Nome da Instituição',
    institutionType: 'Tipo de Instituição',
    institutionPhone: 'Telefone da Instituição',
    institutionEmail: 'Email da Instituição',
    institutionAddress: 'Endereço da Instituição',
    institutionDescription: 'Descrição da Instituição',
  },
  
  // Placeholders
  PLACEHOLDERS: {
    institutionName: 'Digite o nome da instituição',
    institutionType: 'Selecione o tipo de instituição',
    institutionPhone: 'Telefone da instituição',
    institutionEmail: 'Email da instituição',
    institutionAddress: 'Endereço completo da instituição',
    institutionDescription: 'Descrição da instituição',
  },
  
  // Mensagens
  MESSAGES: {
    createSuccess: 'Instituição criada com sucesso!',
    updateSuccess: 'Instituição atualizada com sucesso!',
    deleteSuccess: 'Instituição removida com sucesso!',
    createError: 'Erro ao criar instituição',
    updateError: 'Erro ao atualizar instituição',
    deleteError: 'Erro ao remover instituição',
    loadError: 'Erro ao carregar instituições',
  },
} as const;

// Função helper para obter nome sugerido baseado no tipo
export const getSuggestedInstitutionName = (type: string, firstName: string): string => {
  
  switch (type) {
    case 'hospital':
      return `Hospital ${firstName}`;
    case 'clinica':
      return `Clínica ${firstName}`;
    case 'consultor':
      return `Consultório ${firstName}`;
    case 'grupo':
      return `Grupo ${firstName}`;
    case 'laboratorio':
      return `Laboratório ${firstName}`;
    case 'farmacia':
      return `Farmácia ${firstName}`;
    default:
      return `${firstName}`;
  }
};

// Função helper para obter terminologia baseada no contexto
export const getTerminology = (context: 'admin' | 'organization' | 'general' = 'general') => {
  switch (context) {
    case 'admin':
      return {
        ...TERMINOLOGY.INSTITUTION,
        title: 'Gestão de Instituições',
        subtitle: 'Administre todas as instituições da plataforma',
      };
    case 'organization':
      return {
        ...TERMINOLOGY.INSTITUTION,
        title: 'Configurações da Instituição',
        subtitle: 'Gerencie as informações da sua instituição',
      };
    default:
      return TERMINOLOGY.INSTITUTION;
  }
};
