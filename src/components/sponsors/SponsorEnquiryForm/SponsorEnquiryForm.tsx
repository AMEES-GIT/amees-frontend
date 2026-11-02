// SponsorEnquiryForm.tsx
import { useMemo, useState } from 'react';
import { Window } from '../../containers/Window';
import { Field } from '../../primitives/Field';
import { TextInput } from '../../primitives/TextInput';
import { Select } from '../../primitives/Select';
import { Textarea } from '../../primitives/Textarea';
import { Button } from '../../primitives/Button';
import './SponsorEnquiryForm.css';

/** Where enquiries land. Server should also hard-code this — never trust the client. */
export const SPONSORS_EMAIL = 'sponsors@amees.com.ng';

export type EnquiryStatus = 'idle' | 'submitting' | 'done' | 'error';

export interface EnquiryData {
  org: string;
  name: string;
  email: string;
  tier: string;
  msg: string;
}

export interface SponsorEnquiryFormProps {
  /** Options for the tier dropdown, e.g. ['Bronze', 'Silver', 'Gold']. */
  tiers: readonly string[];
  /** API route that sends the email. Defaults to /api/sponsor-enquiry. */
  endpoint?: string;
  /** Controlled status. Omit to let the component manage its own. */
  status?: EnquiryStatus;
  /** Extra/override field errors from the parent. */
  errors?: Partial<Record<keyof EnquiryData, string>>;
  /** Custom transport. Defaults to POSTing JSON to `endpoint`. */
  submit?: (data: EnquiryData) => Promise<void>;
  /** Fired after the email is successfully handed off. */
  onSubmit?: (data: EnquiryData) => void;
  onReset?: () => void;
  className?: string;
}

const EMPTY: EnquiryData = {
  org: '',
  name: '',
  email: '',
  tier: 'Not sure yet',
  msg: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(d: EnquiryData): Partial<Record<keyof EnquiryData, string>> {
  const e: Partial<Record<keyof EnquiryData, string>> = {};
  if (!d.org.trim()) e.org = 'Please tell us which organisation you represent.';
  if (!d.name.trim()) e.name = 'Please add a contact name.';
  if (!d.email.trim()) e.email = 'We need an address to reply to.';
  else if (!EMAIL_RE.test(d.email.trim())) e.email = 'That email address looks incomplete.';
  return e;
}

export function buildEmailBody(d: EnquiryData): string {
  return [
    `Organisation: ${d.org}`,
    `Contact name: ${d.name}`,
    `Reply-to: ${d.email}`,
    `Tier of interest: ${d.tier}`,
    '',
    'Message:',
    d.msg || '(none)',
    '',
    '— Sent from the AMEES sponsor enquiry form',
  ].join('\n');
}

async function sendEnquiry(data: EnquiryData, endpoint: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        subject: `Sponsor enquiry — ${data.org} (${data.tier})`,
        replyTo: data.email,
        fields: data,
        text: buildEmailBody(data),
      }),
    });
  } catch {
    throw new Error('Network error — check your connection and try again.');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
}

export function SponsorEnquiryForm({
  tiers,
  endpoint = '/api/sponsor-enquiry',
  status: statusProp,
  errors: errorsProp = {},
  submit,
  onSubmit,
  onReset,
  className,
}: SponsorEnquiryFormProps) {
  const [data, setData] = useState<EnquiryData>(EMPTY);
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof EnquiryData, string>>>({});
  const [internalStatus, setInternalStatus] = useState<EnquiryStatus>('idle');
  const [sendError, setSendError] = useState<string | null>(null);

  const status = statusProp ?? internalStatus;
  const errors = { ...localErrors, ...errorsProp };
  const isSubmitting = status === 'submitting';
  const isDone = status === 'done';

  const handleChange = (field: keyof EnquiryData, val: string) => {
    setData(prev => ({ ...prev, [field]: val }));
    setLocalErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const mailtoHref = useMemo(() => {
    const subject = `Sponsor enquiry — ${data.org || 'AMEES'}`;
    return `mailto:${SPONSORS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      buildEmailBody(data),
    )}`;
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const payload: EnquiryData = {
      org: data.org.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
      tier: data.tier,
      msg: data.msg.trim(),
    };

    const found = validate(payload);
    setLocalErrors(found);
    if (Object.keys(found).length > 0) return;

    setInternalStatus('submitting');
    setSendError(null);

    try {
      if (submit) await submit(payload);
      else await sendEnquiry(payload, endpoint);

      setInternalStatus('done');
      onSubmit?.(payload);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Something went wrong.');
      setInternalStatus('error');
    }
  };

  const handleReset = () => {
    setData(EMPTY);
    setLocalErrors({});
    setSendError(null);
    setInternalStatus('idle');
    onReset?.();
  };

  if (isDone) {
    return (
      <Window title="Enquiry" meta="received" className={className}>
        <div className="amees-sponsor__done">
          <h3 className="amees-sponsor__done-title">Enquiry received.</h3>
          <p className="amees-sponsor__done-text">
            We&rsquo;ve received your enquiry. Expect a reply within a few days with
            the sponsor deck and what each tier costs.
          </p>
          {onReset ? (
            <Button onClick={handleReset} className="amees-sponsor__reset-btn">
              Send another enquiry
            </Button>
          ) : null}
        </div>
      </Window>
    );
  }

  return (
    <Window title="Start a conversation" className={className}>
      <form className="amees-sponsor__form" onSubmit={handleSubmit} noValidate>
        {status === 'error' && (
          <div className="amees-sponsor__form-error" role="alert">
            <strong>Couldn&rsquo;t send your enquiry.</strong>{' '}
            {sendError ?? 'There was a problem submitting. Please try again.'}
            <a className="amees-sponsor__mailto" href={mailtoHref}>
              Or email {SPONSORS_EMAIL} directly
            </a>
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

        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            value={data.email}
            onChange={v => handleChange('email', v)}
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