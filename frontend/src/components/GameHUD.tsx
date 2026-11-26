import React from 'react';
import { GameState } from '../types/game';
import { PIECE_DEFINITIONS } from '../data/pieceTypes';
import { AbilityPanel } from './AbilityPanel';


interface GameHUDProps {
  gameState: GameState;
  onReset: () => void;
  isAIThinking?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, onReset, isAIThinking = false }) => {
  const { currentPlayer, capturedPieces, turnCount, selectedPiece } = gameState;


  return (
    <div className="space-y-4">
      {/* Turn Info */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-300">Turn {turnCount}</p>
            <p className="text-xl font-bold text-white">
              {currentPlayer === 'white' ? 'White' : 'Black'} to Move
            </p>
            {isAIThinking && (
              <p className="text-sm text-yellow-400 animate-pulse mt-1">
                AI is thinking...
              </p>
            )}
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white font-semibold hover:scale-105 transition-transform"
          >
            New Game
          </button>
        </div>
      </div>


      {/* Selected Piece Info */}
      {selectedPiece && (
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <img
              src={PIECE_DEFINITIONS[selectedPiece.type].image}
              alt={PIECE_DEFINITIONS[selectedPiece.type].starName}
              className="w-12 h-12 object-contain"
            />
            <div>
              <p className="text-lg font-bold text-yellow-300">
                {PIECE_DEFINITIONS[selectedPiece.type].starName}
              </p>
              <p className="text-sm text-yellow-200">
                {PIECE_DEFINITIONS[selectedPiece.type].ability.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ability Panel */}
      <AbilityPanel piece={selectedPiece} onUseAbility={() => {}} />

      {/* Captured Pieces */}

      <div className="grid grid-cols-2 gap-4">
        {(['white', 'black'] as const).map(player => (
          <div
            key={player}
            className="bg-slate-900/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700"
          >
            <p className="text-sm font-semibold text-slate-300 mb-2">
              {player === 'white' ? 'White' : 'Black'} Captured
            </p>
            <div className="flex flex-wrap gap-1">
              {capturedPieces[player].map((piece, idx) => (
                <img
                  key={idx}
                  src={PIECE_DEFINITIONS[piece.type].image}
                  alt={piece.type}
                  className="w-6 h-6 object-contain opacity-60"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
