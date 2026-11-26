import { GamePiece, Position } from '../types/game';
import { Player } from '../data/pieceTypes';
import { getAllLegalMoves, simulateMove, isCheckmate, isInCheck } from './chessLogic';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type AIPersonality = 'aggressive' | 'defensive' | 'tactical';

interface AIConfig {
  maxDepth: number;
  personality: AIPersonality;
}

const DIFFICULTY_CONFIG: Record<AIDifficulty, AIConfig> = {
  easy: { maxDepth: 1, personality: 'tactical' },
  medium: { maxDepth: 2, personality: 'tactical' },
  hard: { maxDepth: 3, personality: 'defensive' },
  expert: { maxDepth: 4, personality: 'aggressive' }
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

export function getBestMove(
  board: (GamePiece | null)[][],
  player: Player,
  difficulty: AIDifficulty
): { from: Position; to: Position } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const legalMoves = getAllLegalMoves(board, player);
  
  if (legalMoves.length === 0) return null;
  
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;
  
  for (const move of legalMoves) {
    const newBoard = simulateMove(board, move.piece.position, move.move);
    const score = minimax(newBoard, config.maxDepth - 1, -Infinity, Infinity, false, player, config.personality);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return { from: bestMove.piece.position, to: bestMove.move };
}

function minimax(
  board: (GamePiece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  personality: AIPersonality
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer, personality);
  }
  
  const currentPlayer = isMaximizing ? aiPlayer : (aiPlayer === 'white' ? 'black' : 'white');
  const legalMoves = getAllLegalMoves(board, currentPlayer);
  
  if (legalMoves.length === 0) {
    if (isCheckmate(board, currentPlayer)) {
      return isMaximizing ? -100000 : 100000;
    }
    return 0;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const newBoard = simulateMove(board, move.piece.position, move.move);
      const score = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, personality);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const newBoard = simulateMove(board, move.piece.position, move.move);
      const score = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, personality);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}


function evaluateBoard(board: (GamePiece | null)[][], player: Player, personality: AIPersonality): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        const multiplier = piece.player === player ? 1 : -1;
        score += value * multiplier;
        
        if (personality === 'aggressive' && piece.player === player) {
          score += (7 - Math.abs(row - 3.5)) * 5;
        }
      }
    }
  }
  
  if (personality === 'defensive') {
    const inCheck = isInCheck(board, player);
    if (inCheck) score -= 500;
  }
  
  return score;
}
