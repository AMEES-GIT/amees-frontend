import './Countdown.css';

export interface CountdownProps {
  /** ISO date string or Date object for the target time. */
  target: string | Date;
  /** ISO date string or Date object for "now". Passed as a prop so time can be frozen. */
  now: string | Date;
  /** Label above the four cells. Default "Starts in". */
  prefix?: string;
  /** Text shown when the target time has passed. */
  endedText?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

function diff(target: string | Date, now: string | Date): TimeLeft {
  const t = new Date(target).getTime();
  const n = new Date(now).getTime();
  const ms = t - n;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  const seconds = Math.floor((ms / 1_000) % 60);
  return { days, hours, minutes, seconds, ended: false };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function Countdown({
  target,
  now,
  prefix = 'Starts in',
  endedText = 'Event has ended',
  className,
}: CountdownProps) {
  const time = diff(target, now);

  if (time.ended) {
    return (
      <div className={['amees-countdown-ended', className].filter(Boolean).join(' ')}>
        <p className="amees-countdown-ended__text" role="timer">
          {endedText}
        </p>
      </div>
    );
  }

  return (
    <div className={['amees-countdown', className].filter(Boolean).join(' ')}>
      <p className="amees-countdown__prefix">{prefix}</p>
      <div className="amees-countdown__grid" role="timer" aria-label={`Time remaining: ${time.days} days, ${time.hours} hours`}>
        <div className="amees-countdown__cell">
          <span className="amees-countdown__num">{pad(time.days)}</span>
          <span className="amees-countdown__unit">Days</span>
        </div>
        <div className="amees-countdown__cell">
          <span className="amees-countdown__num">{pad(time.hours)}</span>
          <span className="amees-countdown__unit">Hrs</span>
        </div>
        <div className="amees-countdown__cell">
          <span className="amees-countdown__num">{pad(time.minutes)}</span>
          <span className="amees-countdown__unit">Min</span>
        </div>
        <div className="amees-countdown__cell">
          <span className="amees-countdown__num">{pad(time.seconds)}</span>
          <span className="amees-countdown__unit">Sec</span>
        </div>
      </div>
    </div>
  );
}