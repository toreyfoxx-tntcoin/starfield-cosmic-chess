import React from 'react';
import { GamePiece, GameState } from '../types/game';
import { PIECE_DEFINITIONS } from '../data/pieceTypes';
import { byPieceType } from '@/abilities/registry';

interface AbilityPanelProps {
  piece: GamePiece | null;
  gameState: GameState;
  onUseAbility: (abilityId: string) => void;
}

export const AbilityPanel: React.FC<AbilityPanelProps> = ({ piece, gameState, onUseAbility }) => {
  if (!piece) return null;

  const abilities = byPieceType(piece.type.toUpperCase() as any);
  
  if (abilities.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/40">
      <h3 className="text-lg font-bold text-purple-300 mb-3">Special Abilities</h3>
      
      <div className="space-y-2">
        {abilities.map(ability => {
          const cooldown = piece.cooldowns?.[ability.id] || 0;
          const usesLeft = ability.uses ? (piece.usesLeft?.[ability.id] ?? ability.uses) : Infinity;
          const canUse = cooldown === 0 && usesLeft > 0 && !piece.isStunned;

          return (
            <div key={ability.id} className="space-y-2">
              <div>
                <p className="text-white font-semibold">{ability.name}</p>
                <div className="flex items-center gap-3 text-xs mt-1">
                  {ability.cooldown > 0 && (
                    <span className={cooldown > 0 ? 'text-red-400' : 'text-green-400'}>
                      {cooldown > 0 ? `CD: ${cooldown}` : 'Ready'}
                    </span>
                  )}
                  {ability.uses && (
                    <span className="text-yellow-400">Uses: {usesLeft}/{ability.uses}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onUseAbility(ability.id)}
                disabled={!canUse}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all
                  ${canUse 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {piece.isStunned ? 'Stunned' : canUse ? 'Activate' : 'Not Available'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
