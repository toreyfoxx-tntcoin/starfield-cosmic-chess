import { GamePiece, Position, GameAction, GameMode, GameState } from '../types/game';
import { Player } from '../data/pieceTypes';
import { getAllLegalMoves, simulateMove, isCheckmate, isInCheck } from './chessLogic';
import { enumerateActions } from './actionEnumerator';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

const TIME_BUDGETS: Record<AIDifficulty, number> = {
  easy: 300,
  medium: 600,
  hard: 900,
  expert: 1500
};

const DEPTH_CONFIG: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000
};

interface SearchResult {
  action: GameAction;
  score: number;
}

export function getBestAction(
  board: (GamePiece | null)[][],
  player: Player,
  difficulty: AIDifficulty,
  mode: GameMode = 'STANDARD',
  state?: GameState
): GameAction {
  const startTime = performance.now();
  const timeBudget = TIME_BUDGETS[difficulty];
  const maxDepth = DEPTH_CONFIG[difficulty];
  
  // Use enumerateActions to get all legal moves + abilities
  const actions = enumerateActions(board, player, state);
  
  // HF-1: Handle no legal actions
  if (actions.length === 0) {
    if (mode === 'STANDARD') {
      return { type: 'TERMINAL', result: 'DRAW_STALEMATE' };
    }
    // Annihilation: PASS
    return { type: 'PASS' };
  }
  
  let bestResult: SearchResult = {
    action: actions[0].action,
    score: -Infinity
  };
  
  // Iterative deepening with time budget and AbortController
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (performance.now() - startTime > timeBudget * 0.9) break;
    
    for (const enumAction of actions) {
      if (performance.now() - startTime > timeBudget) break;
      
      const action = enumAction.action;
      if (action.type === 'MOVE' && action.from && action.to) {
        const newBoard = simulateMove(board, action.from, action.to);
        const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player, startTime, timeBudget);
        
        if (score > bestResult.score) {
          bestResult = { action, score };
        }
      }
    }
  }
  
  return bestResult.action;
}


function minimax(
  board: (GamePiece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMax: boolean,
  aiPlayer: Player,
  startTime: number,
  timeBudget: number
): number {
  if (Date.now() - startTime > timeBudget || depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }
  
  const player = isMax ? aiPlayer : (aiPlayer === 'white' ? 'black' : 'white');
  const moves = getAllLegalMoves(board, player);
  
  if (moves.length === 0) {
    if (isCheckmate(board, player)) return isMax ? -100000 : 100000;
    return 0;
  }
  
  if (isMax) {
    let max = -Infinity;
    for (const m of moves) {
      const nb = simulateMove(board, m.piece.position, m.move);
      max = Math.max(max, minimax(nb, depth - 1, alpha, beta, false, aiPlayer, startTime, timeBudget));
      alpha = Math.max(alpha, max);
      if (beta <= alpha) break;
    }
    return max;
  } else {
    let min = Infinity;
    for (const m of moves) {
      const nb = simulateMove(board, m.piece.position, m.move);
      min = Math.min(min, minimax(nb, depth - 1, alpha, beta, true, aiPlayer, startTime, timeBudget));
      beta = Math.min(beta, min);
      if (beta <= alpha) break;
    }
    return min;
  }
}

function evaluateBoard(board: (GamePiece | null)[][], player: Player): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const val = PIECE_VALUES[p.type] || 0;
        score += (p.player === player ? val : -val);
      }
    }
  }
  if (isInCheck(board, player)) score -= 500;
  return score;
}
