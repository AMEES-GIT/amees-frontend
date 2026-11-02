import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Button } from '../../primitives/Button';
import './RegistrationForm.css';

export type FormStatus = 'idle' | 'submitting' | 'done' | 'error';

export interface RegistrationData {
  name: string;
  matric: string;
  level: string;
  track: string;
}

export interface RegistrationFormProps {
  /** E.g. "Wired 1.0", "Tech Week Hackathon". */
  eventTitle: string;
  /** Array of strings for the track dropdown. */
  tracks: readonly string[];
  /** Array of strings for the level dropdown. Defaults to 100–500. */
  levels?: readonly string[];
  /** Controlled status. */
  status?: FormStatus;
  /** Server-side validation errors, keyed by field name. */
  errors?: Partial<Record<keyof RegistrationData, string>>;
  /** Called with the form data when submitted. */
  onSubmit: (data: RegistrationData) => void;
  /** Called when "Register someone else" is clicked in the done state. */
  onReset?: () => void;
  className?: string;
}

const DEFAULT_LEVELS = ['100', '200', '300', '400', '500'];

export function RegistrationForm({
  eventTitle,
  tracks,
  levels = DEFAULT_LEVELS,
  status = 'idle',
  errors = {},
  onSubmit,
  onReset,
  className,
}: RegistrationFormProps) {
  const [data, setData] = useState<RegistrationData>({
    name: '',
    matric: '',
    level: '',
    track: '',
  });

  const isSubmitting = status === 'submitting';
  const isDone = status === 'done';

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  if (isDone) {
    return (
      <Window title="Registration" meta="complete" className={className}>
        <div className="amees-reg__done">
          <h3 className="amees-reg__done-title">You're registered.</h3>
          <p className="amees-reg__done-text">
            See you at {eventTitle}. Bring a laptop if you have one.
          </p>
          {onReset ? (
            <Button onClick={onReset} className="amees-reg__reset-btn">
              Register someone else
            </Button>
          ) : null}
        </div>
      </Window>
    );
  }

  return (
    <Window title="Register" meta={eventTitle} className={className}>
      <form className="amees-reg__form" onSubmit={handleSubmit}>
        {status === 'error' && (
          <div className="amees-reg__form-error" role="alert">
            <strong>Error:</strong> There was a problem submitting. Please check your details and try again.
          </div>
        )}

        <Field label="Full name" error={errors.name}>
          <TextInput
            type="text"
            value={data.name}
            onChange={(v) => handleChange('name', v)}
            required
            autoComplete="name"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Matric number" error={errors.matric}>
          <TextInput
            type="text"
            value={data.matric}
            onChange={(v) => handleChange('matric', v)}
            required
            disabled={isSubmitting}
          />
        </Field>

        <div className="amees-reg__row">
          <Field label="Level" error={errors.level}>
            <Select
              options={levels.map(l => ({ value: l, label: l }))}
              value={data.level}
              onChange={(v) => handleChange('level', v)}
              placeholder="Select"
              disabled={isSubmitting}
            />
          </Field>

          <Field label="First-choice track" error={errors.track}>
            <Select
              options={tracks.map(t => ({ value: t, label: t }))}
              value={data.track}
              onChange={(v) => handleChange('track', v)}
              placeholder="Select"
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <div className="amees-reg__actions">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Register for {eventTitle}
          </Button>
        </div>
      </form>
    </Window>
  );
}