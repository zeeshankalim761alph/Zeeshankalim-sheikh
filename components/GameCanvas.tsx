import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  PADDLE_Y_OFFSET,
  BALL_RADIUS,
  BALL_SPEED_BASE,
  BRICK_ROW_COUNT,
  BRICK_COLUMN_COUNT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  COLORS,
  INITIAL_LIVES
} from '../constants';
import { GameState, Ball, Paddle, Brick, Particle } from '../types';
import { GameOverlay } from './GameOverlay';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Heart, 
  AlertCircle 
} from 'lucide-react';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (for high-performance loop)
  const gameStateRef = useRef<GameState>(GameState.MENU);
  const ballRef = useRef<Ball>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    vel: { x: 2, y: -2 },
    radius: BALL_RADIUS,
    color: COLORS.ball,
    speed: BALL_SPEED_BASE
  });
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: COLORS.paddle
  });
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const livesRef = useRef<number>(INITIAL_LIVES);
  const scoreRef = useRef<number>(0);
  
  // React State (for UI updates)
  const [uiState, setUiState] = useState<{
    gameState: GameState;
    score: number;
    lives: number;
    highScore: number;
  }>({
    gameState: GameState.MENU,
    score: 0,
    lives: INITIAL_LIVES,
    highScore: parseInt(localStorage.getItem('neonBounceHighScore') || '0')
  });

  // --- Initialization Helpers ---

  const initBricks = () => {
    const newBricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
    const brickHeight = 20;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks.push({
          x: (c * (brickWidth + BRICK_PADDING)) + BRICK_OFFSET_LEFT,
          y: (r * (brickHeight + BRICK_PADDING)) + BRICK_OFFSET_TOP,
          width: brickWidth,
          height: brickHeight,
          status: 1,
          color: COLORS.bricks[r % COLORS.bricks.length],
          value: (BRICK_ROW_COUNT - r) * 10
        });
      }
    }
    bricksRef.current = newBricks;
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        maxLife: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const resetBall = () => {
    ballRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
    // Randomize start direction slightly
    const dir = Math.random() > 0.5 ? 1 : -1;
    ballRef.current.vel = { x: BALL_SPEED_BASE * dir * 0.5, y: -BALL_SPEED_BASE };
    ballRef.current.speed = BALL_SPEED_BASE;
    paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  };

  const startGame = () => {
    initBricks();
    resetBall();
    scoreRef.current = 0;
    livesRef.current = INITIAL_LIVES;
    particlesRef.current = [];
    gameStateRef.current = GameState.PLAYING;
    setUiState(prev => ({ ...prev, gameState: GameState.PLAYING, score: 0, lives: INITIAL_LIVES }));
  };

  const resumeGame = () => {
    gameStateRef.current = GameState.PLAYING;
    setUiState(prev => ({ ...prev, gameState: GameState.PLAYING }));
  }

  // --- Game Loop ---

  const update = () => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    
    // 1. Move Ball
    ball.pos.x += ball.vel.x;
    ball.pos.y += ball.vel.y;

    // 2. Wall Collisions
    if (ball.pos.x + ball.radius > CANVAS_WIDTH || ball.pos.x - ball.radius < 0) {
      ball.vel.x = -ball.vel.x;
      // Clamp to stay inside
      if(ball.pos.x + ball.radius > CANVAS_WIDTH) ball.pos.x = CANVAS_WIDTH - ball.radius;
      if(ball.pos.x - ball.radius < 0) ball.pos.x = ball.radius;
    }
    
    if (ball.pos.y - ball.radius < 0) {
      ball.vel.y = -ball.vel.y;
      ball.pos.y = ball.radius;
    } else if (ball.pos.y + ball.radius > CANVAS_HEIGHT) {
      // Ball lost
      livesRef.current--;
      setUiState(prev => ({ ...prev, lives: livesRef.current }));
      
      if (livesRef.current <= 0) {
        gameStateRef.current = GameState.GAME_OVER;
        // Check High Score
        if (scoreRef.current > uiState.highScore) {
          localStorage.setItem('neonBounceHighScore', scoreRef.current.toString());
          setUiState(prev => ({ ...prev, gameState: GameState.GAME_OVER, highScore: scoreRef.current }));
        } else {
          setUiState(prev => ({ ...prev, gameState: GameState.GAME_OVER }));
        }
      } else {
        resetBall();
        // Pause briefly? For now just instant reset or could add READY state
      }
    }

    // 3. Paddle Collision
    // Simple AABB check for paddle
    const paddleTop = CANVAS_HEIGHT - PADDLE_Y_OFFSET;
    const paddleBottom = paddleTop + PADDLE_HEIGHT;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + PADDLE_WIDTH;

    if (
      ball.pos.y + ball.radius >= paddleTop &&
      ball.pos.y - ball.radius <= paddleBottom &&
      ball.pos.x >= paddleLeft &&
      ball.pos.x <= paddleRight
    ) {
        // Hit the paddle
        // Calculate hit position relative to center ( -0.5 to 0.5 )
        let hitPoint = (ball.pos.x - (paddle.x + PADDLE_WIDTH / 2));
        // Normalize hit point
        hitPoint = hitPoint / (PADDLE_WIDTH / 2);
        
        // Calculate bounce angle
        const angle = hitPoint * (Math.PI / 3); // Max 60 degree angle
        
        ball.vel.x = ball.speed * Math.sin(angle);
        ball.vel.y = -ball.speed * Math.cos(angle);
        
        // Increase speed slightly on every paddle hit up to max
        if (ball.speed < 15) ball.speed += 0.2;

        // Ensure we don't get stuck inside paddle
        ball.pos.y = paddleTop - ball.radius - 1;
    }

    // 4. Brick Collision
    let activeBricksCount = 0;
    for (let i = 0; i < bricksRef.current.length; i++) {
      const b = bricksRef.current[i];
      if (b.status === 1) {
        activeBricksCount++;
        if (
          ball.pos.x > b.x &&
          ball.pos.x < b.x + b.width &&
          ball.pos.y > b.y &&
          ball.pos.y < b.y + b.height
        ) {
          ball.vel.y = -ball.vel.y;
          b.status = 0;
          scoreRef.current += b.value;
          setUiState(prev => ({ ...prev, score: scoreRef.current }));
          createExplosion(b.x + b.width / 2, b.y + b.height / 2, b.color);
        }
      }
    }

    if (activeBricksCount === 0) {
      gameStateRef.current = GameState.WON;
      setUiState(prev => ({ ...prev, gameState: GameState.WON }));
    }

    // 5. Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.vy += 0.1; // gravity
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Gradient Overlay (optional, subtle)
    // The CSS background handles most, but we can do specific game effects here

    // Draw Bricks
    bricksRef.current.forEach(b => {
      if (b.status === 1) {
        ctx.beginPath();
        ctx.rect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
      }
    });

    // Draw Paddle
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, CANVAS_HEIGHT - PADDLE_Y_OFFSET, paddleRef.current.width, paddleRef.current.height, 8);
    ctx.fillStyle = paddleRef.current.color;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballRef.current.pos.x, ballRef.current.pos.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = ballRef.current.color;
    // Add glow to ball
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.closePath();
    });
  };

  const loop = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);

    requestRef.current = requestAnimationFrame(loop);
  }, []); // Dependencies are Refs, so stable

  useEffect(() => {
    // Initial draw to show something before start
    initBricks();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Input Handling
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current === GameState.PAUSED || gameStateRef.current === GameState.GAME_OVER) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Scale mouse position to canvas resolution
    const scaleX = CANVAS_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    
    let newX = mouseX - PADDLE_WIDTH / 2;
    // Clamp
    if (newX < 0) newX = 0;
    if (newX + PADDLE_WIDTH > CANVAS_WIDTH) newX = CANVAS_WIDTH - PADDLE_WIDTH;
    
    paddleRef.current.x = newX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current === GameState.PAUSED || gameStateRef.current === GameState.GAME_OVER) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scaleX = CANVAS_WIDTH / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    
    let newX = touchX - PADDLE_WIDTH / 2;
    // Clamp
    if (newX < 0) newX = 0;
    if (newX + PADDLE_WIDTH > CANVAS_WIDTH) newX = CANVAS_WIDTH - PADDLE_WIDTH;
    
    paddleRef.current.x = newX;
  };

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-800/50 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full touch-none cursor-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      />
      
      {/* UI Overlay */}
      <GameOverlay 
        state={uiState} 
        onStart={startGame} 
        onRestart={startGame}
      />
    </div>
  );
};