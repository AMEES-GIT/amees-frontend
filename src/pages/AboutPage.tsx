import { Wrap, Block, Grid, Row } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { Button } from '../components/primitives/Button';
import { useContent } from '../content/contentProvider';
import type { PageId } from './types';
import './AboutPage.css';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const content = useContent();
  const { about } = content;

  return (
    <Wrap>
      <Block>
        <PageHeader 
          className="about-header"
          kicker={content.pages.about.kicker} 
          title={content.pages.about.title} 
          lede={content.pages.about.lede} 
        />
      </Block>

      <Block>
        <Grid min={320}>
          <Window title="Our identity" meta={`Founded ${about.founded}`}>
            <div className="about-identity">
              <p className="about-motto">"{about.motto}"</p>
              <p className="about-text">{about.description}</p>
            </div>
          </Window>

          <Window title="What we do">
            <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
              {about.pillars.map((p: { title: string; text: string }) => (
                <div key={p.title}>
                  <h3 style={{ fontFamily: 'var(--font)', margin: '0 0 var(--sp-1)', color: 'var(--blue)' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font)', margin: 0, fontSize: 'var(--fs-md)' }}>
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </Window>
        </Grid>
      </Block>

      <Block>
        <Window title="The Executive" meta="2025/2026 session">
          <div className="about-exec-grid">
            {about.executive.map((member) => {
              const initials = member.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              // If they have a LinkedIn, wrap the card in an <a> tag, otherwise use <div>
              const CardWrapper = member.linkedin ? 'a' : 'div';
              const wrapperProps = member.linkedin 
                ? { href: member.linkedin, target: '_blank', rel: 'noopener noreferrer' } 
                : {};

              return (
                <CardWrapper 
                  key={member.role} 
                  className="about-exec-card" 
                  {...wrapperProps}
                >
                  <div className="about-exec-avatar">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="about-exec-role">{member.role}</div>
                  <div className="about-exec-name">{member.name}</div>
                </CardWrapper>
              );
            })}
          </div>
        </Window>
      </Block>

      <Block>
        <Window title="Join us" tone="gray">
          <p style={{ fontFamily: 'var(--font)', fontSize: 'var(--fs-body)', marginBottom: 'var(--sp-4)' }}>
            First-year or final-year, if you build things or want to, you belong here. Start with the Wired bootcamp.
          </p>
          <Row>
            <Button variant="primary" onClick={() => onNavigate('events')}>
              Register for Wired 1.0 →
            </Button>
          </Row>
        </Window>
      </Block>
    </Wrap>
  );
}