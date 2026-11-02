import { forwardRef, type ReactNode } from 'react';
import './Window.css';

export interface WindowProps {
  /** Title shown in the navy title bar. Rendered uppercase bold caps. */
  title: string;
  /** Small text on the right of the title bar, e.g. "4 tracks" or "Africa/Lagos". */
  meta?: string;
  /** Optional action element in the title bar, e.g. a small Button. */
  actions?: ReactNode;
  /** 'gray' uses --bar-blue title bar and --gray body. */
  tone?: 'default' | 'gray';
  /** Adds the decorative right-edge scrollbar (no real scrolling — it's decoration). */
  scrollbar?: boolean;
  children: ReactNode;
  className?: string;
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
  { title, meta, actions, tone = 'default', scrollbar = false, children, className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        'amees-window',
        tone === 'gray' && 'amees-window--gray',
        scrollbar && 'amees-window--scrollbar',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="amees-window__titlebar">
        <span className="amees-window__title">{title}</span>
        {actions ? <div className="amees-window__actions">{actions}</div> : null}
        {meta && !actions ? <span className="amees-window__meta">{meta}</span> : null}
      </div>
      <div className="amees-window__strip" aria-hidden="true" />
      <div className="amees-window__body">
        {scrollbar ? (
          <span className="amees-window__scrollbar" aria-hidden="true">
            <i />
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
});