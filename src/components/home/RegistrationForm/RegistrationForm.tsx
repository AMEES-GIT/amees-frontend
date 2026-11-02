import { Window } from '../../containers/Window';
import { Button } from '../../primitives/Button';
import './RegistrationForm.css';

export interface RegistrationFormProps {
  /** E.g. "Wired 1.0". Shown in the gate and prefilled into the Google Form. */
  eventTitle: string;
  /** Google Form URL from SiteSettings.eventRegistrationFormUrl. */
  formUrl: string;
  /** Optional: the entry.* ID for the "Event" field, for prefill. */
  eventFieldId?: string;
  /** Whether registration is currently open. Defaults to true. */
  open?: boolean;
  className?: string;
}

/**
 * Registration runs entirely through Google Forms.
 *
 * Why: the exec team already works in Google Sheets, Google's form gives us
 * free spam protection and file uploads if we add them later, and we never
 * have to build a registration database or email pipeline for it.
 *
 * This component is a gate — it tells the student what's going on and opens
 * the form in a new tab, prefilling the event title if an entry ID is set.
 */
export function RegistrationForm({
  eventTitle,
  formUrl,
  eventFieldId,
  open = true,
  className,
}: RegistrationFormProps) {
  if (!open) {
    return (
      <Window title="Register" meta={eventTitle} className={className}>
        <div className="amees-reg__gate">
          <p className="amees-reg__lede">
            Registration for <b>{eventTitle}</b> is closed.
          </p>
          <p className="amees-reg__note">
            Keep an eye on the events page — the next session opens registration
            a few weeks before it starts.
          </p>
        </div>
      </Window>
    );
  }

  if (!formUrl) {
    return (
      <Window title="Register" meta={eventTitle} className={className}>
        <div className="amees-reg__gate">
          <p className="amees-reg__lede">
            Registration isn&rsquo;t set up yet.
          </p>
          <p className="amees-reg__note">
            The exec team is still preparing the form for {eventTitle}. Check
            back soon, or reach out on Instagram.
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

/**
 * Build a Google Forms prefill URL. The `usp=pp_url` query flag tells Google
 * "this is a prefilled link", and `entry.<id>=<value>` sets each prefilled
 * field. Using URL() means we don't break if the base URL already has
 * query params (e.g. ?usp=sf_link from the Copy Link button).
 */
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
    // Malformed URL — open as-is. Better to send students to a broken form
    // than to nothing.
    return base;
  }
}