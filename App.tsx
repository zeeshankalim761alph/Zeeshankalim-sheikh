import React from 'react';
import { GameCanvas } from './components/GameCanvas';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 overflow-hidden relative selection:bg-cyan-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]"></div>
      </div>

      <div className="z-10 w-full h-full flex flex-col">
        <header className="p-4 flex justify-between items-center w-full max-w-4xl mx-auto pointer-events-none">
          <div className="flex flex-col">
            <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider">
              NEON BOUNCE
            </h1>
            <span className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">Arcade Protocol</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 w-full h-full">
          <GameCanvas />
        </main>
        
        <footer className="p-4 text-center text-slate-600 text-sm pointer-events-none">
          <p>Use <span className="text-slate-400 font-bold">Mouse</span> or <span className="text-slate-400 font-bold">Touch</span> to control the paddle</p>
        </footer>
      </div>
    </div>
  );
};

export default App;