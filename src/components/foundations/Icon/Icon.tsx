import type { ReactNode } from 'react';
import './Icon.css';

export const ICON_NAMES = [
  'search', 'close', 'star', 'star-filled',
  'arrow-left', 'arrow-right', 'external',
  'sun', 'moon',
] as const;
export type IconName = (typeof ICON_NAMES)[number];

// 18 x 18 grid, square ends and mitred joins to match the hard-edged look.
const STAR = '9,1.6 11.06,6.77 16.61,7.13 12.33,10.68 13.7,16.07 9,13.1 4.3,16.07 5.67,10.68 1.39,7.13 6.94,6.77';

const SHAPES: Record<IconName, ReactNode> = {
  // search is lifted unchanged from the mockup
  search: (
    <>
      <circle cx="7.5" cy="7.5" r="5" strokeWidth="2.5" />
      <path d="M11.5 11.5L16 16" strokeWidth="3" />
    </>
  ),
  close: <path d="M3 3L15 15M15 3L3 15" strokeWidth="3" />,
  star: <polygon points={STAR} strokeWidth="2" />,
  'star-filled': <polygon points={STAR} strokeWidth="2" fill="currentColor" />,
  'arrow-left': <path d="M15 9H4M9 4L4 9l5 5" strokeWidth="3" />,
  'arrow-right': <path d="M3 9h11M9 4l5 5-5 5" strokeWidth="3" />,
  external: (
    <>
      <path d="M7 3H3v12h12v-4" strokeWidth="2.5" />
      <path d="M10 3h5v5M15 3L8 10" strokeWidth="2.5" />
    </>
  ),
  sun: (
  <>
    <circle cx="9" cy="9" r="3.5" />
    <line x1="9" y1="2" x2="9" y2="4" />
    <line x1="9" y1="14" x2="9" y2="16" />
    <line x1="2" y1="9" x2="4" y2="9" />
    <line x1="14" y1="9" x2="16" y2="9" />
    <line x1="4" y1="4" x2="5.5" y2="5.5" />
    <line x1="12.5" y1="12.5" x2="14" y2="14" />
    <line x1="4" y1="14" x2="5.5" y2="12.5" />
    <line x1="12.5" y1="5.5" x2="14" y2="4" />
  </>
  ),
  moon: (
    <path d="M15.75 9.6A6.75 6.75 0 1 1 8.4 2.25 5.25 5.25 0 0 0 15.75 9.6Z" />
  ),
};

export type IconProps = {
  name: IconName;
  /** Width and height in px. */
  size?: number;
  /** Accessible name. Leave out for decorative icons (hidden from screen readers). */
  title?: string;
  className?: string;
};

export function Icon({ name, size = 18, title, className }: IconProps) {
  const label = title?.trim();
  return (
    <svg
      className={className ? `amees-icon ${className}` : 'amees-icon'}
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {SHAPES[name]}
    </svg>
  );
}