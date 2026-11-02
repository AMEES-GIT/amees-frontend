import { useEffect, useRef, useState } from 'react';
import './FooterRunner.css';

export function FooterRunner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const cactusRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  
  const [gameOver, setGameOver] = useState(false);
  
  const state = useRef({
    playing: false,
    botY: 0,          
    jumpVelocity: 0,
    isJumping: false,
    cactusX: 1000,    
    speed: 6,
    score: 0,
    animationId: 0,
  });

  // FIXED: Accept any event that has preventDefault
  const jump = (e?: { preventDefault: () => void }) => {
    if (e) e.preventDefault();
    if (gameOver) {
      restart();
      return;
    }
    const s = state.current;
    if (!s.playing) {
      s.playing = true;
      s.animationId = requestAnimationFrame(loop);
    }
    if (!s.isJumping) {
      s.isJumping = true;
      s.jumpVelocity = -12; 
    }
  };

  const restart = () => {
    setGameOver(false);
    state.current = {
      playing: false, botY: 0, jumpVelocity: 0, isJumping: false,
      cactusX: 1000, speed: 6, score: 0, animationId: 0
    };
    if (scoreRef.current) scoreRef.current.textContent = '00000';
    if (botRef.current) botRef.current.style.transform = 'translateY(0)';
    if (cactusRef.current) cactusRef.current.style.transform = 'translateX(100vw)';
  };

  const loop = () => {
    const s = state.current;
    if (!s.playing || !containerRef.current) return;

    if (s.isJumping) {
      s.jumpVelocity += 0.6; 
      s.botY -= s.jumpVelocity;
      if (s.botY <= 0) {
        s.botY = 0;
        s.isJumping = false;
        s.jumpVelocity = 0;
      }
    }

    s.cactusX -= s.speed;
    const containerWidth = containerRef.current.clientWidth;
    
    if (s.cactusX < -30) {
      s.cactusX = containerWidth;
      s.score += 10;
      if (scoreRef.current) scoreRef.current.textContent = String(s.score).padStart(5, '0');
    }

    const botX = 50;
    const botWidth = 24;
    const cactusWidth = 18;
    
    const xOverlap = botX + botWidth > s.cactusX && botX < s.cactusX + cactusWidth;
    const yOverlap = s.botY < 30; 

    if (xOverlap && yOverlap) {
      s.playing = false;
      setGameOver(true);
      return;
    }

    if (botRef.current) botRef.current.style.transform = `translateY(-${s.botY}px)`;
    if (cactusRef.current) cactusRef.current.style.transform = `translateX(${s.cactusX}px)`;
    
    s.animationId = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') jump(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(state.current.animationId);
    };
  }, [gameOver]);

  return (
    <div 
      className="amees-footer-runner" 
      ref={containerRef} 
      onClick={jump}
    >
      <div className="amees-footer-runner__score">
        HI <span ref={scoreRef}>00000</span>
      </div>
      
      <div ref={botRef} className="amees-footer-runner__bot">
        <svg viewBox="0 0 12 14" width="100%" height="100%" shapeRendering="crispEdges">
          <g fill="currentColor">
            <rect x="5" y="0" width="2" height="2"/>
            <rect x="2" y="2" width="8" height="5"/>
            <rect x="4" y="4" width="1" height="2" fill="var(--bg)"/>
            <rect x="7" y="4" width="1" height="2" fill="var(--bg)"/>
            <rect x="3" y="7" width="6" height="4"/>
            <rect x="1" y="7" width="2" height="3"/>
            <rect x="9" y="7" width="2" height="3"/>
            <rect x="3" y="11" width="2" height="3"/>
            <rect x="7" y="11" width="2" height="3"/>
          </g>
        </svg>
      </div>
      
      <div ref={cactusRef} className="amees-footer-runner__cactus">
        <svg viewBox="0 0 12 20" width="100%" height="100%" shapeRendering="crispEdges">
          <g fill="currentColor">
            <rect x="5" y="0" width="3" height="20"/>
            <rect x="1" y="7" width="2" height="7"/>
            <rect x="1" y="12" width="5" height="2"/>
            <rect x="9" y="3" width="2" height="7"/>
            <rect x="7" y="9" width="4" height="2"/>
          </g>
        </svg>
      </div>

      {gameOver && (
        <div className="amees-footer-runner__gameover">
          GAME OVER - CLICK TO RESTART
        </div>
      )}
    </div>
  );
}