import { useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Textarea } from '../../primitives/Textarea';
import { Button } from '../../primitives/Button';
import './SponsorEnquiryForm.css';

export type EnquiryStatus = 'idle' | 'submitting' | 'done' | 'error';

export interface EnquiryData {
  org: string;
  name: string;
  tier: string;
  msg: string;
}

export interface SponsorEnquiryFormProps {
  /** Options for the tier dropdown, e.g. ['Bronze', 'Silver', 'Gold']. */
  tiers: readonly string[];
  status?: EnquiryStatus;
  errors?: Partial<Record<keyof EnquiryData, string>>;
  onSubmit: (data: EnquiryData) => void;
  onReset?: () => void;
  className?: string;
}

export function SponsorEnquiryForm({
  tiers,
  status = 'idle',
  errors = {},
  onSubmit,
  onReset,
  className,
}: SponsorEnquiryFormProps) {
  const [data, setData] = useState<EnquiryData>({
    org: '',
    name: '',
    tier: 'Not sure yet',
    msg: '',
  });

  const isSubmitting = status === 'submitting';
  const isDone = status === 'done';

  const handleChange = (field: keyof EnquiryData, val: string) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  if (isDone) {
    return (
      <Window title="Enquiry" meta="received" className={className}>
        <div className="amees-sponsor__done">
          <h3 className="amees-sponsor__done-title">Enquiry received.</h3>
          <p className="amees-sponsor__done-text">
            The executive replies within a few days with the sponsor deck and amounts.
          </p>
          {onReset ? (
            <Button onClick={onReset} className="amees-sponsor__reset-btn">
              Send another enquiry
            </Button>
          ) : null}
        </div>
      </Window>
    );
  }

  return (
    <Window title="Start a conversation" className={className}>
      <form className="amees-sponsor__form" onSubmit={handleSubmit}>
        {status === 'error' && (
          <div className="amees-sponsor__form-error" role="alert">
            <strong>Error:</strong> There was a problem submitting. Please try again.
          </div>
        )}

        <Field label="Organisation" error={errors.org}>
          <TextInput
            value={data.org}
            onChange={v => handleChange('org', v)}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Your name" error={errors.name}>
          <TextInput
            value={data.name}
            onChange={v => handleChange('name', v)}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Tier of interest" error={errors.tier}>
          <Select
            options={tiers.map(t => ({ value: t, label: t }))}
            value={data.tier}
            onChange={v => handleChange('tier', v)}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Message (optional)" error={errors.msg}>
          <Textarea
            value={data.msg}
            onChange={v => handleChange('msg', v)}
            rows={3}
            disabled={isSubmitting}
          />
        </Field>

        <div className="amees-sponsor__actions">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Send enquiry
          </Button>
        </div>
      </form>
    </Window>
  );
}