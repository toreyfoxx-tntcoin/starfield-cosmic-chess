import React from 'react';
import { PieceDefinition } from '../data/pieceTypes';

interface PieceCardProps {
  piece: PieceDefinition;
}

export const PieceCard: React.FC<PieceCardProps> = ({ piece }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/50 transition-all hover:scale-105">
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 relative">
          <img
            src={piece.image}
            alt={piece.starName}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-1">{piece.starName}</h3>
          <p className="text-xs text-slate-400 mb-3">{piece.description}</p>
          
          <div className="bg-slate-900/60 rounded-lg p-2 border border-purple-500/30">
            <p className="text-xs font-semibold text-purple-300 mb-1">
              {piece.ability.name}
            </p>
            <p className="text-xs text-slate-300">
              {piece.ability.description}
            </p>
            {piece.ability.cooldown > 0 && (
              <p className="text-xs text-cyan-400 mt-1">
                Cooldown: {piece.ability.cooldown} turns
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
