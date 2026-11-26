import { GameState } from '../types/game';
import { boardToFEN } from './fen';

/**
 * Check if the current position has occurred three times (threefold repetition)
 * Returns true if the position has occurred 3+ times
 */
export const checkThreefoldRepetition = (state: GameState): boolean => {
  const currentFEN = boardToFEN(state);
  
  // Count occurrences of current position in history
  const occurrences = state.positionHistory.filter(fen => fen === currentFEN).length;
  
  return occurrences >= 3;
};

/**
 * Add current position to history for threefold detection
 */
export const recordPosition = (state: GameState): GameState => {
  const currentFEN = boardToFEN(state);
  
  return {
    ...state,
    positionHistory: [...state.positionHistory, currentFEN]
  };
};

/**
 * Check if fifty-move rule applies (50 moves without capture or pawn move)
 */
export const checkFiftyMoveRule = (state: GameState): boolean => {
  return state.halfmoveClock >= 100; // 100 half-moves = 50 full moves
};
