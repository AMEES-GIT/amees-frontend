import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { motionAllowed } from '../../../lib/motion';
import './Button.css';

type Common = {
  variant?: 'default' | 'primary';
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string; 
  children: ReactNode;
};

type AsButton = Common & {
  as?: 'button';
  /** Toggle state. Renders aria-pressed. Buttons only. */
  pressed?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  href?: never;
  LinkComponent?: never;
};

type AsLink = Common & {
  as: 'a';
  href: string;
  LinkComponent?: ElementType;
  target?: string;
  rel?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export type ButtonProps = AsButton | AsLink;

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'default', size = 'md', disabled = false, loading = false, className, children } = props;
  const inert = disabled || loading;

  const rootRef = useRef<HTMLElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Loading indicator: GSAP loop, scoped, loaded only when needed, reverted on cleanup.
  useEffect(() => {
    const root = rootRef.current;
    if (!loading || !root || !motionAllowed(root)) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const dots = root.querySelectorAll('.amees-btn__dot'); // elements, not a selector string: iframe-safe
        gsap.fromTo(
          dots,
          { opacity: 0.25 },
          { opacity: 1, duration: 0.6, stagger: 0.2, repeat: -1, yoyo: true, ease: 'steps(2)' },
        );
      }, root);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [loading]);

  const classes = [
    'amees-btn',
    variant === 'primary' && 'amees-btn--primary',
    size === 'sm' && 'amees-btn--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (inert) {
      event.preventDefault();
      return;
    }
    (props.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
  };

  const content = (
    <>
      <span className="amees-btn__label">{children}</span>
      {loading && (
        <>
          <span className="amees-btn__dots" aria-hidden="true">
            <span className="amees-btn__dot" />
            <span className="amees-btn__dot" />
            <span className="amees-btn__dot" />
          </span>
          <span className="amees-btn__sr">, loading</span>
        </>
      )}
    </>
  );

  if (props.as === 'a') {
    const Tag: ElementType = props.LinkComponent ?? 'a';
    return (
      <Tag
        ref={setRefs}
        className={classes}
        // A link can't be disabled. Drop href, keep it announced as a disabled link.
        href={inert ? undefined : props.href}
        role={inert ? 'link' : undefined}
        aria-disabled={inert || undefined}
        aria-busy={loading || undefined}
        onClick={handleClick}
      >
        {content}
      </Tag>
    );
  }

  return (
    <button
      ref={setRefs}
      className={classes}
      type={props.type ?? 'button'}
      disabled={disabled}
      // Loading keeps focus (aria-disabled), real disabled does not.
      aria-disabled={loading && !disabled ? true : undefined}
      aria-busy={loading || undefined}
      aria-pressed={props.pressed}
      onClick={handleClick}
    >
      {content}
    </button>
  );
});