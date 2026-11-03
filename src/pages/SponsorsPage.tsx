import { Wrap, Block, Grid } from '../components/containers/Layout';
import { PageHeader } from '../components/containers/PageHeader';
import { Window } from '../components/containers/Window';
import { StatGrid, StatTile } from '../components/primitives/StatTile';
import { DotList } from '../components/containers/DotList';
import { Badge } from '../components/primitives/Badge';
import { SponsorEnquiryForm } from '../components/sponsors/SponsorEnquiryForm';
import { SponsorWall } from '../components/sponsors/SponsorsWall';
import { useContent } from '../content/contentProvider';
import './SponsorsPage.css';

export function SponsorsPage() {
  const content = useContent();
  const activeSponsors = content.partners.filter(p => p.active !== false);

  return (
    <Wrap>
      <Block>
        <PageHeader
          className="sponsors-header"
          kicker={content.pages.sponsors.kicker}
          title={content.pages.sponsors.title}
          lede={content.pages.sponsors.lede}
        />
      </Block>

      {activeSponsors.length > 0 && (
        <Block>
          <Window title="Our sponsors" meta={`${activeSponsors.length} on board`}>
            <SponsorWall sponsors={activeSponsors} />
          </Window>
        </Block>
      )}

      <Block>
        <Grid min={320}>
          <Window title="Why partner with us?">
            <p className="sponsors-text">
              By supporting AMEES, you are not just writing a cheque. You are investing in the next generation of Nigerian engineers.
            </p>
            <DotList items={[
              <span key="1"><b>Visibility:</b> Your brand on the site, banners, and event posters.</span>,
              <span key="2"><b>Talent pipeline:</b> Early access to the best project teams for internships.</span>,
              <span key="3"><b>Co-branded builds:</b> Attach your name to a real student project.</span>
            ]} />
          </Window>

          <Window title="Our impact" meta="Live Data">
            <StatGrid>
              {/* Automatically calculated stats based on database counts */}
              <StatTile label="Active members" value={content.impact?.members || '150+'} />
              <StatTile label="Hardware projects" value={content.impact?.projects || '24+'} />
              <StatTile label="Wired attendees" value="80+" />
              <StatTile label="Workshops hosted" value="6" />
            </StatGrid>
            <p className="sponsors-text" style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
              * Members and projects are pulled live from the AMEES portal.
            </p>
          </Window>
        </Grid>
      </Block>

      <Block>
        <h2 className="sponsors-section-title">Ways to Partner</h2>
        <p className="sponsors-text" style={{ marginBottom: 'var(--sp-4)' }}>
          Not everything requires cash. We are always looking for strategic partners to help us grow.
        </p>
        <Grid min={280}>
          <Window title="Host an Intern">
            <p className="sponsors-text">Offer a placement to a 300 or 400-level student. We send you our top shortlisted candidates.</p>
          </Window>
          <Window title="Fund a Project">
            <p className="sponsors-text">Cover the hardware costs for a final-year student build, and we'll brand it as "Sponsored by [Your Company]".</p>
          </Window>
          <Window title="Provide Equipment">
            <p className="sponsors-text">Donate dev boards, sensors, or software licenses that our students can use for their prototypes.</p>
          </Window>
        </Grid>
      </Block>

      <Block>
        <h2 className="sponsors-section-title">Sponsorship Tiers</h2>
        <p className="sponsors-text" style={{ marginBottom: 'var(--sp-4)' }}>
          Financial sponsorship packages. Amounts are agreed with the executive based on the scale of the event.
        </p>
        <div className="sponsors-tiers">
          {content.sponsorTiers.map(tier => (
            <div key={tier.id} className={tier.hot ? 'tier-hot-wrapper' : ''}>
              <Window
                title={tier.name}
                meta={tier.price}
                className={tier.hot ? 'tier-hot' : ''}
              >
                {tier.hot && <Badge tone="info" filled>Most Popular</Badge>}
                <DotList items={tier.features} />
              </Window>
            </div>
          ))}
        </div>
        <p className="sponsors-text" style={{ marginTop: 'var(--sp-4)', fontStyle: 'italic', fontSize: 'var(--fs-sm)' }}>
          Every partnership is flexible. If none of these fit your goals, reach out using the form below and we can build a custom package.
        </p>
      </Block>

      <Block>
        <Grid min={320}>
          <div>
            <h2 className="sponsors-section-title">Start a conversation</h2>
            <SponsorEnquiryForm
              tiers={[...content.sponsorTiers.map(t => t.name), 'Custom / Other']}
              endpoint={`${import.meta.env.VITE_API_URL ?? ''}/api/sponsor-enquiry`}
            />
          </div>
          <Window title="What sponsors get back" tone="gray">
            <DotList items={[
              <span key="1">Logo on the site, banners, and posters</span>,
              <span key="2">A booth at the exhibition</span>,
              <span key="3">First access to connect with top graduating talent</span>,
              <span key="4">A post-event report with photos and metrics</span>
            ]} />
          </Window>
        </Grid>
      </Block>
    </Wrap>
  );
}