import React from 'react';
import { GameState, Position } from '../types/game';
import { PIECE_DEFINITIONS } from '../data/pieceTypes';
import { isSamePosition } from '../utils/chessLogic';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onSquareClick }) => {
  const { board, selectedPiece, validMoves } = gameState;

  const isValidMove = (pos: Position) => {
    return validMoves.some(move => isSamePosition(move, pos));
  };

  const isSelected = (pos: Position) => {
    return selectedPiece && isSamePosition(selectedPiece.position, pos);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-square">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg backdrop-blur-sm border border-cyan-500/30 shadow-2xl shadow-cyan-500/20" />
      
      <div className="relative grid grid-cols-8 grid-rows-8 gap-0.5 p-2 h-full">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const pos = { row: rowIndex, col: colIndex };
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const selected = isSelected(pos);
            const validMove = isValidMove(pos);

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onSquareClick(pos)}
                className={`
                  relative aspect-square transition-all duration-200
                  ${isDark ? 'bg-slate-800/60' : 'bg-slate-700/40'}
                  ${selected ? 'ring-4 ring-yellow-400 scale-105' : ''}
                  ${validMove ? 'ring-2 ring-green-400' : ''}
                  hover:brightness-125 border border-cyan-500/10
                `}
              >
                {piece && (
                  <div className="absolute inset-0 flex items-center justify-center p-1">
                    <img
                      src={PIECE_DEFINITIONS[piece.type].image}
                      alt={PIECE_DEFINITIONS[piece.type].starName}
                      className={`w-full h-full object-contain drop-shadow-lg
                        ${piece.player === 'white' ? 'brightness-110' : 'brightness-75 hue-rotate-180'}
                        ${piece.isStunned ? 'opacity-50 grayscale' : ''}
                      `}
                    />
                  </div>
                )}
                {validMove && !piece && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-400/60 animate-pulse" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
