import { describe, it, expect } from 'vitest';
import { createInitialGameState, movePiece } from '../utils/gameState';

describe('Game State Tests', () => {
  it('should create initial game state with correct setup', () => {
    const state = createInitialGameState();
    
    expect(state.currentPlayer).toBe('white');
    expect(state.board.length).toBe(8);
    expect(state.board[0].length).toBe(8);
    
    // Check white pieces on row 6 and 7
    expect(state.board[6][0]?.type).toBe('pawn');
    expect(state.board[7][0]?.type).toBe('rook');
    expect(state.board[7][4]?.type).toBe('king');
    
    // Check black pieces on row 0 and 1
    expect(state.board[1][0]?.type).toBe('pawn');
    expect(state.board[0][0]?.type).toBe('rook');
    expect(state.board[0][4]?.type).toBe('king');
  });

  it('should move piece correctly', () => {
    const state = createInitialGameState();
    const from = { row: 6, col: 4 }; // White pawn
    const to = { row: 4, col: 4 };
    
    const newState = movePiece(state, from, to);
    
    expect(newState.board[4][4]?.type).toBe('pawn');
    expect(newState.board[6][4]).toBeNull();
    expect(newState.currentPlayer).toBe('black');
  });

  it('should handle captures correctly', () => {
    const state = createInitialGameState();
    
    // Move white pawn forward
    let newState = movePiece(state, { row: 6, col: 4 }, { row: 4, col: 4 });
    
    // Move black pawn forward
    newState = movePiece(newState, { row: 1, col: 3 }, { row: 3, col: 3 });
    
    // Capture
    newState = movePiece(newState, { row: 4, col: 4 }, { row: 3, col: 3 });
    
    expect(newState.board[3][3]?.player).toBe('white');
    expect(newState.board[4][4]).toBeNull();
  });
});
