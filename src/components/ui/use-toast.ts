// Hook funcional que usa Sonner toast
import { toast as sonnerToast } from './sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      if (props.variant === 'destructive') {
        sonnerToast.error(props.title || 'Erro', {
          description: props.description,
        });
      } else {
        sonnerToast.success(props.title || 'Sucesso', {
          description: props.description,
        });
      }
    }
  };
};

export const toast = (props: ToastProps) => {
  if (props.variant === 'destructive') {
    sonnerToast.error(props.title || 'Erro', {
      description: props.description,
    });
  } else {
    sonnerToast.success(props.title || 'Sucesso', {
      description: props.description,
    });
  }
};