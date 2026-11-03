import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE } from '../../../lib/apiBase';
import './FooterRunner.css';

export interface FooterRunnerProps {
  className?: string;
}

type GameStatus = 'idle' | 'playing' | 'gameover';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'drone';
}

const BOT_X = 50;
const BOT_WIDTH = 24;
const BOT_HEIGHT = 30;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GROUND_Y = 0;
const DRONE_Y = -40;

export function FooterRunner({ className }: FooterRunnerProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const obstaclesContainerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<GameStatus>('idle');
  
  // High score state (starts with local storage, then updates from DB)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('amees_runner_hs');
    return saved ? parseInt(saved, 10) : 0;
  });

  const state = useRef({
    playing: false,
    botY: GROUND_Y,
    jumpVelocity: 0,
    isJumping: false,
    speed: 6,
    score: 0,
    animationId: 0,
    distanceUntilNextObstacle: 400, // Spawn distance tracker
    obstacles: [] as Obstacle[],
    nextObstacleId: 1,
  });

  // 1. Fetch DB High Score on mount (if logged in)
  useEffect(() => {
    const token = localStorage.getItem('amees_student_token');
    if (!token) return;

    fetch(`${API_BASE}/api/student/workbench/high-score`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.score > highScore) {
          setHighScore(data.score);
          localStorage.setItem('amees_runner_hs', String(data.score));
        }
      })
      .catch(() => {});
  }, []);

  const startGame = useCallback(() => {
    setStatus('playing');
    state.current = {
      playing: true,
      botY: GROUND_Y,
      jumpVelocity: 0,
      isJumping: false,
      speed: 6,
      score: 0,
      animationId: requestAnimationFrame(loop),
      distanceUntilNextObstacle: 400,
      obstacles: [],
      nextObstacleId: 1,
    };
    if (scoreRef.current) scoreRef.current.textContent = '00000';
    if (obstaclesContainerRef.current) obstaclesContainerRef.current.innerHTML = '';
  }, []);

  const jump = useCallback((e?: { preventDefault: () => void }) => {
    if (e) e.preventDefault();
    if (status === 'idle' || status === 'gameover') {
      startGame();
      return;
    }
    const s = state.current;
    if (!s.isJumping) {
      s.isJumping = true;
      s.jumpVelocity = JUMP_FORCE;
    }
  }, [status, startGame]);

  const endGame = useCallback(() => {
    const s = state.current;
    s.playing = false;
    cancelAnimationFrame(s.animationId);
    
    const finalScore = Math.floor(s.score / 10);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('amees_runner_hs', String(finalScore));

      // Save to DB if logged in
      const token = localStorage.getItem('amees_student_token');
      if (token) {
        fetch(`${API_BASE}/api/student/workbench/high-score`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ score: finalScore })
        }).catch(() => {});
      }
    }
    setStatus('gameover');
  }, [highScore]);

  const loop = useCallback(() => {
    const s = state.current;
    if (!s.playing || !containerRef.current) return;

    // 1. Physics
    if (s.isJumping) {
      s.jumpVelocity += GRAVITY;
      s.botY -= s.jumpVelocity;
      if (s.botY <= GROUND_Y) {
        s.botY = GROUND_Y;
        s.isJumping = false;
        s.jumpVelocity = 0;
      }
    }

    // 2. Speed & Score
    s.speed += 0.001;
    s.score += 1;
    if (scoreRef.current) {
      scoreRef.current.textContent = String(Math.floor(s.score / 10)).padStart(5, '0');
    }

    // 3. Smart Obstacle Spawning
    s.distanceUntilNextObstacle -= s.speed;
    if (s.distanceUntilNextObstacle <= 0) {
      const isDrone = Math.random() > 0.7;
      const newObs: Obstacle = {
        id: s.nextObstacleId++,
        x: containerRef.current.clientWidth + 50,
        y: isDrone ? DRONE_Y : GROUND_Y,
        width: isDrone ? 30 : 18,
        height: isDrone ? 24 : 35,
        type: isDrone ? 'drone' : 'cactus',
      };
      s.obstacles.push(newObs);
      
      // SMART MATH: Calculate how far the bot travels during a jump.
      // Time in air = (2 * |jumpForce|) / gravity = 40 frames.
      // Jump distance = speed * 40.
      // We add 120px buffer so the player has time to react.
      const jumpDistance = (s.speed * 40) + 120;
      
      // Add a little randomness to the gap
      s.distanceUntilNextObstacle = jumpDistance + Math.random() * 150;
    }

    // 4. Move & Render Obstacles
    let collisionDetected = false;
    s.obstacles.forEach((obs) => {
      obs.x -= s.speed;
      
      const botBox = { left: BOT_X, right: BOT_X + BOT_WIDTH, top: s.botY - BOT_HEIGHT, bottom: s.botY };
      const obsBox = { left: obs.x, right: obs.x + obs.width, top: obs.y - obs.height, bottom: obs.y };
      
      const padding = 4; // Hitbox forgiveness
      if (
        botBox.right - padding > obsBox.left &&
        botBox.left + padding < obsBox.right &&
        botBox.bottom > obsBox.top &&
        botBox.top < obsBox.bottom
      ) {
        collisionDetected = true;
      }
    });

    if (collisionDetected) {
      endGame();
      return;
    }

    s.obstacles = s.obstacles.filter(o => o.x > -100);

    // 5. DOM Updates
    if (botRef.current) botRef.current.style.transform = `translateY(${-s.botY}px)`;
    
    if (obstaclesContainerRef.current) {
      obstaclesContainerRef.current.innerHTML = s.obstacles.map(obs => `
        <div class="amees-footer-runner__obstacle" style="transform: translateX(${obs.x}px); bottom: ${-obs.y}px; width: ${obs.width}px; height: ${obs.height}px;">
          ${obs.type === 'cactus' ? 
            `<svg viewBox="0 0 12 20" shapeRendering="crispEdges"><g fill="currentColor"><rect x="5" y="0" width="3" height="20"/><rect x="1" y="7" width="2" height="7"/><rect x="1" y="12" width="5" height="2"/><rect x="9" y="3" width="2" height="7"/><rect x="7" y="9" width="4" height="2"/></g></svg>` : 
            `<svg viewBox="0 0 20 16" shapeRendering="crispEdges"><g fill="currentColor"><rect x="4" y="4" width="12" height="8" rx="2"/><rect x="2" y="0" width="2" height="16"/><rect x="16" y="0" width="2" height="16"/><rect x="6" y="6" width="8" height="4" fill="var(--bg)"/></g></svg>`
          }
        </div>
      `).join('');
    }

    s.animationId = requestAnimationFrame(loop);
  }, [endGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
           jump(e);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(state.current.animationId);
    };
  }, [jump]);

  return (
    <div
      className={['amees-footer-runner', className].filter(Boolean).join(' ')}
      ref={containerRef}
      onClick={jump}
      onTouchStart={jump}
    >
      <div className="amees-footer-runner__clouds" />
      <div className="amees-footer-runner__ground" />

      <div className="amees-footer-runner__ui">
        <div className="amees-footer-runner__score">
          HI {String(highScore).padStart(5, '0')} <span ref={scoreRef}>00000</span>
        </div>
      </div>

      <div 
        ref={botRef} 
        className={`amees-footer-runner__bot ${status === 'playing' ? 'is-running' : ''}`}
        style={{ transform: `translateY(-${state.current.botY}px)` }}
      >
        <svg viewBox="0 0 12 14" width="100%" height="100%" shapeRendering="crispEdges">
          <g fill="currentColor">
            <rect x="5" y="0" width="2" height="2" />
            <rect x="2" y="2" width="8" height="5" />
            <rect x="4" y="4" width="1" height="2" fill="var(--bg)" />
            <rect x="7" y="4" width="1" height="2" fill="var(--bg)" />
            <rect x="3" y="7" width="6" height="4" />
            <rect x="1" y="7" width="2" height="3" />
            <rect x="9" y="7" width="2" height="3" />
            <rect x="3" y="11" width="2" height="3" />
            <rect x="7" y="11" width="2" height="3" />
          </g>
        </svg>
      </div>

      <div ref={obstaclesContainerRef} className="amees-footer-runner__obstacles" />

      {status === 'idle' && (
        <div className="amees-footer-runner__overlay">
          <span>PRESS SPACE OR TAP TO PLAY</span>
        </div>
      )}

      {status === 'gameover' && (
        <div className="amees-footer-runner__overlay">
          <span className="amees-footer-runner__gameover-text">GAME OVER</span>
          <span className="amees-footer-runner__restart-text">TAP TO RESTART</span>
        </div>
      )}
    </div>
  );
}