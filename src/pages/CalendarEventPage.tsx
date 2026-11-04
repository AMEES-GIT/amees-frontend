import { Wrap, Block } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';
import { AmeesLive, type LiveEvent } from '../components/home/LiveWindow/LiveWindow';
import { useContent } from '../content/contentProvider';
import { fmtDay } from '../lib/format';
import type { PageId } from './types';
import { useNow } from '../lib/useNow';

export function CalendarEventPage({ eventId, onNavigate }: { eventId: string; onNavigate: (p: PageId) => void }) {
  const content = useContent();
  const now = useNow(60000);
  
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

  // --- LIVE STATUS CHECK ---
  const nowTime = now.getTime();
  let liveEvent: LiveEvent | null = null;

  if (event) {
    const startStr = `${event.day}T${event.startTime || '00:00'}:00`;
    const endStr = event.endDate || `${event.day}T${event.endTime || '23:59'}:00`;
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (nowTime >= start.getTime() && nowTime <= end.getTime()) {
      liveEvent = {
        title: event.title,
        subtitle: event.description,
        venue: event.venue || undefined,
        start: start.toISOString(),
        end: end.toISOString(),
        joinUrl: event.joinUrl || undefined,
        registrationUrl: event.registrationUrl || undefined,
      };
    }
  } else if (weekly) {
    if (weekly.weekday === now.getDay() && weekly.startTime && weekly.endTime) {
      const [h1, m1] = weekly.startTime.split(':').map(Number);
      const [h2, m2] = weekly.endTime.split(':').map(Number);
      const start = new Date(now); start.setHours(h1, m1, 0, 0);
      const end = new Date(now); end.setHours(h2, m2, 0, 0);
      
      if (nowTime >= start.getTime() && nowTime <= end.getTime()) {
        liveEvent = {
          title: weekly.title,
          subtitle: weekly.text,
          venue: weekly.venue || undefined,
          start: start.toISOString(),
          end: end.toISOString(),
          joinUrl: weekly.joinUrl || undefined,
          registrationUrl: weekly.registrationUrl || undefined,
        };
      }
    }
  }

  // --- RENDER DETAILS ---
  const title = event ? event.title : weekly!.title;
  const dateStr = event ? fmtDay(new Date(event.day)) : (weekly!.weekday !== undefined ? `Every ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekly!.weekday]}` : 'Recurring');
  const timeStr = event ? `${event.startTime || 'TBD'} - ${event.endTime || 'TBD'}` : `${weekly!.startTime || 'TBD'} - ${weekly!.endTime || 'TBD'}`;
  const venue = event ? event.venue : weekly!.venue;
  const desc = event ? (event.description || 'No description provided.') : weekly!.text;
  const type = event ? event.type : 'default';

  return (
    <Wrap>
      <Block>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Button variant="default" onClick={() => onNavigate('calendar')}>
            ← Back to Calendar
          </Button>
        </div>
        <PageHeader 
          kicker="Event Details"
          title={title}
          lede={dateStr}
        />
      </Block>

      {/* Render Live Window if this specific event is happening now */}
      {liveEvent && (
        <Block>
          <AmeesLive event={liveEvent} />
        </Block>
      )}

      <Block>
        <Window title="About this event" meta={type.toUpperCase()}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ flex: '1 1 200px' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Time</span>
              <p style={{ margin: '4px 0 0', fontFamily: 'var(--font)', fontSize: 'var(--fs-md)' }}>{timeStr}</p>
            </div>
            {venue && (
              <div style={{ flex: '1 1 200px' }}>
                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Venue</span>
                <p style={{ margin: '4px 0 0', fontFamily: 'var(--font)', fontSize: 'var(--fs-md)' }}>{venue}</p>
              </div>
            )}
          </div>

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