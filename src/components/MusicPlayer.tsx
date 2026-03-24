import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'STREAM_01.DAT', artist: 'UNKNOWN_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'STREAM_02.DAT', artist: 'UNKNOWN_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'STREAM_03.DAT', artist: 'UNKNOWN_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipNext = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const skipPrev = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="bg-black border-2 border-fuchsia-500 p-6 relative font-mono text-cyan-400 uppercase">
      <div className="absolute top-0 left-0 w-full h-full bg-fuchsia-500/10 pointer-events-none animate-pulse" />
      
      <div className="border-b-2 border-fuchsia-500 pb-2 mb-6 flex justify-between items-center">
        <span className="text-fuchsia-500 text-xl glitch" data-text="AUDIO_SUBSYSTEM">AUDIO_SUBSYSTEM</span>
        <span className="text-sm">{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
      </div>

      <div className="mb-8">
        <div className="text-sm text-fuchsia-500 mb-2">CURRENT_STREAM:</div>
        <div className="text-3xl truncate glitch" data-text={currentTrack.title}>{currentTrack.title}</div>
        <div className="text-lg text-cyan-700 mt-2">SRC: {currentTrack.artist}</div>
      </div>

      <div className="flex items-center justify-between mb-8 border-y-2 border-cyan-900 py-4">
        <button onClick={skipPrev} className="hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 py-1 transition-colors text-xl">
          [ PREV ]
        </button>
        <button onClick={togglePlay} className="text-2xl hover:text-fuchsia-500 hover:bg-cyan-900/30 px-4 py-1 transition-colors screen-tear">
          {isPlaying ? '[ HALT ]' : '[ EXEC ]'}
        </button>
        <button onClick={skipNext} className="hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 py-1 transition-colors text-xl">
          [ NEXT ]
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm text-fuchsia-500">
          <span>AMP_LEVEL</span>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.01" value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-3 bg-black border border-cyan-500 appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>

      <audio ref={audioRef} src={currentTrack.url} onEnded={skipNext} preload="metadata" />
    </div>
  );
}
