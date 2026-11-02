import { Window } from '../../containers/Window';
import { Meter } from '../../primitives/Meter';
import type { calculateHealth } from '../../../lib/workbench/health';
import './HealthCard.css';

type HealthData = ReturnType<typeof calculateHealth>;

export interface HealthCardProps {
  health: HealthData;
  className?: string;
}

export function HealthCard({ health, className }: HealthCardProps) {
  return (
    <Window title="Build health" meta={health.tier} className={className}>
      <div className="amees-health">
        <div className="amees-health__score">
          {health.total}
          <span className="amees-health__max"> / 100</span>
        </div>

        <div className="amees-health__breakdown">
          {health.breakdown.map(b => (
            <div key={b.label} className="amees-health__row">
              <span className="amees-health__label">{b.label}</span>
              <span className="amees-health__val">{Math.round(b.score)} / {b.max}</span>
              <div className="amees-health__meter">
                <Meter label={b.label} value={b.score} max={b.max} tone="default" />
              </div>
            </div>
          ))}
          
          {health.penalty > 0 && (
            <div className="amees-health__row amees-health__row--penalty">
              <span className="amees-health__label">Old open blockers</span>
              <span className="amees-health__val">−{health.penalty}</span>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}