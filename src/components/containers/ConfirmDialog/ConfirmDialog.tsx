import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../primitives/Button';
import { Window } from '../Window';
import './ConfirmDialog.css';

export interface DialogProps {
  open: boolean;
  title: string;
  body: string;
  type?: 'confirm' | 'info' | 'success' | 'error';
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  type = 'confirm',
  confirmLabel,
  onConfirm,
  onCancel,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return;
    const doc = document;
    
    const originalOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';

    setTimeout(() => actionRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancelRef.current(); return; }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    doc.addEventListener('keydown', handleKeyDown);

    return () => {
      doc.body.style.overflow = originalOverflow;
      doc.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  // Show cancel button for all types EXCEPT info/error alerts
  const showCancel = type !== 'info' && type !== 'error';
  
  let toneClass = 'default';
  let defaultLabel = 'Okay';
  if (type === 'success') { toneClass = 'success'; }
  if (type === 'error') { toneClass = 'danger'; defaultLabel = 'Close'; }
  if (type === 'confirm') { toneClass = 'danger'; defaultLabel = 'Confirm'; }

  return createPortal(
    <div className="amees-dialog-overlay" role="dialog" aria-modal="true">
      <div ref={dialogRef} className="amees-dialog-container">
        <Window title={title}>
          <div className="amees-dialog__body">{body}</div>
          <div className="amees-dialog__actions">
            {showCancel && (
              <Button onClick={onCancel} variant="default">Cancel</Button>
            )}
            <Button 
              ref={actionRef}
              // The main button ALWAYS calls onConfirm
              onClick={onConfirm} 
              className={`amees-dialog__btn--${toneClass}`}
            >
              {confirmLabel || defaultLabel}
            </Button>
          </div>
        </Window>
      </div>
    </div>,
    document.body
  );
}