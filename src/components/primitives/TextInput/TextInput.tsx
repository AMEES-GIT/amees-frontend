import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { useFieldContext } from '../Field/FieldContext';
import './TextInput.css';

export type TextInputType = 'text' | 'search' | 'email' | 'tel' | 'url' | 'numeric' | 'otp' | 'password';
type Attr = InputHTMLAttributes<HTMLInputElement>;

interface TypeConfig {
  htmlType: Attr['type'];
  inputMode: Attr['inputMode'];
  autoComplete?: string;
  pattern?: string;
  maxLength?: number;
}

const TYPE_CONFIG: Record<TextInputType, TypeConfig> = {
  text: { htmlType: 'text', inputMode: 'text' },
  search: { htmlType: 'search', inputMode: 'search' },
  email: { htmlType: 'email', inputMode: 'email', autoComplete: 'email' },
  tel: { htmlType: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  url: { htmlType: 'url', inputMode: 'url', autoComplete: 'url' },
  numeric: { htmlType: 'text', inputMode: 'numeric' }, // Note: htmlType text because we add commas
  otp: { htmlType: 'text', inputMode: 'numeric', pattern: '[0-9]*', autoComplete: 'one-time-code', maxLength: 6 },
  password: { htmlType: 'password', inputMode: 'text', autoComplete: 'current-password' },
};

export interface TextInputProps extends Omit<Attr, 'type' | 'value' | 'onChange' | 'size'> {
  type?: TextInputType;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { type = 'text', value, onChange, invalid, id, className, autoComplete: callerAutoComplete, pattern: callerPattern, maxLength: callerMaxLength, 'aria-describedby': callerDescribedBy, ...rest },
  ref,
) {
  const field = useFieldContext();
  const autoId = useId();
  const finalId = id ?? field?.id ?? autoId;
  const finalInvalid = invalid ?? field?.invalid ?? false;
  const describedBy = [field?.describedBy, callerDescribedBy].filter(Boolean).join(' ') || undefined;

  const cfg = TYPE_CONFIG[type];
  const autoComplete = callerAutoComplete ?? cfg.autoComplete;
  const pattern = callerPattern ?? cfg.pattern;
  const maxLength = callerMaxLength ?? cfg.maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (type === 'numeric') {
      // Remove everything except digits
      const raw = val.replace(/[^\d]/g, '');
      if (!raw) {
        onChange('');
        return;
      }
      // Format with commas
      onChange(new Intl.NumberFormat('en-NG').format(Number(raw)));
    } else {
      onChange(val);
    }
  };

  return (
    <input
      {...rest}
      ref={ref}
      id={finalId}
      type={cfg.htmlType}
      inputMode={cfg.inputMode}
      autoComplete={autoComplete}
      pattern={pattern}
      maxLength={maxLength}
      value={value}
      onChange={handleChange}
      aria-invalid={finalInvalid || undefined}
      aria-describedby={describedBy}
      className={['amees-input', finalInvalid && 'amees-input--invalid', className].filter(Boolean).join(' ')}
    />
  );
});