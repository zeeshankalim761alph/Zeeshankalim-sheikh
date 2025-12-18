export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export interface Vector {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vector;
  vel: Vector;
  radius: number;
  color: string;
  speed: number;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
  color: string;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  status: number; // 1 = active, 0 = broken
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  level: number;
}