import { useId, type ReactNode } from 'react';
import { FieldContext } from './FieldContext';
import './Field.css';

export interface FieldProps {
  /** Required. Shown above the child, uppercase bold caps. */
  label: string;
  /** Optional. Shown below the child in muted text. */
  hint?: string;
  /** Optional. Shown below the child in red. Adds `Error:` prefix so colour is never the only signal. */
  error?: string;
  /** The input element(s). Field wires `id`, `aria-describedby`, and `aria-invalid` via context. */
  children: ReactNode;
  /** Override the auto-generated id. Usually omit — useId is fine. */
  id?: string;
  /** Optional className on the outer wrapper. */
  className?: string;
}

export function Field({ label, hint, error, children, id, className }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <FieldContext.Provider value={{ id: fieldId, describedBy, invalid }}>
      <div className={['amees-field', className].filter(Boolean).join(' ')}>
        <label className="amees-field__label" htmlFor={fieldId}>
          {label}
        </label>
        {children}
        {hint ? (
          <span className="amees-field__hint" id={hintId}>
            {hint}
          </span>
        ) : null}
        {error ? (
          <span className="amees-field__error" id={errorId} role="alert">
            Error: {error}
          </span>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}