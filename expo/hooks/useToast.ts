import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return show(message, 'success', duration);
  }, [show]);

  const error = useCallback((message: string, duration?: number) => {
    return show(message, 'error', duration);
  }, [show]);

  const warning = useCallback((message: string, duration?: number) => {
    return show(message, 'warning', duration);
  }, [show]);

  const info = useCallback((message: string, duration?: number) => {
    return show(message, 'info', duration);
  }, [show]);

  return {
    toasts,
    show,
    hide,
    hideAll,
    success,
    error,
    warning,
    info,
  };
};

export default useToast;
