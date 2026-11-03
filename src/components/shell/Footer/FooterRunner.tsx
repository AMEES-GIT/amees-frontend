import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { API_BASE } from '../../../lib/apiBase';
import './FooterRunner.css';

export interface FooterRunnerProps {
  className?: string;
}

type GameStatus = 'idle' | 'playing' | 'gameover';

interface Obstacle {
  x: number;
  /** Height of the obstacle's bottom edge above the ground (px, up is positive). */
  y: number;
  width: number;
  height: number;
  el: HTMLDivElement;
}

/** Anything decorative that scrolls past: clouds, skyline letters, ground details. */
interface Mover {
  x: number;
  width: number;
  /** Parallax: fraction of the game speed this layer scrolls at. */
  factor: number;
  el: HTMLElement;
}

interface RunnerState {
  status: GameStatus;
  botY: number; // height above ground, up is positive
  jumpVelocity: number;
  isJumping: boolean;
  speed: number;
  score: number;
  shownScore: number;
  distance: number;
  untilNextObstacle: number;
  untilNextCloud: number;
  untilNextDetail: number;
  obstacles: Obstacle[];
  clouds: Mover[];
  letters: Mover[];
  details: Mover[];
  rafId: number;
  lastTime: number;
  lockUntil: number;
}

type Sfx = 'jump' | 'die' | 'milestone' | 'milestoneBig';

const HS_KEY = 'amees_runner_hs';
const MUTE_KEY = 'amees_runner_mute';
const TOKEN_KEY = 'amees_student_token';
const HS_ENDPOINT = `${API_BASE}/api/student/workbench/high-score`;

const BOT_X = 50;
const BOT_WIDTH = 24;
const BOT_HEIGHT = 30;

// Tuned so the full jump arc (84px) fits inside the strip with the bot's height.
const GRAVITY = 0.42;
const JUMP_FORCE = -8.4;
const JUMP_FRAMES = (2 * Math.abs(JUMP_FORCE)) / GRAVITY; // ~40 frames in the air

const BASE_SPEED = 6;
const MAX_SPEED = 13;
const SPEED_RAMP = 0.001;
const HIT_PADDING = 4; // hitbox forgiveness
const FRAME_MS = 1000 / 60;
const MAX_DT = 3; // clamp so a background tab doesn't teleport the bot
const RESTART_LOCK_MS = 600; // stops a panicked double-tap from skipping the game over screen
const GROUND_PATTERN_PERIOD = 38;

// ── Obstacles ───────────────────────────────────────────────────────────────
const CACTUS_GAP = 2;
const CACTUS_SIZES = [
  { w: 18, h: 30 }, // small
  { w: 24, h: 40 }, // large
] as const;

const DRONE_WIDTH = 34;
const DRONE_HEIGHT = 20;
// Bottom edge above ground. low/mid must be jumped; high is run under (jumping into it hits).
const DRONE_LEVELS = { low: 4, mid: 22, high: 40 } as const;

// Drones only show up once the player has found their feet.
const DRONE_UNLOCK_SCORE = 25;
const COMBO_UNLOCK_SCORE = 40;
const COMBO_CHANCE = 0.2;
const SOLO_DRONE_CHANCE = 0.3;
// Combo gap (in frames of travel) between the cactus clearing the bot and the drone reaching it.
// Jumping *early* leaves you airborne when the drone arrives; jumping *late* clips the cactus.
const COMBO_GAP_FRAMES_MIN = 10;
const COMBO_GAP_FRAMES_RANGE = 4;

// ── Scenery ─────────────────────────────────────────────────────────────────
const LETTER_MILESTONES: Record<number, string> = {
  200: 'A',
  400: 'M',
  600: 'E',
  800: 'E',
  1000: 'S',
};
const LETTER_PARALLAX = 0.3;

// Rectangular 5x7 pixel letters.
const LETTER_BITMAPS: Record<string, string[]> = {
  A: ['11111', '10001', '10001', '11111', '10001', '10001', '10001'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  S: ['11111', '10000', '10000', '11111', '00001', '00001', '11111'],
};

const CACTUS_SVG =
  '<svg viewBox="0 0 12 20" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="5" y="0" width="3" height="20"/><rect x="1" y="7" width="2" height="7"/><rect x="1" y="12" width="5" height="2"/><rect x="9" y="3" width="2" height="7"/><rect x="7" y="9" width="4" height="2"/></g></svg>';

// Side-on octo-drone: only two of the eight rotors are visible, each seen edge-on as a flickering blade.
const DRONE_SVG =
  '<svg viewBox="0 0 24 14" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor">' +
  '<rect class="amees-footer-runner__blade amees-footer-runner__blade--l" x="1" y="1" width="9" height="1"/>' +
  '<rect class="amees-footer-runner__blade amees-footer-runner__blade--r" x="14" y="1" width="9" height="1"/>' +
  '<rect x="5" y="2" width="1" height="3"/><rect x="18" y="2" width="1" height="3"/>' +
  '<rect x="4" y="5" width="16" height="5"/>' +
  '<rect class="amees-footer-runner__cut" x="14" y="6" width="4" height="2"/>' +
  '<rect x="6" y="10" width="1" height="2"/><rect x="17" y="10" width="1" height="2"/>' +
  '<rect x="4" y="12" width="16" height="1"/>' +
  '</g></svg>';

const CLOUD_SVG =
  '<svg viewBox="0 0 22 8" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="9" y="0" width="3" height="2"/><rect x="7" y="2" width="7" height="2"/><rect x="4" y="4" width="14" height="3"/><rect x="2" y="5" width="2" height="2"/><rect x="18" y="5" width="2" height="2"/></g></svg>';

const DETAIL_SVG = {
  pebble:
    '<svg viewBox="0 0 6 3" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="1" y="0" width="4" height="1"/><rect x="0" y="1" width="6" height="2"/></g></svg>',
  dash: '<svg viewBox="0 0 8 1" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="0" width="8" height="1" fill="currentColor"/></svg>',
  tuft: '<svg viewBox="0 0 7 5" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="1" y="2" width="1" height="3"/><rect x="3" y="0" width="1" height="5"/><rect x="5" y="2" width="1" height="3"/></g></svg>',
  rock: '<svg viewBox="0 0 10 5" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor"><rect x="2" y="0" width="5" height="1"/><rect x="1" y="1" width="8" height="1"/><rect x="0" y="2" width="10" height="3"/></g></svg>',
} as const;

type DetailKind = keyof typeof DETAIL_SVG;
const DETAIL_KINDS: DetailKind[] = ['pebble', 'pebble', 'dash', 'dash', 'dash', 'tuft', 'rock'];
const DETAIL_SIZE: Record<DetailKind, { w: number; h: number; underground: boolean }> = {
  pebble: { w: 12, h: 6, underground: true },
  dash: { w: 16, h: 2, underground: true },
  tuft: { w: 14, h: 10, underground: false },
  rock: { w: 20, h: 10, underground: false },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(5, '0');
}

function readLocalHighScore(): number {
  try {
    const n = parseInt(localStorage.getItem(HS_KEY) ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeLocalHighScore(score: number) {
  try {
    localStorage.setItem(HS_KEY, String(score));
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function createState(): RunnerState {
  return {
    status: 'idle',
    botY: 0,
    jumpVelocity: 0,
    isJumping: false,
    speed: BASE_SPEED,
    score: 0,
    shownScore: 0,
    distance: 0,
    untilNextObstacle: 400,
    untilNextCloud: 200,
    untilNextDetail: 40,
    obstacles: [],
    clouds: [],
    letters: [],
    details: [],
    rafId: 0,
    lastTime: 0,
    lockUntil: 0,
  };
}

// ── Sound (synthesized, no assets) ──────────────────────────────────────────
let audioCtx: AudioContext | null = null;

function ensureAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume().catch(() => {});
  return audioCtx;
}

function blip(
  ctx: AudioContext,
  from: number,
  to: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  delay = 0
) {
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SFX: Record<Sfx, (ctx: AudioContext) => void> = {
  jump: (c) => blip(c, 420, 840, 0.11, 'square', 0.05),
  die: (c) => {
    blip(c, 440, 110, 0.28, 'sawtooth', 0.06);
    blip(c, 220, 55, 0.35, 'square', 0.04, 0.06);
  },
  milestone: (c) => {
    blip(c, 880, 880, 0.07, 'square', 0.05);
    blip(c, 1320, 1320, 0.09, 'square', 0.05, 0.1);
  },
  milestoneBig: (c) => {
    blip(c, 660, 660, 0.07, 'square', 0.05);
    blip(c, 990, 990, 0.07, 'square', 0.05, 0.09);
    blip(c, 1320, 1320, 0.07, 'square', 0.05, 0.18);
    blip(c, 1760, 1760, 0.14, 'square', 0.05, 0.27);
  },
};

// ── DOM factories ───────────────────────────────────────────────────────────
function rand(min: number, range: number) {
  return min + Math.random() * range;
}

function pickCactusCount(max: number): number {
  const weights = [4, 3, 2, 1].slice(0, max); // singles most common, quads rarest
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i + 1;
  }
  return 1;
}

function spawnCactusGroup(layer: HTMLElement | null, x: number, maxCount: number): Obstacle {
  const count = pickCactusCount(maxCount);
  const { w, h } = CACTUS_SIZES[Math.random() > 0.5 ? 1 : 0];
  const width = count * w + (count - 1) * CACTUS_GAP;

  const el = document.createElement('div');
  el.className = 'amees-footer-runner__obstacle amees-footer-runner__obstacle--cactus';
  el.style.width = `${width}px`;
  el.style.height = `${h}px`;
  el.style.bottom = '0px';
  el.style.display = 'flex';
  el.style.alignItems = 'flex-end';
  el.style.gap = `${CACTUS_GAP}px`;
  el.style.transform = `translate3d(${x}px, 0, 0)`;

  let html = '';
  for (let i = 0; i < count; i++) {
    const flip = Math.random() > 0.5 ? 'transform:scaleX(-1);' : '';
    html += CACTUS_SVG.replace('<svg ', `<svg style="width:${w}px;height:${h}px;flex:none;${flip}" `);
  }
  el.innerHTML = html;
  layer?.appendChild(el);
  return { x, y: 0, width, height: h, el };
}

function spawnDrone(layer: HTMLElement | null, x: number, y: number): Obstacle {
  const el = document.createElement('div');
  el.className = 'amees-footer-runner__obstacle amees-footer-runner__obstacle--drone';
  el.style.width = `${DRONE_WIDTH}px`;
  el.style.height = `${DRONE_HEIGHT}px`;
  el.style.bottom = `${y}px`;
  el.style.transform = `translate3d(${x}px, 0, 0)`;
  el.innerHTML = DRONE_SVG.replace('<svg ', '<svg style="width:100%;height:100%" ');
  layer?.appendChild(el);
  return { x, y, width: DRONE_WIDTH, height: DRONE_HEIGHT, el };
}

function addCloud(layer: HTMLElement | null, list: Mover[], x: number) {
  if (!layer) return;
  const width = rand(34, 30);
  const el = document.createElement('div');
  el.className = 'amees-footer-runner__cloud';
  el.style.width = `${width}px`;
  el.style.top = `${rand(6, 34)}px`;
  el.style.transform = `translate3d(${x}px, 0, 0)`;
  el.innerHTML = CLOUD_SVG;
  layer.appendChild(el);
  list.push({ x, width, factor: rand(0.1, 0.15), el });
}

function addDetail(layer: HTMLElement | null, list: Mover[], x: number, horizon: number) {
  if (!layer) return;
  const kind = DETAIL_KINDS[Math.floor(Math.random() * DETAIL_KINDS.length)];
  const { w, h, underground } = DETAIL_SIZE[kind];
  const room = Math.max(0, horizon - h - 2);
  const bottom = underground ? -(1 + Math.random() * room) : 0;

  const el = document.createElement('div');
  el.className = `amees-footer-runner__detail amees-footer-runner__detail--${kind}`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.bottom = `${bottom}px`;
  el.style.transform = `translate3d(${x}px, 0, 0)`;
  el.innerHTML = DETAIL_SVG[kind];
  layer.appendChild(el);
  list.push({ x, width: w, factor: 1, el });
}

function letterSvg(ch: string): string {
  const rows = LETTER_BITMAPS[ch];
  if (!rows) return '';
  let cells = '';
  let windows = '';
  rows.forEach((row, r) => {
    [...row].forEach((c, i) => {
      if (c !== '1') return;
      // 1.02 overlap hides hairline seams between cells; group opacity keeps overlaps invisible.
      cells += `<rect x="${i}" y="${r}" width="1.02" height="1.02"/>`;
      windows += `<rect x="${i + 0.3}" y="${r + 0.3}" width="0.4" height="0.4"/>`;
    });
  });
  return (
    '<svg viewBox="0 0 5 7" shape-rendering="crispEdges" aria-hidden="true">' +
    `<g class="amees-footer-runner__letter-body">${cells}</g>` +
    `<g class="amees-footer-runner__letter-windows">${windows}</g></svg>`
  );
}

function spawnLetter(layer: HTMLElement | null, list: Mover[], ch: string, startX: number) {
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'amees-footer-runner__letter';
  el.style.transform = `translate3d(${startX}px, 0, 0)`;
  el.innerHTML = letterSvg(ch);
  layer.appendChild(el);
  list.push({ x: startX, width: el.offsetWidth || 80, factor: LETTER_PARALLAX, el });
}

/** Scroll a scenery list by `dist` (scaled by each item's parallax factor) and drop what's left the screen. */
function advance(list: Mover[], dist: number): Mover[] {
  let anyGone = false;
  for (const m of list) {
    m.x -= dist * m.factor;
    m.el.style.transform = `translate3d(${m.x}px, 0, 0)`;
    if (m.x < -m.width - 20) anyGone = true;
  }
  if (!anyGone) return list;
  return list.filter((m) => {
    if (m.x >= -m.width - 20) return true;
    m.el.remove();
    return false;
  });
}

// ── Component ───────────────────────────────────────────────────────────────
export function FooterRunner({ className }: FooterRunnerProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const obstaclesRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const groundLineRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const state = useRef<RunnerState>(createState());
  const inViewRef = useRef(true);
  const horizonRef = useRef(14);

  const [status, setStatus] = useState<GameStatus>('idle');
  const [highScore, setHighScore] = useState(readLocalHighScore);
  const [lastScore, setLastScore] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const [muted, setMuted] = useState(readMuted);

  // The game loop outlives renders, so it reads these from refs.
  const highScoreRef = useRef(highScore);
  const mutedRef = useRef(muted);

  const play = useCallback((name: Sfx) => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (ctx) SFX[name](ctx);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    writeMuted(next);
    if (!next) play('jump'); // audible confirmation
  }, [play]);

  // Pull the saved high score from the server (if signed in) once on mount.
  useEffect(() => {
    const token = readToken();
    if (!token) return;
    let cancelled = false;

    fetch(HS_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.score !== 'number') return;
        if (data.score > highScoreRef.current) {
          highScoreRef.current = data.score;
          setHighScore(data.score);
          writeLocalHighScore(data.score);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Measure where the ground line sits so scenery layers anchor to it regardless of the CSS.
  useEffect(() => {
    const el = containerRef.current;
    const line = groundLineRef.current;
    if (!el || !line) return;
    const measure = () => {
      const h = el.clientHeight - line.offsetTop;
      if (h > 0 && h < el.clientHeight) {
        horizonRef.current = h;
        el.style.setProperty('--amees-runner-horizon', `${h}px`);
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const seedScenery = useCallback(() => {
    const s = state.current;
    const w = containerRef.current?.clientWidth ?? 600;
    skyRef.current?.replaceChildren();
    skylineRef.current?.replaceChildren();
    detailsRef.current?.replaceChildren();
    s.clouds = [];
    s.letters = [];
    s.details = [];
    for (let x = rand(10, 100); x < w; x += rand(140, 160)) addCloud(skyRef.current, s.clouds, x);
    for (let x = rand(10, 30); x < w; x += rand(30, 90)) {
      addDetail(detailsRef.current, s.details, x, horizonRef.current);
    }
  }, []);

  useEffect(() => {
    seedScenery();
  }, [seedScenery]);

  const saveHighScore = useCallback((score: number) => {
    highScoreRef.current = score;
    setHighScore(score);
    writeLocalHighScore(score);

    const token = readToken();
    if (!token) return;
    fetch(HS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score }),
    }).catch(() => {});
  }, []);

  const endGame = useCallback(() => {
    const s = state.current;
    s.status = 'gameover';
    s.lockUntil = performance.now() + RESTART_LOCK_MS;
    cancelAnimationFrame(s.rafId);
    play('die');

    const finalScore = Math.floor(s.score / 10);
    const record = finalScore > highScoreRef.current;
    if (record) saveHighScore(finalScore);

    setLastScore(finalScore);
    setIsRecord(record);
    setStatus('gameover');
  }, [play, saveHighScore]);

  const loop = useCallback(
    (now: number) => {
      const s = state.current;
      const container = containerRef.current;
      if (s.status !== 'playing' || !container) return;

      const dt = Math.min(Math.max((now - s.lastTime) / FRAME_MS, 0), MAX_DT);
      s.lastTime = now;
      const viewW = container.clientWidth;

      // 1. Physics
      if (s.isJumping) {
        s.jumpVelocity += GRAVITY * dt;
        s.botY -= s.jumpVelocity * dt;
        if (s.botY <= 0) {
          s.botY = 0;
          s.isJumping = false;
          s.jumpVelocity = 0;
          botRef.current?.classList.remove('is-jumping');
        }
      }

      // 2. Speed, distance & score
      s.speed = Math.min(s.speed + SPEED_RAMP * dt, MAX_SPEED);
      s.distance += s.speed * dt;
      s.score += dt;

      const shown = Math.floor(s.score / 10);
      if (shown !== s.shownScore) {
        s.shownScore = shown;
        const scoreEl = scoreRef.current;
        if (scoreEl) scoreEl.textContent = pad(shown);

        if (shown > 0 && shown % 100 === 0) {
          if (scoreEl) {
            scoreEl.classList.remove('is-flash');
            void scoreEl.offsetWidth; // restart the flash animation
            scoreEl.classList.add('is-flash');
          }
          const letter = LETTER_MILESTONES[shown];
          if (letter) spawnLetter(skylineRef.current, s.letters, letter, viewW + 10);
          play(letter ? 'milestoneBig' : 'milestone');
        }
      }

      // 3. Obstacle spawning
      s.untilNextObstacle -= s.speed * dt;
      if (s.untilNextObstacle <= 0) {
        const layer = obstaclesRef.current;
        const x = viewW + 50;
        const maxCactus = s.speed < 7 ? 2 : s.speed < 9 ? 3 : 4;
        const roll = Math.random();
        let extent: number;

        if (s.shownScore >= COMBO_UNLOCK_SCORE && roll < COMBO_CHANCE) {
          // Timing combo: a cactus group followed by a high drone. Jump the cactus, but land
          // before the drone arrives, then run under it.
          const cactus = spawnCactusGroup(layer, x, maxCactus);
          const gapPx =
            (COMBO_GAP_FRAMES_MIN + Math.random() * COMBO_GAP_FRAMES_RANGE) * s.speed +
            (BOT_WIDTH - 2 * HIT_PADDING);
          const droneX = x + cactus.width + gapPx;
          const drone = spawnDrone(layer, droneX, DRONE_LEVELS.high);
          s.obstacles.push(cactus, drone);
          extent = cactus.width + gapPx + drone.width;
        } else if (s.shownScore >= DRONE_UNLOCK_SCORE && roll < COMBO_CHANCE + SOLO_DRONE_CHANCE) {
          const r = Math.random();
          const level = r < 0.4 ? DRONE_LEVELS.low : r < 0.65 ? DRONE_LEVELS.mid : DRONE_LEVELS.high;
          const drone = spawnDrone(layer, x, level);
          s.obstacles.push(drone);
          extent = drone.width;
        } else {
          const cactus = spawnCactusGroup(layer, x, maxCactus);
          s.obstacles.push(cactus);
          extent = cactus.width;
        }

        // Time in the air is ~JUMP_FRAMES, so a jump covers speed * JUMP_FRAMES px.
        // Add a reaction buffer plus a little randomness so gaps always feel fair.
        s.untilNextObstacle = extent + s.speed * JUMP_FRAMES + 120 + Math.random() * 150;
      }

      // 3b. Scenery spawning
      s.untilNextCloud -= s.speed * dt;
      if (s.untilNextCloud <= 0) {
        addCloud(skyRef.current, s.clouds, viewW + 20);
        s.untilNextCloud = rand(260, 360);
      }
      s.untilNextDetail -= s.speed * dt;
      if (s.untilNextDetail <= 0) {
        addDetail(detailsRef.current, s.details, viewW + 30, horizonRef.current);
        s.untilNextDetail = rand(30, 110);
      }

      // 4. Move obstacles & check collisions (y is measured upward from the ground)
      let hit = false;
      for (const obs of s.obstacles) {
        obs.x -= s.speed * dt;
        obs.el.style.transform = `translate3d(${obs.x}px, 0, 0)`;

        const overlapX =
          BOT_X + BOT_WIDTH - HIT_PADDING > obs.x && BOT_X + HIT_PADDING < obs.x + obs.width;
        const overlapY =
          s.botY + BOT_HEIGHT - HIT_PADDING > obs.y && s.botY + HIT_PADDING < obs.y + obs.height;
        if (overlapX && overlapY) hit = true;
      }

      if (s.obstacles.some((o) => o.x <= -100)) {
        s.obstacles = s.obstacles.filter((o) => {
          if (o.x > -100) return true;
          o.el.remove();
          return false;
        });
      }

      // 5. Render bot and scrolling scenery
      if (botRef.current) botRef.current.style.transform = `translate3d(0, ${-s.botY}px, 0)`;
      if (groundRef.current) {
        groundRef.current.style.backgroundPositionX = `${-(s.distance % GROUND_PATTERN_PERIOD)}px`;
      }
      const travel = s.speed * dt;
      s.clouds = advance(s.clouds, travel);
      s.letters = advance(s.letters, travel);
      s.details = advance(s.details, travel);

      if (hit) {
        endGame();
        return;
      }

      s.rafId = requestAnimationFrame(loop);
    },
    [endGame, play]
  );

  const startGame = useCallback(() => {
    cancelAnimationFrame(state.current.rafId);
    obstaclesRef.current?.replaceChildren();

    // Starting with a jump makes the first tap feel immediate.
    state.current = {
      ...createState(),
      status: 'playing',
      lastTime: performance.now(),
      isJumping: true,
      jumpVelocity: JUMP_FORCE,
    };
    seedScenery();
    play('jump');

    if (scoreRef.current) {
      scoreRef.current.textContent = pad(0);
      scoreRef.current.classList.remove('is-flash');
    }
    if (botRef.current) {
      botRef.current.style.transform = 'translate3d(0, 0, 0)';
      botRef.current.classList.add('is-jumping');
    }

    setIsRecord(false);
    setStatus('playing');
    state.current.rafId = requestAnimationFrame(loop);
  }, [loop, play, seedScenery]);

  const act = useCallback(() => {
    const s = state.current;

    if (s.status === 'playing') {
      if (!s.isJumping) {
        s.isJumping = true;
        s.jumpVelocity = JUMP_FORCE;
        botRef.current?.classList.add('is-jumping');
        play('jump');
      }
      return;
    }

    if (s.status === 'gameover' && performance.now() < s.lockUntil) return;
    startGame();
  }, [play, startGame]);

  // Track whether the strip is on screen so Space only plays when it should.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      const target = e.target as HTMLElement | null;
      const inside = !!(container && target && container.contains(target));

      // The mute button handles its own keys.
      if (target?.closest('[data-runner-mute]')) return;

      const isJumpKey = e.key === ' ' || e.key === 'ArrowUp' || (inside && e.key === 'Enter');
      if (!isJumpKey) return;

      // Leave the page alone unless the runner is focused or on screen.
      if (!inside && !inViewRef.current) return;
      if (
        !inside &&
        target?.closest('input, textarea, select, button, a[href], [contenteditable=""], [contenteditable="true"]')
      ) {
        return;
      }

      e.preventDefault(); // stop Space from scrolling the page
      if (e.repeat) return;
      act();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(state.current.rafId);
    };
  }, [act]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    act();
  };

  const classes = [
    'amees-footer-runner',
    `is-${status}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={classes}
      role="button"
      tabIndex={0}
      aria-label="Runner mini-game. Press space or tap to jump."
      onPointerDown={handlePointerDown}
    >
      <div ref={skylineRef} className="amees-footer-runner__skyline" />
      <div ref={skyRef} className="amees-footer-runner__sky" />
      <div ref={groundLineRef} className="amees-footer-runner__ground-line" />
      <div ref={groundRef} className="amees-footer-runner__ground" />
      <div ref={detailsRef} className="amees-footer-runner__details" />

      <button
        type="button"
        data-runner-mute
        className="amees-footer-runner__mute"
        aria-label={muted ? 'Unmute runner sounds' : 'Mute runner sounds'}
        aria-pressed={muted}
        onPointerDown={(e: ReactPointerEvent<HTMLButtonElement>) => e.stopPropagation()}
        onClick={toggleMute}
      >
        <svg viewBox="0 0 12 10" width="12" height="10" shapeRendering="crispEdges" aria-hidden="true">
          <g fill="currentColor">
            <rect x="0" y="3" width="3" height="4" />
            <rect x="3" y="2" width="1" height="6" />
            <rect x="4" y="1" width="1" height="8" />
            {muted ? (
              <>
                <rect x="7" y="2" width="1" height="1" />
                <rect x="8" y="3" width="1" height="1" />
                <rect x="9" y="4" width="1" height="1" />
                <rect x="10" y="5" width="1" height="1" />
                <rect x="11" y="6" width="1" height="1" />
                <rect x="11" y="2" width="1" height="1" />
                <rect x="10" y="3" width="1" height="1" />
                <rect x="8" y="5" width="1" height="1" />
                <rect x="7" y="6" width="1" height="1" />
              </>
            ) : (
              <>
                <rect x="7" y="3" width="1" height="4" />
                <rect x="9" y="1" width="1" height="8" />
              </>
            )}
          </g>
        </svg>
      </button>

      <div className="amees-footer-runner__ui">
        <span className="amees-footer-runner__hi">HI {pad(highScore)}</span>
        <span ref={scoreRef} className="amees-footer-runner__score">
          {pad(0)}
        </span>
      </div>

      <div
        ref={botRef}
        className={`amees-footer-runner__bot${status === 'playing' ? ' is-running' : ''}`}
      >
        <svg viewBox="0 0 12 14" width="100%" height="100%" shapeRendering="crispEdges" aria-hidden="true">
          <g fill="currentColor">
            <rect x="5" y="0" width="2" height="2" />
            <rect x="2" y="2" width="8" height="5" />
            <rect className="amees-footer-runner__cut" x="4" y="4" width="1" height="2" />
            <rect className="amees-footer-runner__cut" x="7" y="4" width="1" height="2" />
            <rect x="3" y="7" width="6" height="4" />
            <rect x="1" y="7" width="2" height="3" />
            <rect x="9" y="7" width="2" height="3" />
            <rect className="amees-footer-runner__leg amees-footer-runner__leg--l" x="3" y="11" width="2" height="3" />
            <rect className="amees-footer-runner__leg amees-footer-runner__leg--r" x="7" y="11" width="2" height="3" />
          </g>
        </svg>
      </div>

      <div ref={obstaclesRef} className="amees-footer-runner__obstacles" />

      <div className="amees-footer-runner__overlay" aria-live="polite">
        {status === 'idle' && (
          <span className="amees-footer-runner__prompt">PRESS SPACE OR TAP TO PLAY</span>
        )}

        {status === 'gameover' && (
          <>
            <span className="amees-footer-runner__gameover-text">GAME OVER</span>
            <span className="amees-footer-runner__final">
              SCORE {pad(lastScore)}
              {isRecord && <strong className="amees-footer-runner__record"> NEW HIGH SCORE</strong>}
            </span>
            <span className="amees-footer-runner__restart-text">TAP OR PRESS SPACE TO RETRY</span>
          </>
        )}
      </div>
    </div>
  );
}