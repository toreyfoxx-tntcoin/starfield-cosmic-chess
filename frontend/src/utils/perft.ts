import { GameState } from '../types/game';
import { getValidMoves } from './chessLogic';
import { movePiece } from './gameState';

/**
 * Perft (Performance Test) - counts leaf nodes at a given depth
 * Used to validate move generation correctness
 */
export const perft = (state: GameState, depth: number): number => {
  if (depth === 0) return 1;

  let nodes = 0;
  const pieces = state.board.flat().filter(p => p && p.player === state.currentPlayer);

  for (const piece of pieces) {
    if (!piece) continue;
    const moves = getValidMoves(state.board, piece.position, state.enPassantTarget);

    for (const move of moves) {
      const newState = movePiece(state, piece.position, move);
      nodes += perft(newState, depth - 1);
    }
  }

  return nodes;
};

/**
 * Standard perft test positions with known results
 */
export const PERFT_TESTS = {
  initial: {
    name: 'Initial Position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    depths: [
      { depth: 1, nodes: 20 },
      { depth: 2, nodes: 400 },
      { depth: 3, nodes: 8902 },
      { depth: 4, nodes: 197281 }
    ]
  }
};
