import { describe, it, expect } from 'vitest';
import { preTurnAudit } from '../utils/preTurnAudit';
import { GameState } from '../types/game';
import { createInitialBoard } from '../utils/gameState';

describe('preTurnAudit - Checkmate & Stalemate Detection', () => {
  it('returns PLAYING when player has legal moves', () => {
    const state: GameState = {
      board: createInitialBoard(),
      currentPlayer: 'white',
      mode: 'STANDARD',
      phase: 'PLAYING',
      selectedPiece: null,
      validMoves: []
    };

    const result = preTurnAudit(state);
    expect(result.phase).toBe('PLAYING');
    expect(result.terminal).toBeUndefined();
  });

  it('returns CHECKMATE_AWAIT_CHOICE when player is in check with no legal moves', () => {
    // Create a checkmate position
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[0][4] = { type: 'king', player: 'white', position: { row: 0, col: 4 }, id: 'wk' };
    board[1][4] = { type: 'queen', player: 'black', position: { row: 1, col: 4 }, id: 'bq' };
    board[7][7] = { type: 'king', player: 'black', position: { row: 7, col: 7 }, id: 'bk' };

    const state: GameState = {
      board,
      currentPlayer: 'white',
      mode: 'STANDARD',
      phase: 'PLAYING',
      selectedPiece: null,
      validMoves: []
    };

    const result = preTurnAudit(state);
    expect(result.phase).toBe('CHECKMATE_AWAIT_CHOICE');
    expect(result.terminal).toBe('CHECKMATE');
    expect(result.pauseTimers).toBe(true);
  });

  it('returns ENDED with DRAW_STALEMATE when not in check with no legal moves', () => {
    // Create a stalemate position
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[0][0] = { type: 'king', player: 'white', position: { row: 0, col: 0 }, id: 'wk' };
    board[2][1] = { type: 'queen', player: 'black', position: { row: 2, col: 1 }, id: 'bq' };
    board[7][7] = { type: 'king', player: 'black', position: { row: 7, col: 7 }, id: 'bk' };

    const state: GameState = {
      board,
      currentPlayer: 'white',
      mode: 'STANDARD',
      phase: 'PLAYING',
      selectedPiece: null,
      validMoves: []
    };

    const result = preTurnAudit(state);
    expect(result.phase).toBe('ENDED');
    expect(result.terminal).toBe('DRAW_STALEMATE');
  });

  it('returns PLAYING in ANNIHILATION mode even with no moves (PASS handles it)', () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[0][0] = { type: 'king', player: 'white', position: { row: 0, col: 0 }, id: 'wk' };
    board[7][7] = { type: 'king', player: 'black', position: { row: 7, col: 7 }, id: 'bk' };

    const state: GameState = {
      board,
      currentPlayer: 'white',
      mode: 'ANNIHILATION',
      phase: 'PLAYING',
      selectedPiece: null,
      validMoves: []
    };

    const result = preTurnAudit(state);
    expect(result.phase).toBe('PLAYING');
  });
});
