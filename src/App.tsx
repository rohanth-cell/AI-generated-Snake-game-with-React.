import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono selection:bg-fuchsia-500 selection:text-black flex flex-col relative overflow-hidden">
      <div className="noise" />
      <div className="scanlines" />
      
      <header className="p-4 border-b-4 border-fuchsia-500 flex items-center justify-between relative z-20 bg-black screen-tear">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-widest text-cyan-400 glitch" data-text="SYS.EXEC(SNAKE)">
            SYS.EXEC(SNAKE)
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold text-fuchsia-500 tracking-widest uppercase animate-pulse">AUDIO_LINK_ESTABLISHED</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 relative z-10">
        <div className="w-full max-w-2xl border-4 border-cyan-500 p-4 bg-black relative">
          <div className="absolute -inset-2 border-2 border-fuchsia-500 opacity-50 animate-pulse pointer-events-none" />
          <SnakeGame />
        </div>
        
        <div className="w-full max-w-md lg:w-96 shrink-0">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}
