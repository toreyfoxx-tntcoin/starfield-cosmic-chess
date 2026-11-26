import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import type { ReplayMove } from '@/hooks/useReplayRecorder';

interface ReplayMoveListProps {
  moves: ReplayMove[];
  currentPly: number;
  onSelectMove: (ply: number) => void;
}

export function ReplayMoveList({ moves, currentPly, onSelectMove }: ReplayMoveListProps) {
  const formatMove = (move: ReplayMove) => {
    if (move.type === 'PASS') return 'Pass';
    if (move.type === 'PROMOTE') return `Promote to ${move.promotion}`;
    if (move.type === 'ABILITY') return move.ability || 'Ability';
    return `${move.piece} ${move.from}-${move.to}${move.captured ? 'x' : ''}`;
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold mb-2 text-slate-200">Move History</h3>
      <ScrollArea className="h-64">
        <div className="space-y-1">
          {moves.map((move, idx) => (
            <Button
              key={idx}
              variant={currentPly === idx ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => onSelectMove(idx)}
            >
              <span className="text-xs text-slate-400 w-8">{Math.floor(idx / 2) + 1}.</span>
              <span className="flex-1">{formatMove(move)}</span>
              {move.type === 'ABILITY' && (
                <Badge variant="outline" className="ml-2">
                  <Zap className="w-3 h-3" />
                </Badge>
              )}
              {move.eval !== undefined && (
                <span className="text-xs text-slate-400 ml-2">
                  {move.eval > 0 ? '+' : ''}{move.eval.toFixed(1)}
                </span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
