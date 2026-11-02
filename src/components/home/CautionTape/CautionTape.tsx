import { useEffect, useRef } from 'react';
import { motionAllowed } from '../../../lib/motion';
import './CautionTape.css';

export interface CautionTapeProps {
  /** Words to repeat across the tape. Default ["REGISTER!", "ATTEND!", "ANTICIPATE!"]. */
  words?: string[];
  /** Pauses the animation if true. */
  paused?: boolean;
  className?: string;
}

const DEFAULT_WORDS = ['REGISTER!', 'ATTEND!', 'ANTICIPATE!'];

// Repeats the words enough times so the tape never shows a gap while scrolling.
function buildString(words: string[]): string {
  const seq = words.map((w) => `${w}\u00a0\u00a0\u00a0`).join('');
  return seq.repeat(8);
}

export function CautionTape({ words = DEFAULT_WORDS, paused = false, className }: CautionTapeProps) {
  const tapeARef = useRef<HTMLDivElement>(null);
  const tapeBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = tapeARef.current;
    const b = tapeBRef.current;
    if (!a || !b) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    if (paused || !motionAllowed(a)) {
      return;
    }

    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Scroll left
        gsap.to(a, {
          xPercent: -50,
          duration: 26,
          ease: 'none',
          repeat: -1,
        });
        // Scroll right
        gsap.to(b, {
          xPercent: -50,
          duration: 32,
          ease: 'none',
          repeat: -1,
          startAt: { xPercent: -50 },
        });
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [paused]);

  const text = buildString(words);

  return (
    <div className={['amees-tapes', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className="amees-tape amees-tape--a">
        <div ref={tapeARef} className="amees-tape__run">
          <span className="amees-tape__text">{text}</span>
        </div>
      </div>
      <div className="amees-tape amees-tape--b">
        <div ref={tapeBRef} className="amees-tape__run">
          <span className="amees-tape__text">{text}</span>
        </div>
      </div>
    </div>
  );
}