import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCcw, Play, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Focus game board on mount
  useEffect(() => {
    if (gameBoardRef.current) {
      gameBoardRef.current.focus();
    }
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default scrolling for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ' && !isGameOver) {
      setIsPaused(prev => !prev);
      return;
    }

    if (isPaused || isGameOver) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (directionRef.current !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (directionRef.current !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (directionRef.current !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (directionRef.current !== 'LEFT') setDirection('RIGHT');
        break;
    }
  }, [isPaused, isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update ref when direction state changes to prevent rapid reverse self-collision
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check wall collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        handleGameOver();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        setSpeed(s => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [direction, food, isPaused, isGameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [moveSnake, speed]);

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPaused(true);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
    if (gameBoardRef.current) {
      gameBoardRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Score Board */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3" /> High Score
          </span>
          <span className="text-xl font-bold text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]">{highScore}</span>
        </div>
      </div>

      {/* Game Board Container */}
      <div 
        ref={gameBoardRef}
        tabIndex={0}
        className="relative bg-zinc-950 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)] outline-none focus:border-cyan-500/50 transition-colors"
        style={{ 
          width: '400px', 
          height: '400px',
          backgroundImage: 'linear-gradient(to right, rgba(39, 39, 42, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(39, 39, 42, 0.3) 1px, transparent 1px)',
          backgroundSize: `${400 / GRID_SIZE}px ${400 / GRID_SIZE}px`
        }}
      >
        {/* Food */}
        <div 
          className="absolute bg-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(232,121,249,0.8)] animate-pulse"
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            transform: 'scale(0.8)'
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute rounded-sm ${isHead ? 'bg-cyan-300 z-10' : 'bg-cyan-500/80'} shadow-[0_0_10px_rgba(34,211,238,0.6)]`}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                transform: isHead ? 'scale(1.05)' : 'scale(0.95)',
                transition: 'all 0.05s linear'
              }}
            >
              {isHead && (
                <div className="w-full h-full relative">
                  {/* Eyes */}
                  <div className={`absolute w-1.5 h-1.5 bg-zinc-900 rounded-full ${direction === 'UP' || direction === 'DOWN' ? 'left-1' : 'top-1'} ${direction === 'UP' ? 'top-1' : direction === 'DOWN' ? 'bottom-1' : direction === 'LEFT' ? 'left-1' : 'right-1'}`} />
                  <div className={`absolute w-1.5 h-1.5 bg-zinc-900 rounded-full ${direction === 'UP' || direction === 'DOWN' ? 'right-1' : 'bottom-1'} ${direction === 'UP' ? 'top-1' : direction === 'DOWN' ? 'bottom-1' : direction === 'LEFT' ? 'left-1' : 'right-1'}`} />
                </div>
              )}
            </div>
          );
        })}

        {/* Overlays */}
        {(isGameOver || (isPaused && score === 0 && !isGameOver)) && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            {isGameOver ? (
              <>
                <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] tracking-widest">GAME OVER</h2>
                <p className="text-zinc-300 mb-8">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full hover:bg-cyan-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all font-bold tracking-wide uppercase"
                >
                  <RotateCcw className="w-5 h-5" /> Play Again
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  <Gamepad2 className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-8 tracking-widest">READY?</h2>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-cyan-500 text-zinc-950 rounded-full hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] transition-all font-black tracking-widest uppercase"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Game
                </button>
                <p className="mt-6 text-zinc-500 text-sm flex items-center gap-2">
                  Use <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-mono text-xs">WASD</kbd> or <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-mono text-xs">Arrows</kbd> to move
                </p>
              </>
            )}
          </div>
        )}
        
        {isPaused && score > 0 && !isGameOver && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <h2 className="text-3xl font-black text-cyan-400 mb-6 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">PAUSED</h2>
            <button 
              onClick={() => setIsPaused(false)}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full hover:bg-cyan-500 hover:text-zinc-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all font-bold tracking-wide uppercase"
            >
              <Play className="w-5 h-5 fill-current" /> Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
