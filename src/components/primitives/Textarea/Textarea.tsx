import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { useFieldContext } from '../Field/FieldContext';
import './Textarea.css';

type Attr = TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface TextareaProps extends Omit<Attr, 'value' | 'onChange' | 'children'> {
  value: string;
  onChange: (value: string) => void;
  /** Number of visible rows. Default 4. */
  rows?: number;
  /** When present, shows a live "N / max" counter under the textarea. */
  showCount?: boolean;
  invalid?: boolean;
  id?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    onChange,
    rows = 4,
    showCount,
    maxLength,
    invalid,
    id,
    className,
    'aria-describedby': callerDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const autoId = useId();
  const finalId = id ?? field?.id ?? autoId;
  const finalInvalid = invalid ?? field?.invalid ?? false;
  const describedBy =
    [field?.describedBy, callerDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div className="amees-textarea">
      <textarea
        {...rest}
        ref={ref}
        id={finalId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={finalInvalid || undefined}
        aria-describedby={describedBy}
        className={[
          'amees-textarea__input',
          finalInvalid && 'amees-textarea__input--invalid',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {showCount && maxLength ? (
        <span className="amees-textarea__count">
          {value.length} / {maxLength}
        </span>
      ) : null}
    </div>
  );
});