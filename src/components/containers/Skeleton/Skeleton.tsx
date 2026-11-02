import './Skeleton.css';

export type SkeletonVariant = 'line' | 'block' | 'row';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** For 'line' and 'block': width override. */
  width?: string | number;
  /** For 'block': height override, in px. Default 120. */
  height?: number;
  /** For 'row': number of rows. Default 3. */
  rows?: number;
  className?: string;
}

function px(n: number | string | undefined): string | undefined {
  if (n === undefined) return undefined;
  return typeof n === 'number' ? `${n}px` : n;
}

export function Skeleton({
  variant = 'line',
  width,
  height,
  rows = 3,
  className,
}: SkeletonProps) {
  const cls = ['amees-skeleton', `amees-skeleton--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  if (variant === 'line') {
    return (
      <div className={cls} role="status" aria-label="Loading content">
        <span className="amees-skeleton__bar" style={{ width: px(width) }} />
        <span className="amees-skeleton__bar" style={{ width: px(width) }} />
        <span className="amees-skeleton__bar" style={{ width: px(width) }} />
      </div>
    );
  }

  if (variant === 'block') {
    return (
      <div className={cls} role="status" aria-label="Loading content">
        <span
          className="amees-skeleton__bar"
          style={{ width: px(width), height: height ? `${height}px` : undefined }}
        />
      </div>
    );
  }

  // row
  const count = Math.max(1, rows);
  return (
    <div className={cls} role="status" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="amees-skeleton__bar"
          style={{ width: px(width) }}
        />
      ))}
    </div>
  );
}