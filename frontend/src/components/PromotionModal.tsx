import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { PieceType, PIECE_DEFINITIONS } from '../data/pieceTypes';

interface PromotionModalProps {
  open: boolean;
  onSelect: (pieceType: PieceType) => void;
}

const PROMOTION_CHOICES: PieceType[] = ['neutron_star', 'pulsar', 'blue_giant', 'black_hole'];


export const PromotionModal = ({ open, onSelect }: PromotionModalProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Promote Your Red Dwarf
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {PROMOTION_CHOICES.map((type) => {
            const def = PIECE_DEFINITIONS[type];
            return (
              <Button
                key={type}
                onClick={() => onSelect(type)}
                className="h-auto flex-col gap-3 p-4"
                variant="outline"
              >
                <img src={def.image} alt={def.starName} className="w-16 h-16" />
                <div className="text-center">
                  <div className="font-bold">{def.starName}</div>
                  <div className="text-xs text-muted-foreground">{def.ability.name}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
