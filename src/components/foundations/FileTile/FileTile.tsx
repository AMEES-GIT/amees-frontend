export interface FileTileProps {
  /** Short type label, e.g. "PDF", "PPT", "DOC", "ZIP". */
  type: string;
  className?: string;
}

export function FileTile({ type, className }: FileTileProps) {
  return (
    <svg
      viewBox="-2 -2 44 50"
      width={44}
      height={50}
      role="img"
      aria-label={`${type} file`}
      className={['amees-file-tile', className].filter(Boolean).join(' ')}
      style={{ flex: 'none', display: 'block' }}
    >
      {/* Fold triangle — drawn first so the body's diagonal border covers its inner edge */}
      <path
        d="M 26 0 L 40 0 L 40 14 Z"
        fill="color-mix(in srgb, var(--panel) 65%, var(--line))"
        stroke="var(--line)"
        strokeWidth={3}
        strokeLinejoin="miter"
      />
      {/* Body with cut top-right corner */}
      <path
        d="M 0 0 L 26 0 L 40 14 L 40 46 L 0 46 Z"
        fill="var(--panel)"
        stroke="var(--line)"
        strokeWidth={3}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      {/* Type label — below the fold, centred on the visible body */}
      <text
        x="19"
        y="31"
        textAnchor="middle"
        fontFamily="var(--font)"
        fontWeight={700}
        fontSize={9}
        fill="var(--fg)"
      >
        {type}
      </text>
    </svg>
  );
}