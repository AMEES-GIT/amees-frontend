import './Meter.css';

export type MeterTone = 'default' | 'warn' | 'bad';

export interface MeterProps {
  value: number;
  max: number;
  /** Required. Names what is being measured, e.g. "Storage used" or "Demo checklist". */
  label: string;
  /** Optional. Overrides the auto-derived tone. */
  tone?: MeterTone;
  /** Optional. Shown next to the bar, e.g. "18.2 KB of 40 KB". */
  valueText?: string;
  id?: string;
  className?: string;
}

function autoTone(value: number, max: number): MeterTone {
  if (max <= 0) return 'default';
  const pct = (value / max) * 100;
  if (pct >= 85) return 'bad';
  if (pct >= 60) return 'warn';
  return 'default';
}

export function Meter({
  value,
  max,
  label,
  tone,
  valueText,
  id,
  className,
}: MeterProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.max(0, Math.min(value, safeMax));
  const pct = Math.min(100, Math.max(0, (clamped / safeMax) * 100));
  const finalTone = tone ?? autoTone(value, safeMax);

  return (
    <div
      id={id}
      className={['amees-meter', `amees-meter--${finalTone}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="amees-meter__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={valueText}
      >
        <i className="amees-meter__fill" style={{ width: `${pct}%` }} />
      </div>
      {valueText ? <span className="amees-meter__text">{valueText}</span> : null}
    </div>
  );
}