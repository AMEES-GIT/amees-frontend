import { forwardRef, useId, type CSSProperties, type ReactElement } from 'react';
import './Illustration.css';

export type IllustrationName = 'bulb' | 'chip' | 'board' | 'gear' | 'cactus' | 'bot';

export interface IllustrationProps {
  name: IllustrationName;
  size?: number;
  rotate?: number;
  title?: string;
  className?: string;
  /** Allows absolute positioning and layout tweaks from the parent. */
  style?: CSSProperties;
}

const DEFAULT_WIDTH: Record<IllustrationName, number> = {
  bulb: 72,
  chip: 80,
  board: 140,
  gear: 80,
  cactus: 44,
  bot: 44,
};

const VIEW_BOXES: Record<IllustrationName, string> = {
  bulb: '0 0 120 170',
  chip: '0 0 120 120',
  board: '0 0 200 116',
  gear: '0 0 100 100',
  cactus: '0 0 12 20',
  bot: '0 0 12 14',
};

function Bulb() {
  return (
    <>
      <circle
        cx="60"
        cy="58"
        r="46"
        style={{ fill: 'var(--ill-bulb)', stroke: 'var(--line)', strokeWidth: 4 }}
      />
      <path
        d="M36 42a28 28 0 0 1 22-18"
        style={{ stroke: 'var(--ill-bulb-glow)', strokeWidth: 7, fill: 'none', strokeLinecap: 'round' }}
      />
      <path
        d="M40 98h40l-4 20H44z"
        style={{ fill: 'var(--ill-bulb-base)', stroke: 'var(--line)', strokeWidth: 4, strokeLinejoin: 'round' }}
      />
      <rect x="42" y="118" width="36" height="10" style={{ fill: 'var(--ill-metal)', stroke: 'var(--line)', strokeWidth: 4 }} />
      <rect x="44" y="128" width="32" height="10" style={{ fill: 'var(--ill-metal-dark)', stroke: 'var(--line)', strokeWidth: 4 }} />
      <rect x="47" y="138" width="26" height="10" style={{ fill: 'var(--ill-metal)', stroke: 'var(--line)', strokeWidth: 4 }} />
      <path d="M52 148h16l-3 12H55z" style={{ fill: 'var(--line)' }} />
    </>
  );
}

function Chip() {
  const pin = { fill: 'var(--ill-chip-pin)', stroke: 'var(--line)', strokeWidth: 2 } as CSSProperties;
  return (
    <>
      <g>
        <rect x="26" y="4" width="8" height="16" style={pin} />
        <rect x="46" y="4" width="8" height="16" style={pin} />
        <rect x="66" y="4" width="8" height="16" style={pin} />
        <rect x="86" y="4" width="8" height="16" style={pin} />
        <rect x="26" y="100" width="8" height="16" style={pin} />
        <rect x="46" y="100" width="8" height="16" style={pin} />
        <rect x="66" y="100" width="8" height="16" style={pin} />
        <rect x="86" y="100" width="8" height="16" style={pin} />
        <rect x="4" y="26" width="16" height="8" style={pin} />
        <rect x="4" y="46" width="16" height="8" style={pin} />
        <rect x="4" y="66" width="16" height="8" style={pin} />
        <rect x="4" y="86" width="16" height="8" style={pin} />
        <rect x="100" y="26" width="16" height="8" style={pin} />
        <rect x="100" y="46" width="16" height="8" style={pin} />
        <rect x="100" y="66" width="16" height="8" style={pin} />
        <rect x="100" y="86" width="16" height="8" style={pin} />
      </g>
      <rect x="16" y="16" width="88" height="88" style={{ fill: 'var(--ill-chip-body)', stroke: 'var(--line)', strokeWidth: 4 }} />
      <circle cx="32" cy="32" r="6" style={{ fill: 'var(--ill-chip-dot)' }} />
      <text
        x="60"
        y="70"
        textAnchor="middle"
        fontFamily="'Space Grotesk', Arial, sans-serif"
        fontWeight={700}
        fontSize={24}
        style={{ fill: 'var(--bar-fg)' }}
      >
        A
      </text>
    </>
  );
}

function Board({ uid }: { uid: string }) {
  const dotId = `amees-board-dots-${uid}`;
  return (
    <>
      <defs>
        <pattern id={dotId} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="4" height="4" style={{ fill: 'var(--ill-board-dots)' }} />
        </pattern>
      </defs>
      <path d="M40 22V8h32v14" style={{ fill: 'none', stroke: 'var(--ill-wire-red)', strokeWidth: 5 }} />
      <path d="M150 22V12h-28v10" style={{ fill: 'none', stroke: 'var(--ill-wire-green)', strokeWidth: 5 }} />
      <path d="M170 94v14h-34V94" style={{ fill: 'none', stroke: 'var(--ill-wire-orange)', strokeWidth: 5 }} />
      <rect x="4" y="18" width="192" height="84" style={{ fill: 'var(--ill-board)', stroke: 'var(--line)', strokeWidth: 4 }} />
      <rect x="4" y="52" width="192" height="12" style={{ fill: 'var(--ill-board-stripe)', stroke: 'var(--line)', strokeWidth: 3 }} />
      <rect x="14" y="24" width="172" height="24" fill={`url(#${dotId})`} />
      <rect x="14" y="68" width="172" height="28" fill={`url(#${dotId})`} />
      <circle cx="96" cy="36" r="7" style={{ fill: 'var(--ill-wire-red)', stroke: 'var(--line)', strokeWidth: 3 }} />
      <rect x="56" y="74" width="30" height="9" style={{ fill: 'var(--ill-wire-orange)', stroke: 'var(--line)', strokeWidth: 3 }} />
      <rect x="112" y="68" width="40" height="16" style={{ fill: 'var(--ill-chip-body)', stroke: 'var(--line)', strokeWidth: 3 }} />
    </>
  );
}

function Gear() {
  return (
    <>
      <circle cx="50" cy="50" r="36" style={{ fill: 'none', stroke: 'var(--fill)', strokeWidth: 12, strokeDasharray: '7.07 7.07' }} />
      <circle cx="50" cy="50" r="30" style={{ fill: 'none', stroke: 'var(--fill)', strokeWidth: 12 }} />
      <circle cx="50" cy="50" r="12" style={{ fill: 'none', stroke: 'var(--line)', strokeWidth: 4 }} />
    </>
  );
}

function Cactus() {
  return (
    <g shapeRendering="crispEdges" style={{ fill: 'currentColor' }}>
      <rect x="5" y="0" width="3" height="20" />
      <rect x="1" y="7" width="2" height="7" />
      <rect x="1" y="12" width="5" height="2" />
      <rect x="9" y="3" width="2" height="7" />
      <rect x="7" y="9" width="4" height="2" />
    </g>
  );
}

function Bot() {
  const body = { fill: 'currentColor' } as CSSProperties;
  const eye = { fill: 'var(--bg)' } as CSSProperties;
  return (
    <g shapeRendering="crispEdges">
      <rect x="5" y="0" width="2" height="2" style={body} />
      <rect x="2" y="2" width="8" height="5" style={body} />
      <rect x="4" y="4" width="1" height="2" style={eye} />
      <rect x="7" y="4" width="1" height="2" style={eye} />
      <rect x="3" y="7" width="6" height="4" style={body} />
      <rect x="1" y="7" width="2" height="3" style={body} />
      <rect x="9" y="7" width="2" height="3" style={body} />
      <rect x="3" y="11" width="2" height="3" style={body} />
      <rect x="7" y="11" width="2" height="3" style={body} />
    </g>
  );
}

export const Illustration = forwardRef<SVGSVGElement, IllustrationProps>(
  function Illustration({ name, size, rotate, title, className, style }, ref) {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const width = size ?? DEFAULT_WIDTH[name];
    const base = `amees-ill amees-ill--${name}`;

    let content: ReactElement;
    switch (name) {
      case 'bulb': content = <Bulb />; break;
      case 'chip': content = <Chip />; break;
      case 'board': content = <Board uid={uid} />; break;
      case 'gear': content = <Gear />; break;
      case 'cactus': content = <Cactus />; break;
      case 'bot': content = <Bot />; break;
    }

    // Merge the passed style with the rotation transform
    const mergedStyle: CSSProperties = {
      ...style,
      transform: rotate ? `rotate(${rotate}deg)` : style?.transform,
    };

    return (
      <svg
        ref={ref}
        viewBox={VIEW_BOXES[name]}
        width={width}
        className={className ? `${base} ${className}` : base}
        style={mergedStyle}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
      >
        {content}
      </svg>
    );
  }
);