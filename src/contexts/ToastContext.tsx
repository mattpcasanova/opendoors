import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync ref with state
  useEffect(() => {
    isVisibleRef.current = visible;
  }, [visible]);

  const showToast = useCallback((
    msg: string,
    toastType: ToastType = 'info',
    toastDuration: number = 3000
  ) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If a toast is already visible, hide it first, then show new one
    if (isVisibleRef.current) {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setMessage(msg);
        setType(toastType);
        setDuration(toastDuration);
        setVisible(true);
        timeoutRef.current = null;
      }, 350);
    } else {
      setMessage(msg);
      setType(toastType);
      setDuration(toastDuration);
      setVisible(true);
    }
  }, []);

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
