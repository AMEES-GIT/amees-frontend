import type { Partner } from '../../content/types';
import './SponsorWall.css';

export interface SponsorWallProps {
  sponsors: readonly Partner[];
}

export function SponsorWall({ sponsors }: SponsorWallProps) {
  const visible = sponsors.filter((s) => s.active !== false);
  if (visible.length === 0) return null;

  return (
    <ul className="sponsor-wall" aria-label="Our sponsors">
      {visible.map((sponsor) => {
        const logo = sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="sponsor-wall__logo"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="sponsor-wall__name">{sponsor.name}</span>
        );

        return (
          <li key={sponsor.id} className="sponsor-wall__item">
            {sponsor.websiteUrl ? (
              <a
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sponsor.name}
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}