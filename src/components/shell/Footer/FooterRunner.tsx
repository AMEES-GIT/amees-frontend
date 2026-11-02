import { useEffect, useRef } from 'react';
import { motionAllowed } from '../../../lib/motion';
import { Illustration } from '../../foundations/Illustration';

interface Pos { left: string; size: number; height: number }

const CACTI: Pos[] = [
  { left: '34%', size: 20, height: 34 },
  { left: '52%', size: 28, height: 46 },
  { left: '71%', size: 18, height: 30 },
  { left: '88%', size: 24, height: 40 },
];

export interface FooterRunnerProps {
  paused?: boolean;
  className?: string;
}

export function FooterRunner({ paused = false, className }: FooterRunnerProps) {
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = botRef.current;
    if (!el) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    if (paused || !motionAllowed(el)) {
      el.style.transform = 'translateY(0)';
      return;
    }

    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ repeat: -1 });
        tl.to({}, { duration: 2.0 })
          .to(el, { y: -34, duration: 0.34, ease: 'steps(14)' })
          .to(el, { y: 0, duration: 0.46, ease: 'steps(14)' });
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [paused]);

  return (
    <div
      className={['amees-footer-runner', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div ref={botRef} className="amees-footer-runner__bot">
        <Illustration name="bot" size={36} />
      </div>
      {CACTI.map((c, i) => (
        <div
          key={i}
          className="amees-footer-runner__cactus"
          style={{
            left: c.left,
            width: c.size,
            height: c.height,
            color: 'var(--blue)',
          }}
        >
          <Illustration name="cactus" size={c.size} />
        </div>
      ))}
    </div>
  );
}