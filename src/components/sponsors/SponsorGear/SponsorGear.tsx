import { useEffect, useRef } from 'react';
import { motionAllowed } from '../../../lib/motion';
import { Illustration } from '../../foundations/Illustration';
import './SponsorGear.css';

export interface SponsorItem {
  id: string;
  title: string;
}

export interface SponsorGearProps {
  items: readonly SponsorItem[];
}

export function SponsorGear({ items }: SponsorGearProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const gear = gearRef.current;
    if (!container || !gear || !motionAllowed(container)) return;

    let ctx: { revert: () => void } | undefined;

    import('gsap').then(({ gsap }) => {
      ctx = gsap.context(() => {
        // Spin the gear slowly
        gsap.to(gear, {
          rotation: 360,
          duration: 40, 
          ease: 'none',
          repeat: -1,
        });

        // Counter-rotate the text so it stays upright
        textRefs.current.forEach((text) => {
          if (!text) return;
          gsap.to(text, {
            rotation: -360,
            duration: 40,
            ease: 'none',
            repeat: -1,
          });
        });
      });
    });

    return () => ctx?.revert();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="sponsor-gear-container" ref={containerRef} aria-hidden="true">
      <div className="sponsor-gear" ref={gearRef}>
        
        {/* The big mechanical gear background */}
        <div className="sponsor-gear__illustration">
          <Illustration name="gear" size={500} />
        </div>

        {/* The sponsor names positioned around the rim */}
        {items.map((item, i) => {
          const angle = (i / items.length) * 360;
          return (
            <div
              key={item.id}
              className="sponsor-gear__item-wrapper"
              style={{ transform: `rotate(${angle}deg) translateY(-180px)` }}
            >
              <div
                className="sponsor-gear__text"
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                style={{ transform: `rotate(-${angle}deg)` }}
              >
                {item.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}