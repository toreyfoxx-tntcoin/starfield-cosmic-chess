import { GamePiece, Position } from '../types/game';
import { Player } from '../data/pieceTypes';
import { isSquareUnderAttack, isValidPosition } from './chessLogic';

export const getCastlingMoves = (
  king: GamePiece,
  board: (GamePiece | null)[][]
): Position[] => {
  const moves: Position[] = [];
  
  // Can't castle if king has moved
  if (king.hasMoved) return moves;
  
  const row = king.position.row;
  const player = king.player;
  
  // Check kingside castling (O-O)
  const kingsideRook = board[row][7];
  if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
    // Check if squares between are empty
    if (!board[row][5] && !board[row][6]) {
      // Check if king is not in check and doesn't pass through check
      if (!isSquareUnderAttack(board, { row, col: 4 }, player) &&
          !isSquareUnderAttack(board, { row, col: 5 }, player) &&
          !isSquareUnderAttack(board, { row, col: 6 }, player)) {
        moves.push({ row, col: 6 });
      }
    }
  }
  
  // Check queenside castling (O-O-O)
  const queensideRook = board[row][0];
  if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
    // Check if squares between are empty
    if (!board[row][1] && !board[row][2] && !board[row][3]) {
      // Check if king is not in check and doesn't pass through check
      if (!isSquareUnderAttack(board, { row, col: 4 }, player) &&
          !isSquareUnderAttack(board, { row, col: 3 }, player) &&
          !isSquareUnderAttack(board, { row, col: 2 }, player)) {
        moves.push({ row, col: 2 });
      }
    }
  }
  
  return moves;
};
