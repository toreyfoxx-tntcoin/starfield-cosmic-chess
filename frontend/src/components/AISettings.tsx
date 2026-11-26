import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AIDifficulty, AIPersonality } from '@/utils/aiOpponent';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (difficulty: AIDifficulty, personality: AIPersonality) => void;
}

export default function AISettings({ isOpen, onClose, onStartGame }: AISettingsProps) {
  const difficulties: AIDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const personalities: AIPersonality[] = ['aggressive', 'defensive', 'tactical'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            AI Opponent Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-3">Difficulty</h3>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map(diff => (
                <Button
                  key={diff}
                  onClick={() => onStartGame(diff, 'tactical')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
