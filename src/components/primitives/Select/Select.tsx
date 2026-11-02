import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { useFieldContext } from '../Field/FieldContext';
import './Select.css';

type Attr = SelectHTMLAttributes<HTMLSelectElement>;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<Attr, 'value' | 'onChange' | 'children'> {
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Rendered as the first option when provided. A real choice, not disabled. */
  placeholder?: string;
  invalid?: boolean;
  id?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    value,
    onChange,
    placeholder,
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
    <select
      {...rest}
      ref={ref}
      id={finalId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={finalInvalid || undefined}
      aria-describedby={describedBy}
      className={['amees-select', finalInvalid && 'amees-select--invalid', className]
        .filter(Boolean)
        .join(' ')}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
});