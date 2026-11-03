import { useEffect } from 'react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error'; 
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500); // Auto-dismiss after 3.5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`amees-toast amees-toast--${type}`} role="alert">
      <span style={{ fontFamily: 'var(--font)' }}>{message}</span>
      <button onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}