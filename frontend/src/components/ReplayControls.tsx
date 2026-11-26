import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';

interface ReplayControlsProps {
  isPlaying: boolean;
  currentPly: number;
  totalPlies: number;
  playbackSpeed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (ply: number) => void;
}

export function ReplayControls({
  isPlaying,
  currentPly,
  totalPlies,
  playbackSpeed,
  onPlayPause,
  onStepForward,
  onStepBack,
  onJumpToStart,
  onJumpToEnd,
  onSpeedChange,
  onSeek,
}: ReplayControlsProps) {
  const speeds = [0.5, 1, 1.5, 2, 3];

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
      <div className="flex items-center gap-4 mb-4">
        <Button size="sm" variant="outline" onClick={onJumpToStart}>
          <Rewind className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onStepBack}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={onPlayPause} className="px-6">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button size="sm" variant="outline" onClick={onStepForward}>
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onJumpToEnd}>
          <FastForward className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-slate-400">Speed:</span>
          {speeds.map(speed => (
            <Button
              key={speed}
              size="sm"
              variant={playbackSpeed === speed ? 'default' : 'outline'}
              onClick={() => onSpeedChange(speed)}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentPly]}
          min={0}
          max={totalPlies}
          step={1}
          onValueChange={([val]) => onSeek(val)}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>Move {currentPly}</span>
          <span>{totalPlies} moves</span>
        </div>
      </div>
    </div>
  );
}
