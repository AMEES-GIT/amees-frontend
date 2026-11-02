import type { ReactNode } from 'react';
import './FeaturedEventSlot.css';

export type FeaturedEventState = 'before' | 'during' | 'after';

export interface FeaturedEventSlotProps {
  state: FeaturedEventState;
  /** Small kicker text above the title. */
  pre: ReactNode;
  /** Large title, e.g. "WIRED". */
  title: string;
  /** Version or number, e.g. "1.0". */
  version?: string;
  /** Theme line, e.g. "Connecting minds through innovation". */
  theme?: ReactNode;
  /** Subtitle below the title, e.g. "LCU's largest hardware tech bootcamp". */
  subtitle?: ReactNode;
  /** Slot for the countdown component. */
  countdown?: ReactNode;
  /** Slot for the CTA buttons (usually Register / See schedule). */
  cta?: ReactNode;
  /** Slot for the illustration composition. */
  art?: ReactNode;
  className?: string;
}

export function FeaturedEventSlot({
  state,
  pre,
  title,
  version,
  theme,
  subtitle,
  countdown,
  cta,
  art,
  className,
}: FeaturedEventSlotProps) {
  return (
    <div className={['amees-featured', `amees-featured--${state}`, className].filter(Boolean).join(' ')}>
      <div className="amees-featured__content">
        <p className="amees-featured__pre">{pre}</p>
        
        <h1 className="amees-featured__title">{title}</h1>
        
        {(version || theme) && (
          <div className="amees-featured__ver">
            {version && <span className="amees-featured__big">{version}</span>}
            {theme && (
              <p className="amees-featured__th">
                <b>Theme:</b> {theme}
              </p>
            )}
          </div>
        )}

        {subtitle && <p className="amees-featured__sub">{subtitle}</p>}

        {state !== 'after' && countdown && (
          <div className="amees-featured__countdown">{countdown}</div>
        )}

        {cta && <div className="amees-featured__cta">{cta}</div>}
      </div>

      {art && (
        <div className="amees-featured__art" aria-hidden="true">
          {art}
        </div>
      )}
    </div>
  );
}