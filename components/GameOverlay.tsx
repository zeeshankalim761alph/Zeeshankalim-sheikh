import React from 'react';
import { GameState } from '../types';
import { Play, RotateCcw, Trophy, Heart, Activity } from 'lucide-react';

interface GameOverlayProps {
  state: {
    gameState: GameState;
    score: number;
    lives: number;
    highScore: number;
  };
  onStart: () => void;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ state, onStart, onRestart }) => {
  const { gameState, score, lives, highScore } = state;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* HUD (Heads Up Display) */}
      <div className="flex justify-between items-start w-full">
        <div className="flex gap-4">
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
             <Activity className="w-4 h-4 text-cyan-400" />
             <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
               <span className="text-xl font-display font-bold text-white leading-none">{score}</span>
             </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
             <Trophy className="w-4 h-4 text-yellow-400" />
             <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best</span>
               <span className="text-xl font-display font-bold text-white leading-none">{highScore}</span>
             </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
             <div className="flex gap-1">
               {[...Array(3)].map((_, i) => (
                 <Heart 
                   key={i} 
                   className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} 
                 />
               ))}
             </div>
        </div>
      </div>

      {/* Menus */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        
        {gameState === GameState.MENU && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <h2 className="text-4xl font-display font-bold text-white mb-2">READY?</h2>
              <p className="text-slate-400 mb-8">Break all bricks. Don't drop the ball.</p>
              <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5 fill-current" />
                START GAME
                <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-ping opacity-0 group-hover:opacity-100"></div>
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900/90 p-8 rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h2 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 mb-2">GAME OVER</h2>
              <div className="flex justify-center gap-8 my-6 text-left">
                <div>
                   <span className="text-xs text-slate-500 uppercase font-bold">Score</span>
                   <p className="text-2xl font-display text-white">{score}</p>
                </div>
                <div>
                   <span className="text-xs text-slate-500 uppercase font-bold">Best</span>
                   <p className="text-2xl font-display text-yellow-400">{highScore}</p>
                </div>
              </div>
              <button 
                onClick={onRestart}
                className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.WON && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-900/90 p-8 rounded-3xl border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              <h2 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 mb-2">VICTORY!</h2>
              <p className="text-slate-300 mb-6">Stage Clear. Amazing reflexes.</p>
              <div className="flex justify-center gap-8 my-6 text-left">
                <div>
                   <span className="text-xs text-slate-500 uppercase font-bold">Final Score</span>
                   <p className="text-3xl font-display text-white">{score}</p>
                </div>
              </div>
              <button 
                onClick={onRestart}
                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-bold text-lg rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};