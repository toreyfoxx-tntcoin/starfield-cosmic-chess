import React from 'react';
import { PIECE_DEFINITIONS } from '../data/pieceTypes';
import { STAR_SETS } from '../data/starSets';
import { PieceCard } from './PieceCard';

interface CollectionScreenProps {
  onBack: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onBack }) => {
  const pieces = Object.values(PIECE_DEFINITIONS);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          ← Back to Menu
        </button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Stellar Collection
        </h1>

        {/* Star Sets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Star Sets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STAR_SETS.map(set => (
              <div
                key={set.id}
                className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{set.name}</h3>
                  <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-300 text-sm">
                    Tier {set.tier}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-4">{set.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-purple-300">Level {set.unlockLevel} Required</p>
                  {set.unlockCost > 0 && (
                    <p className="text-yellow-300">{set.unlockCost} Cosmic Shards</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Piece Types */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Stellar Pieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pieces.map(piece => (
              <PieceCard key={piece.type} piece={piece} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
