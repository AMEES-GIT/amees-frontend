import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './LoadingOverlay.css';

export interface LoadingOverlayProps {
  open: boolean;
  minMs: number;
  ready: boolean; 
  onDone: () => void;
}

const GEAR_A_PATH = 'M77.8 50.2 L88.7 51.0 L88.7 57.0 L77.8 57.8 L77.6 59.1 L77.3 60.4 L77.0 61.8 L76.6 63.1 L76.2 64.4 L75.7 65.6 L84.7 71.8 L81.7 76.9 L71.9 72.1 L71.0 73.2 L70.2 74.2 L69.2 75.2 L68.2 76.2 L67.2 77.0 L66.1 77.9 L70.9 87.7 L65.8 90.7 L59.6 81.7 L58.4 82.2 L57.1 82.6 L55.8 83.0 L54.4 83.3 L53.1 83.6 L51.8 83.8 L51.0 94.7 L45.0 94.7 L44.2 83.8 L42.9 83.6 L41.6 83.3 L40.2 83.0 L38.9 82.6 L37.6 82.2 L36.4 81.7 L30.2 90.7 L25.1 87.7 L29.9 77.9 L28.8 77.0 L27.8 76.2 L26.8 75.2 L25.8 74.2 L25.0 73.2 L24.1 72.1 L14.3 76.9 L11.3 71.8 L20.3 65.6 L19.8 64.4 L19.4 63.1 L19.0 61.8 L18.7 60.4 L18.4 59.1 L18.2 57.8 L7.3 57.0 L7.3 51.0 L18.2 50.2 L18.4 48.9 L18.7 47.6 L19.0 46.2 L19.4 44.9 L19.8 43.6 L20.3 42.4 L11.3 36.2 L14.3 31.1 L24.1 35.9 L25.0 34.8 L25.8 33.8 L26.8 32.8 L27.8 31.8 L28.8 31.0 L29.9 30.1 L25.1 20.3 L30.2 17.3 L36.4 26.3 L37.6 25.8 L38.9 25.4 L40.2 25.0 L41.6 24.7 L42.9 24.4 L44.2 24.2 L45.0 13.3 L51.0 13.3 L51.8 24.2 L53.1 24.4 L54.4 24.7 L55.8 25.0 L57.1 25.4 L58.4 25.8 L59.6 26.3 L65.8 17.3 L70.9 20.3 L66.1 30.1 L67.2 31.0 L68.2 31.8 L69.2 32.8 L70.2 33.8 L71.0 34.8 L71.9 35.9 L81.7 31.1 L84.7 36.2 L75.7 42.4 L76.2 43.6 L76.6 44.9 L77.0 46.2 L77.3 47.6 L77.6 48.9 ZM69.1 63.8a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0ZM52.2 73.5a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0ZM35.3 63.8a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0ZM35.3 44.3a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0ZM52.2 34.5a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0ZM69.1 44.3a4.2 4.2 0 1 0 -8.4 0a4.2 4.2 0 1 0 8.4 0Z';
const GEAR_B_PATH = 'M90.4 50.3 L80.3 46.0 L82.8 40.1 L93.0 44.1 L93.7 43.1 L94.4 42.2 L95.3 41.3 L96.2 40.4 L97.1 39.7 L98.1 39.0 L94.1 28.8 L100.0 26.3 L104.3 36.4 L105.6 36.2 L106.8 36.0 L108.0 36.0 L109.2 36.0 L110.4 36.2 L111.7 36.4 L116.0 26.3 L121.9 28.8 L117.9 39.0 L118.9 39.7 L119.8 40.4 L120.7 41.3 L121.6 42.2 L122.3 43.1 L123.0 44.1 L133.2 40.1 L135.7 46.0 L125.6 50.3 L125.8 51.6 L126.0 52.8 L126.0 54.0 L126.0 55.2 L125.8 56.4 L125.6 57.7 L135.7 62.0 L133.2 67.9 L123.0 63.9 L122.3 64.9 L121.6 65.8 L120.7 66.7 L119.8 67.6 L118.9 68.3 L117.9 69.0 L121.9 79.2 L116.0 81.7 L111.7 71.6 L110.4 71.8 L109.2 72.0 L108.0 72.0 L106.8 72.0 L105.6 71.8 L104.3 71.6 L100.0 81.7 L94.1 79.2 L98.1 69.0 L97.1 68.3 L96.2 67.6 L95.3 66.7 L94.4 65.8 L93.7 64.9 L93.0 63.9 L82.8 67.9 L80.3 62.0 L90.4 57.7 L90.2 56.4 L90.0 55.2 L90.0 54.0 L90.0 52.8 L90.2 51.6 ZM120.0 62.8a3.2 3.2 0 1 0 -6.4 0a3.2 3.2 0 1 0 6.4 0ZM102.4 62.8a3.2 3.2 0 1 0 -6.4 0a3.2 3.2 0 1 0 6.4 0ZM102.4 45.2a3.2 3.2 0 1 0 -6.4 0a3.2 3.2 0 1 0 6.4 0ZM120.0 45.2a3.2 3.2 0 1 0 -6.4 0a3.2 3.2 0 1 0 6.4 0Z';

const LOADING_TEXTS = [
  'calibrating sensors...',
  'compiling firmware...',
  'tuning PID loops...',
  'charging capacitors...',
  'applying Ohm\'s Law...',
  'routing PCB traces...',
  'verifying logic gates...',
  'initializing modules...',
  'calculating torque...',
  'meshing gears...'
];

export function LoadingOverlay({ open, minMs, ready, onDone }: LoadingOverlayProps) {
  const [visible, setVisible] = useState(open);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Handle minimum time
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setMinTimePassed(true), minMs);
    return () => clearTimeout(timer);
  }, [open, minMs]);

  // 2. Cycle through loading text
  useEffect(() => {
    if (!visible) return;
    
    // Cycle every 1000ms (1 second)
    const textTimer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING_TEXTS.length);
    }, 1000);

    return () => clearInterval(textTimer);
  }, [visible]);

  // 3. Close only when BOTH time has passed AND data is ready
  useEffect(() => {
    if (minTimePassed && ready) {
      setVisible(false);
      onDone();
    }
  }, [minTimePassed, ready, onDone]);

  // 4. GSAP Animation
  useEffect(() => {
    if (!visible || !containerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.to('.gear-a', { rotation: 360, svgOrigin: '48 54', duration: 3, ease: 'none', repeat: -1 });
      gsap.to('.gear-b', { rotation: -360, svgOrigin: '108 54', duration: 2, ease: 'none', repeat: -1 });
    }, containerRef);

    return () => ctx.revert();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="amees-loading-overlay" ref={containerRef}>
      <div className="amees-window" style={{ width: 320, maxWidth: '100%' }}>
        <div className="amees-window__titlebar">
          <span className="amees-window__title">AMEES.EXE</span>
          <span className="amees-window__meta" style={{ textTransform: 'lowercase' }}>
            {LOADING_TEXTS[textIndex]}
          </span>
        </div>
        <div className="amees-window__strip" aria-hidden="true" />
        
        <div className="amees-loading-body">
          <svg className="amees-loading-gears" viewBox="0 0 144 108" aria-hidden="true">
            <g className="gear-a">
              <path d={GEAR_A_PATH} fill="#1D4ED8" fillRule="evenodd" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round"/>
              <circle cx="48" cy="54" r="9" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2.2"/>
              <circle cx="48" cy="54" r="3.5" fill="#0F172A"/>
            </g>
            <g className="gear-b">
              <path d={GEAR_B_PATH} fill="#2A2FD0" fillRule="evenodd" stroke="#0F172A" strokeWidth="2.2" strokeLinejoin="round"/>
              <circle cx="108" cy="54" r="7" fill="#2A2FD0" stroke="#0F172A" strokeWidth="2.2"/>
              <circle cx="108" cy="54" r="3" fill="#0F172A"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}