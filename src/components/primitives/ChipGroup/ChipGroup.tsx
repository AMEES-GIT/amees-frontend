import { useId } from 'react';
import { Button } from '../Button';
import './ChipGroup.css';

export interface ChipItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CommonProps {
  /** Required. Names the group for screen readers, e.g. "Level" or "Opportunity type". */
  label: string;
  items: readonly ChipItem[];
  /** Renders above the chips as a visible label. Default true. */
  showLabel?: boolean;
  id?: string;
  className?: string;
}

export type ChipGroupProps = CommonProps &
  (
    | { mode?: 'single'; value: string; onChange: (value: string) => void }
    | { mode: 'multi'; value: readonly string[]; onChange: (value: string[]) => void }
  );

export function ChipGroup(props: ChipGroupProps) {
  const autoId = useId();
  const groupId = props.id ?? autoId;
  const mode = props.mode ?? 'single';
  const showLabel = props.showLabel ?? true;

  const isPressed = (v: string): boolean => {
    if (mode === 'multi') {
      return (props.value as readonly string[]).includes(v);
    }
    return props.value === v;
  };

  const handleClick = (v: string) => {
    if (mode === 'multi') {
      const current = props.value as readonly string[];
      const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      (props.onChange as (value: string[]) => void)(next);
    } else {
      (props.onChange as (value: string) => void)(v);
    }
  };

  return (
    <div className={['amees-chips', props.className].filter(Boolean).join(' ')}>
      {showLabel ? (
        <span className="amees-chips__label" id={`${groupId}-label`}>
          {props.label}
        </span>
      ) : null}
      <div
        className="amees-chips__row"
        role="group"
        aria-label={props.label}
        aria-labelledby={showLabel ? `${groupId}-label` : undefined}
      >
        {props.items.map((item) => (
          <Button
            key={item.value}
            size="sm"
            pressed={isPressed(item.value)}
            disabled={item.disabled}
            onClick={() => handleClick(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}