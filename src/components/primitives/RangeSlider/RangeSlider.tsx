import { forwardRef, useId } from 'react';
import './RangeSlider.css';

export interface RangeSliderProps {
  /** Label text, rendered uppercase bold caps to the left of the current value. */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** Default 1. */
  step?: number;
  /**
   * Format the display of the current value (e.g. "1.5 s", "60%").
   * Also set as `aria-valuetext` so screen readers announce the same text.
   * Defaults to `String(value)`.
   */
  format?: (value: number) => string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  function RangeSlider(
    { label, value, onChange, min, max, step, format, disabled, id, className },
    ref,
  ) {
    const autoId = useId();
    const finalId = id ?? autoId;
    const display = format ? format(value) : String(value);

    return (
      <div className={['amees-range', className].filter(Boolean).join(' ')}>
        <div className="amees-range__header">
          <label className="amees-range__label" htmlFor={finalId}>
            {label}
          </label>
          <span className="amees-range__value" aria-hidden="true">
            {display}
          </span>
        </div>
        <input
          ref={ref}
          id={finalId}
          type="range"
          className="amees-range__input"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={format ? display : undefined}
        />
      </div>
    );
  },
);