import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';
import { useContent } from '../content/contentProvider';
import { fmtDay } from '../lib/format';
import type { PageId } from './types';

export function CalendarEventPage({ eventId, onNavigate }: { eventId: string; onNavigate: (p: PageId) => void }) {
  const content = useContent();
  const event = content.calendarEntries.find(e => e.id === eventId);
  const weekly = content.weekly.find(w => w.id === eventId);

  if (!event && !weekly) {
    return (
      <Wrap>
        <Block>
          <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>Event not found.</div>
          <Button onClick={() => onNavigate('calendar')}>Back to Calendar</Button>
        </Block>
      </Wrap>
    );
  }

  const title = event ? event.title : weekly!.title;
  // Use `event.day` instead of `event.date`
  const date = event ? fmtDay(new Date(event.day)) : (weekly!.weekday !== undefined ? `Every ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekly!.weekday]}` : 'Recurring');
  const desc = event ? (event.description || 'No description provided.') : weekly!.text;
  const type = event ? event.type : 'default';

  return (
    <Wrap>
      <Block>
        {/* Wrap the button in a div for spacing instead of using 'style' */}
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Button variant="default" onClick={() => onNavigate('calendar')}>
            ← Back to Calendar
          </Button>
        </div>
        <PageHeader 
          kicker="Event Details"
          title={title}
          lede={date}
        />
      </Block>

      <Block>
        <Window title="About this event" meta={type.toUpperCase()}>
          <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>
            {desc}
          </p>
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Badge tone={type === 'special' ? 'info' : 'neutral'} kind="tag">
              {type === 'special' ? 'Special Event' : type === 'holiday' ? 'Holiday' : 'Regular Session'}
            </Badge>
          </div>
        </Window>
      </Block>
    </Wrap>
  );
}