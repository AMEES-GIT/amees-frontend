import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '../../containers/ConfirmDialog';
import { useNow } from '../../../lib/useNow';
import './LiveWindow.css';

export interface LiveEvent {
  title: string;
  subtitle?: string;
  theme?: string;
  venue?: string;
  start: string;
  end: string;
  joinUrl?: string;
  registrationUrl?: string;
}

export function AmeesLive({ event }: { event: LiveEvent }) {
  const now = useNow(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  const duration = end - start;
  
  // The "ending soon" phase lasts for the last 10 minutes (or 20% of a short event)
  const endingThreshold = Math.min(10 * 60000, duration * 0.2);
  const nowTime = now.getTime();
  
  let state: 'upcoming' | 'live' | 'ending' | 'ended' = 'upcoming';
  if (nowTime >= end) state = 'ended';
  else if (nowTime >= start) {
    state = (end - nowTime) <= endingThreshold ? 'ending' : 'live';
  }

  const msLeft = state === 'upcoming' ? start - nowTime : end - nowTime;
  const msElapsed = nowTime - start;
  
  const formatHms = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map(v => String(v).padStart(2, '0'));
  };
  
  const digits = formatHms(state === 'upcoming' ? msLeft : state === 'ended' ? duration : state === 'ending' ? msLeft : msElapsed);

  // Oscilloscope drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = (time: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'var(--scope-grid, #2A2370)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += w / 10) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += h / 4) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      const t = time / 1000;
      const amp = (state === 'live' ? 0.34 : state === 'ending' ? 0.16 : 0) * h;
      const mid = h / 2;

      ctx.strokeStyle = state === 'live' ? 'var(--scope-line, #6CF2C2)' : state === 'ending' ? '#F6D44B' : '#8A86B8';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      
      if (state === 'upcoming') ctx.setLineDash([8, 6]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      for (let i = 0; i <= w; i += 2) {
        const p = (i / w) * Math.PI * 6 + (isReduced ? 0 : t * 5);
        let v = amp * (Math.sin(p) * 0.7 + Math.sin(p * 2.3 + 1) * 0.3);
        if (state === 'ending') v *= 0.6 + 0.4 * Math.sin(t * 2);
        const py = mid + v;
        if (i === 0) ctx.moveTo(i, py);
        else ctx.lineTo(i, py);
      }
      ctx.stroke();

      if (!isReduced && !document.hidden && (state === 'live' || state === 'ending')) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [state]);

  const texts = {
    upcoming: { air: 'Standby', tape: 'Standby • Starting soon • ', lab: 'Starts in', status: 'Not started yet.', sig: 'NO SIGNAL', note: `This card goes live on its own at ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` },
    live: { air: 'On air', tape: 'Live now • Happening right now • ', lab: 'Running for', status: 'Live now.', sig: 'SIGNAL OK', note: '' },
    ending: { air: 'Wrapping up', tape: 'Final minutes • Wrapping up • ', lab: 'Time left', status: 'Wrapping up. Ends soon.', sig: 'SIGNAL FADING', note: '' },
    ended: { air: 'Off air', tape: 'Signal lost • See you at the next one • ', lab: 'Ran for', status: 'This event has ended. Thanks to everyone who came.', sig: 'NO SIGNAL', note: '' }
  }[state];

  const pct = Math.min(100, Math.max(0, ((nowTime - start) / duration) * 100));

  const handleJoinClick = () => setJoinModalOpen(true);

  const confirmJoin = () => {
    if (event.joinUrl) window.open(event.joinUrl, '_blank');
    setJoinModalOpen(false);
  };

  return (
    <section className="amees-live" data-state={state}>
      <div className="amees-live__topbar">
        <span className="amees-live__air">
          <span className="amees-live__led" aria-hidden="true" />
          <span>{texts.air}</span>
        </span>
        <span className="amees-live__mid">{event.title}</span>
      </div>

      <div className="amees-live__tape" aria-hidden="true">
        <div className="amees-live__tape-run">
          {Array.from({ length: 8 }).map((_, i) => <span key={i}>{texts.tape}</span>)}
        </div>
      </div>

      <div className="amees-live__body">
        <div>
          <div className="amees-live__kick">{event.theme || 'Live Event'}</div>
          <h2 className="amees-live__title">{event.subtitle || event.title}</h2>
          
          <ul className="amees-live__facts">
            {event.venue && <li><b>Where</b><span>{event.venue}</span></li>}
            <li>
              <b>When</b>
              <span>
                {new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WAT
              </span>
            </li>
          </ul>
          <p className="amees-live__status">{texts.status}</p>
        </div>

        <div>
          <div className="amees-live__scope">
            <canvas ref={canvasRef} aria-hidden="true" />
            <span className="amees-live__scope-tag">{texts.sig}</span>
            <span className="amees-live__scope-tag amees-live__scope-tag--r">CH1</span>
          </div>

          <div className="amees-live__timer">
            <span className="amees-live__timer-lab">{texts.lab}</span>
            <div className="amees-live__digits" aria-hidden="true">
              <span className="d">{digits[0]}</span><span className="c">:</span>
              <span className="d">{digits[1]}</span><span className="c">:</span>
              <span className="d">{digits[2]}</span>
            </div>
            <span className="amees-live__timer-left">{state === 'live' ? `${Math.ceil(msLeft / 60000)} min left` : ''}</span>
          </div>

          <div aria-hidden="true">
            <div className="amees-live__rule">
              <i className="amees-live__rule-ticks" style={{ '--tick': `${(10 * 60000 / duration) * 100}%` } as any} />
              <i className="amees-live__rule-fill" style={{ '--pct': `${pct}%` } as any} />
              <i className="amees-live__rule-needle" style={{ '--pct': `${pct}%` } as any} />
            </div>
            <div className="amees-live__rule-labels">
              <span>Start</span>
              <span>{Math.round(duration / 60000)} min</span>
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      <div className="amees-live__footer">
        {state === 'live' || state === 'ending' ? (
          <button type="button" className="amees-btn amees-btn--primary" onClick={handleJoinClick}>
            Join Now
          </button>
        ) : state === 'upcoming' && event.registrationUrl ? (
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="amees-btn amees-btn--primary">
            Register Now
          </a>
        ) : null}
        <span className="amees-live__note">{texts.note}</span>
      </div>

      <ConfirmDialog 
        open={joinModalOpen}
        title="Join Event"
        body="Are you sure you want to join the live session? You will be redirected to the meeting link."
        confirmLabel="Join"
        onConfirm={confirmJoin}
        onCancel={() => setJoinModalOpen(false)}
      />
    </section>
  );
}