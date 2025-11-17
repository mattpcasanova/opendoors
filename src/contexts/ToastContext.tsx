import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  const showToast = useCallback((
    msg: string,
    toastType: ToastType = 'info',
    toastDuration: number = 3000
  ) => {
    // If a toast is already visible, hide it first
    if (visible) {
      setVisible(false);
      setTimeout(() => {
        setMessage(msg);
        setType(toastType);
        setDuration(toastDuration);
        setVisible(true);
      }, 300);
    } else {
      setMessage(msg);
      setType(toastType);
      setDuration(toastDuration);
      setVisible(true);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={message}
        type={type}
        duration={duration}
        visible={visible}
        onDismiss={handleDismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
