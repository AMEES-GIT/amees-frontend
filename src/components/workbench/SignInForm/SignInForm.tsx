import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Button } from '../../primitives/Button';
import './SignInForm.css';

export type SignInStep = 'identify' | 'code';

export interface SignInValues {
  name: string;
  matric: string;
  number: string;
  code: string;
}

export interface SignInFormProps {
  step?: SignInStep;
  values?: Partial<SignInValues>;
  errors?: Partial<Record<keyof SignInValues, string>>;
  /** E.g. "WhatsApp" or "SMS". Decides the text in the code step. */
  channelLabel?: string;
  onSubmit: (values: SignInValues) => void;
  className?: string;
}

export function SignInForm({
  step = 'identify',
  values: initialValues = {},
  errors = {},
  channelLabel = 'WhatsApp',
  onSubmit,
  className,
}: SignInFormProps) {
  const [values, setValues] = useState<SignInValues>({
    name: initialValues.name || '',
    matric: initialValues.matric || '',
    number: initialValues.number || '',
    code: initialValues.code || '',
  });

  const handleChange = (key: keyof SignInValues, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Window title="Sign in" meta="no password" className={className}>
      <form className="amees-wb-signin" onSubmit={handleSubmit}>
        
        {step === 'identify' ? (
          <>
            <Field label="Full name" error={errors.name}>
              <TextInput 
                value={values.name} 
                onChange={v => handleChange('name', v)} 
                required 
                autoComplete="name" 
              />
            </Field>
            <Field label="Matric number" error={errors.matric}>
              <TextInput 
                value={values.matric} 
                onChange={v => handleChange('matric', v)} 
                required 
              />
            </Field>
            <Field label={`${channelLabel} number`} error={errors.number}>
              <TextInput 
                type="tel"
                value={values.number} 
                onChange={v => handleChange('number', v)} 
                required 
                autoComplete="tel" 
              />
            </Field>
            <div className="amees-wb-signin__actions">
              <Button type="submit" variant="primary">Send code</Button>
              <Button type="button">Try the demo</Button>
            </div>
          </>
        ) : (
          <>
            <Field label={`6-digit code from ${channelLabel}`} error={errors.code}>
              <TextInput 
                type="otp"
                value={values.code} 
                onChange={v => handleChange('code', v)} 
                required 
                autoComplete="one-time-code" 
              />
            </Field>
            <p className="amees-wb-signin__hint">Mockup: any six digits work.</p>
            <div className="amees-wb-signin__actions">
              <Button type="submit" variant="primary">Sign in</Button>
            </div>
          </>
        )}
      </form>
    </Window>
  );
}