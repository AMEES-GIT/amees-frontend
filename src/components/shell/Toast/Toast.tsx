import { useEffect, useRef } from 'react';
import { motionAllowed } from '../../../lib/motion';
import './Toast.css';

export interface ToastProps {
  /** Message shown in the toast. Empty string = nothing rendered (safety). */
  message: string;
  /** When true, toast is visible. Host controls the timer. */
  visible: boolean;
  className?: string;
}

export function Toast({ message, visible, className }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    if (!motionAllowed(el)) {
      el.style.opacity = visible ? '1' : '0';
      el.style.transform = visible
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(20px)';
      return;
    }

    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      gsap.to(el, {
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 20,
        xPercent: -50,
        duration: 0.15,
        ease: visible ? 'power2.out' : 'power2.in',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!message) return null;

  return (
    <div
      ref={ref}
      className={['amees-toast', visible && 'amees-toast--visible', className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}