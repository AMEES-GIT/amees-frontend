import './StageTracker.css';

export const STAGES = [
  'Registered',
  'Project picked',
  'Team formed',
  'Learning',
  'Building',
  'Demo',
];

export interface StageTrackerProps {
  /** The index of the current stage (0 to 5). */
  current: number;
  className?: string;
}

export function StageTracker({ current, className }: StageTrackerProps) {
  return (
    <div className={['amees-stages', className].filter(Boolean).join(' ')} role="list">
      {STAGES.map((stage, i) => {
        const isDone = i < current;
        const isNow = i === current;
        return (
          <div key={stage} className="amees-stg" role="listitem">
            <div
              className={[
                'amees-stg__node',
                isDone && 'amees-stg__node--done',
                isNow && 'amees-stg__node--now',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <span
              className={[
                'amees-stg__label',
                isDone && 'amees-stg__label--done',
                isNow && 'amees-stg__label--now',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {stage}
            </span>
            {/* Connecting line */}
            {i < STAGES.length - 1 && (
              <div
                className={`amees-stg__line ${
                  i < current ? 'amees-stg__line--done' : ''
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}