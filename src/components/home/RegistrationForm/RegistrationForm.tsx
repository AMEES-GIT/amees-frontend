import { Window } from '../../containers/Window';
import { Button } from '../../primitives/Button';
import './RegistrationForm.css';

export interface RegistrationFormProps {
  eventTitle: string;
  formUrl: string;
  eventFieldId?: string;
  open?: boolean;
  className?: string;
}

export function RegistrationForm({
  eventTitle,
  formUrl,
  eventFieldId,
  open = true,
  className,
}: RegistrationFormProps) {
  
  // If registration is turned off OR the URL hasn't been provided
  if (!open || !formUrl) {
    return (
      <Window title="Registration" meta={eventTitle} className={className}>
        <div className="amees-reg__gate" style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--c-bad)', fontFamily: 'var(--font)', margin: '0 0 var(--sp-2)' }}>
            Registration Closed
          </h3>
          <p className="amees-reg__note" style={{ margin: 0 }}>
            Registration for <b>{eventTitle}</b> is currently closed.
            Please check back later or contact the executive.
          </p>
        </div>
      </Window>
    );
  }

  const targetUrl = buildFormUrl(formUrl, eventFieldId, eventTitle);

  return (
    <Window title="Register" meta={eventTitle} className={className}>
      <div className="amees-reg__gate">
        <p className="amees-reg__lede">
          Registration for <b>{eventTitle}</b> runs through Google Forms.
        </p>
        <p className="amees-reg__note">
          The form asks for your name, matric number, level, and track — plus a
          few extras the exec team needs to plan sessions. Have your matric
          number handy.
        </p>
        <Button
          as="a"
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
        >
          Open registration form →
        </Button>
      </div>
    </Window>
  );
}

function buildFormUrl(
  base: string,
  fieldId: string | undefined,
  eventTitle: string,
): string {
  try {
    const url = new URL(base);
    url.searchParams.set('usp', 'pp_url');
    if (fieldId) {
      url.searchParams.set(`entry.${fieldId}`, eventTitle);
    }
    return url.toString();
  } catch {
    return base;
  }
}