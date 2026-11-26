import { describe, it, expect } from 'vitest';
import { 
  isCheckmate, 
  isInCheck, 
  getAllLegalMoves,
  getValidMoves,
  isMoveLegal
} from '../utils/chessLogic';
import { GamePiece } from '../types/game';

describe('Chess Logic Tests', () => {
  it('should detect checkmate correctly', () => {
    // Create a simple checkmate position
    const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // White king in corner
    board[7][7] = {
      type: 'king',
      player: 'white',
      position: { row: 7, col: 7 },
      id: 'wk1',
      starType: 'white-dwarf',
      isStunned: false
    };
    
    // Black rooks delivering checkmate
    board[7][0] = {
      type: 'rook',
      player: 'black',
      position: { row: 7, col: 0 },
      id: 'br1',
      starType: 'red-giant',
      isStunned: false
    };
    
    board[0][7] = {
      type: 'rook',
      player: 'black',
      position: { row: 0, col: 7 },
      id: 'br2',
      starType: 'red-giant',
      isStunned: false
    };

    expect(isCheckmate(board, 'white')).toBe(true);
  });

  it('should return empty moves for piece with no legal moves', () => {
    const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    const pawn: GamePiece = {
      type: 'pawn',
      player: 'white',
      position: { row: 0, col: 0 },
      id: 'wp1',
      starType: 'white-dwarf',
      isStunned: false
    };
    
    board[0][0] = pawn;
    
    const moves = getValidMoves(pawn, board, false);
    const legalMoves = moves.filter(m => isMoveLegal(board, pawn, m, 'white'));
    
    expect(legalMoves.length).toBe(0);
  });

  it('should detect check correctly', () => {
    const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    board[4][4] = {
      type: 'king',
      player: 'white',
      position: { row: 4, col: 4 },
      id: 'wk1',
      starType: 'white-dwarf',
      isStunned: false
    };
    
    board[4][0] = {
      type: 'rook',
      player: 'black',
      position: { row: 4, col: 0 },
      id: 'br1',
      starType: 'red-giant',
      isStunned: false
    };

    expect(isInCheck(board, 'white')).toBe(true);
  });
});
