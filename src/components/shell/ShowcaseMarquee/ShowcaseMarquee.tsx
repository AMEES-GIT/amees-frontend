import { useEffect, useRef } from 'react';
import { motionAllowed } from '../../../lib/motion';
import './ShowcaseMarquee.css';

export interface ShowcaseItem {
  id: string;
  title: string;
  imageUrl?: string;
}

export interface ShowcaseMarqueeProps {
  items: readonly ShowcaseItem[];
  /** Speed in seconds for a full loop. Default 25. */
  speed?: number;
}

export function ShowcaseMarquee({ items, speed = 25 }: ShowcaseMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !motionAllowed(track)) return;

    let ctx: { revert: () => void } | undefined;
    
    import('gsap').then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.to(track, {
          xPercent: -50,
          duration: speed,
          ease: 'none',
          repeat: -1,
        });
      });
    });

    return () => ctx?.revert();
  }, [speed]);

  if (items.length === 0) return null;

  // Triple the array to ensure it fills ultra-wide screens seamlessly
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="showcase-marquee" aria-label="Showcase highlights">
      <div className="showcase-marquee__track" ref={trackRef}>
        {displayItems.map((item, i) => (
          <div key={`${item.id}-${i}`} className="showcase-marquee__item">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="showcase-marquee__logo" />
            ) : (
              <span className="showcase-marquee__name">{item.title}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}