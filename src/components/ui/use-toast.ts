// Hook minimalista - apenas para evitar erros de importação

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      console.log('Toast:', props);
    }
  };
};

export const toast = (props: ToastProps) => {
  console.log('Toast:', props);
};