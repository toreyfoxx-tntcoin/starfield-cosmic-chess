import { useCallback } from 'react';
import { GameState, PendingPromotion } from '../types/game';
import { PieceType } from '../data/pieceTypes';

export const usePromotion = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  const handlePromotion = useCallback((promoteTo: PieceType) => {
    if (!gameState.pendingPromotion) return;
    
    const { square } = gameState.pendingPromotion;
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[square.row][square.col];
    
    if (piece) {
      newBoard[square.row][square.col] = {
        ...piece,
        type: promoteTo,
        cooldowns: {},
        usesLeft: {}
      };
    }
    
    setGameState({
      ...gameState,
      board: newBoard,
      phase: 'PLAYING',
      pendingPromotion: null,
      currentPlayer: gameState.currentPlayer === 'white' ? 'black' : 'white'
    });
  }, [gameState, setGameState]);
  
  return { handlePromotion };
};
