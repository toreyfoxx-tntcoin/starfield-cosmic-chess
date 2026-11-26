import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface CheckmateModalProps {
  isOpen: boolean;
  winner: 'white' | 'black';
  isRated: boolean;
  onEndGame: () => void;
  onContinue: () => void;
}

export default function CheckmateModal({
  isOpen,
  winner,
  isRated,
  onEndGame,
  onContinue
}: CheckmateModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Checkmate!
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-lg">
            {winner === 'white' ? 'White' : 'Black'} has delivered checkmate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-slate-400">
            Choose how to proceed:
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onEndGame}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              End Game Now
            </Button>
            
            <Button 
              onClick={onContinue}
              variant="outline"
              className="w-full border-purple-500/50 hover:bg-purple-500/10"
            >
              Continue: Annihilation Mode
            </Button>
          </div>
          
          {isRated && (
            <p className="text-xs text-slate-500 text-center">
              If you continue, rating will be locked at checkmate result
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
