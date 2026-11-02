import type { CSSProperties } from 'react';
import { Wrap, Block, Grid, Row } from '../components/containers/Layout';
import { Window } from '../components/containers/Window';
import { RowList } from '../components/containers/RowList';
import { DotList } from '../components/containers/DotList';
import { StepsList } from '../components/containers/StepsList';
import { Button } from '../components/primitives/Button';
import { Illustration } from '../components/foundations/Illustration';
import { Icon } from '../components/foundations/Icon';
import { FeaturedEventSlot } from '../components/home/FeaturedEventSlot';
import { Countdown } from '../components/home/Countdown';
import { CautionTape } from '../components/home/CautionTape';
import { ShowcaseMarquee } from '../components/shell/ShowcaseMarquee/ShowcaseMarquee';
import { useNow } from '../lib/useNow';
import { eventState } from '../lib/eventState';
import { fmtDay } from '../lib/format';
import { useContent, useFeatured } from '../content/contentProvider';
import { weeklyRows } from '../content/selectors';
import type { PageId } from './types';
import './home.css';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

type ArtName = 'chip' | 'bulb' | 'gear' | 'board';

interface ArtPiece {
  name: ArtName;
  style: CSSProperties;
}

const artPieces: ArtPiece[] = [
  { name: 'chip', style: { left: '2%', top: '6%', width: '24%', transform: 'rotate(-8deg)' } },
  { name: 'bulb', style: { left: '34%', top: 0, width: '32%' } },
  { name: 'gear', style: { right: 0, top: '30%', width: '30%', transform: 'rotate(10deg)' } },
  { name: 'board', style: { right: '4%', bottom: '2%', width: '62%', transform: 'rotate(-4deg)' } },
  { name: 'chip', style: { left: '4%', bottom: '12%', width: '20%', transform: 'rotate(14deg)' } },
];

function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      {artPieces.map((p, i) => (
        <div key={`${p.name}-${i}`} style={p.style}>
          <Illustration name={p.name} />
        </div>
      ))}
    </div>
  );
}

function EventHero({ onNavigate }: HomePageProps) {
  const f = useFeatured();
  const now = useNow(1000);
  
  // Handle empty database gracefully
  if (!f) {
    return (
      <div style={{ padding: 'var(--sp-6) 0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font)', color: 'var(--blue)', textTransform: 'uppercase' }}>AMEES</h1>
        <p style={{ fontFamily: 'var(--font)', color: 'var(--muted)' }}>No featured event at the moment.</p>
      </div>
    );
  }

  const state = eventState(now, f.start, f.end);
  const canRegister = f.registrationOpen && state !== 'after';

  return (
    <FeaturedEventSlot
      state={state}
      pre={f.pre}
      title={f.title}
      version={f.version}
      theme={f.theme}
      subtitle={f.subtitle}
      countdown={state === 'before' ? <Countdown target={f.start} now={now} /> : undefined}
      cta={
        <Row>
          {canRegister && (
            <Button variant="primary" onClick={() => onNavigate('events')}>
              Register now
            </Button>
          )}
          <Button onClick={() => onNavigate('calendar')}>See the schedule</Button>
        </Row>
      }
      art={<HeroArt />}
    />
  );
}

function NextUp({ onNavigate }: HomePageProps) {
  const content = useContent();
  const f = useFeatured();
  const now = useNow(60_000);
  const t = now.getTime();
  
  let featuredRow = null;
  if (f) {
    const name = `${f.title} ${f.version}`;
    featuredRow =
      t < f.start.getTime()
        ? { lead: fmtDay(f.start), title: `${name} opens`, meta: f.venue }
        : t < f.end.getTime()
          ? { lead: 'Now', title: `${name} is on`, meta: f.venue }
          : null;
  }

  return (
    <Window title="Next up">
      <RowList rows={[...(featuredRow ? [featuredRow] : []), ...weeklyRows(content)]} />
      <div className="home-actions">
        <Button onClick={() => onNavigate('calendar')}>
          See the full calendar <Icon name="arrow-right" />
        </Button>
      </div>
    </Window>
  );
}

function EventDetails({ onNavigate }: HomePageProps) {
  const f = useFeatured();
  const now = useNow(60_000);
  
  // If no event, or the event has passed, hide details
  if (!f || now.getTime() >= f.end.getTime()) return null;

  return (
    <Block>
      <Grid min={320}>
        <Window title="Programs" meta={`${f.tracks.length} tracks`}>
          <DotList items={f.tracks.map((t) => t.title)} />
          <div className="home-actions">
            <Button onClick={() => onNavigate('events')}>
              Read about the tracks <Icon name="arrow-right" />
            </Button>
          </div>
        </Window>
        <Window title="How to participate" meta={`${f.steps.length} steps`}>
          <StepsList
            items={f.steps.map((s) => (
              <span key={s.lead}>
                <b>{s.lead}</b> {s.text}
              </span>
            ))}
          />
          {f.registrationOpen && (
            <div className="home-actions">
              <Button variant="primary" onClick={() => onNavigate('events')}>
                Register for {f.title} {f.version} <Icon name="arrow-right" />
              </Button>
            </div>
          )}
        </Window>
      </Grid>
    </Block>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { archive, quickLinks, upcoming, sponsorPitch, projects, activeMarquee } = useContent();

  const archiveRows = archive.slice(0, 3).map((f) => ({
    lead: f.ext,
    title: f.title,
    meta: `${f.course} · ${f.kind}`,
  }));
  const archiveIsSample = archive.slice(0, 3).some((f) => f.sample);

  // Determine which marquee to show based on the content flag
  const showcaseItems = projects?.projects
    ?.filter(p => p.showcased)
    .map(p => ({
      id: p.id,
      title: p.title,
    })) || [];

  return (
    <>
      <Wrap>
        <EventHero onNavigate={onNavigate} />
      </Wrap>

      {/* Swap between CautionTape and ShowcaseMarquee based on the activeMarquee flag */}
      {activeMarquee === 'showcase' && showcaseItems.length > 0 ? (
        <ShowcaseMarquee items={showcaseItems} />
      ) : (
        <CautionTape />
      )}

      <Wrap>
        <EventDetails onNavigate={onNavigate} />
        <Block>
          <Grid min={320}>
            <NextUp onNavigate={onNavigate} />
            <Window title="Latest in the archive" meta={archiveIsSample ? 'sample listing' : undefined}>
              <RowList rows={archiveRows} />
              <div className="home-actions">
                <Button onClick={() => onNavigate('archive')}>
                  Browse the archive <Icon name="arrow-right" />
                </Button>
              </div>
            </Window>
          </Grid>
        </Block>

        <Block>
          <Window title="Around AMEES" meta="all year">
            <Row>
              {quickLinks.map((q) => (
                <Button key={q.id} onClick={() => onNavigate(q.id)}>
                  {q.cta}
                </Button>
              ))}
            </Row>
          </Window>
        </Block>

        {upcoming.length > 0 && (
          <Block>
            <Window title="Later this year">
              <DotList
                items={upcoming.map((e) => (
                  <span key={e.id}>
                    <b>{e.title}</b>. {e.text}
                  </span>
                ))}
              />
            </Window>
          </Block>
        )}

        {sponsorPitch?.title && (
          <Block>
            <Window title={sponsorPitch.title} meta="sponsors" tone="gray">
              <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', marginBottom: 'var(--sp-4)', maxWidth: '60ch' }}>
                {sponsorPitch.text}
              </p>
              <Button variant="primary" onClick={() => onNavigate('sponsors')}>
                {sponsorPitch.cta} <Icon name="arrow-right" />
              </Button>
            </Window>
          </Block>
        )}
      </Wrap>
    </>
  );
}