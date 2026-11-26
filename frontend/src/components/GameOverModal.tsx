import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  open: boolean;
  capturedKingColor: 'white' | 'black';
  onEndGame: () => void;
  onContinue: () => void;
}

export function GameOverModal({ open, capturedKingColor, onEndGame, onContinue }: GameOverModalProps) {
  const winner = capturedKingColor === 'white' ? 'Black' : 'White';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            King Captured!
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300 text-lg mt-4">
            {winner} player has captured the enemy King.
            <br />
            Choose how to proceed:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <Button
            onClick={onEndGame}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            End Game Now
            <span className="block text-sm opacity-80">Declare {winner} as winner</span>
          </Button>
          
          <Button
            onClick={onContinue}
            variant="outline"
            className="w-full h-14 text-lg border-purple-500/50 hover:bg-purple-500/10"
          >
            Continue Playing
            <span className="block text-sm opacity-80">Annihilation Mode - Fight to the last piece</span>
          </Button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          In Annihilation Mode, the game continues until one player has no pieces remaining.
        </p>
      </DialogContent>
    </Dialog>
  );
}
