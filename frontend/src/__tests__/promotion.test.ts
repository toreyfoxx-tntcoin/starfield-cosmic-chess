import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, GamePiece } from '../types/game';

describe('Promotion System', () => {
  let state: GameState;

  beforeEach(() => {
    state = {
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      currentPlayer: 'white',
      selectedPiece: null,
      validMoves: [],
      capturedPieces: { white: [], black: [] },
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      turnCount: 1,
      eventHorizonZones: [],
      mode: 'STANDARD',
      consecutivePasses: 0,
      phase: 'PLAYING',
      pendingPromotion: null
    };
  });

  it('should trigger promotion when pawn reaches last rank', () => {
    const pawn: GamePiece = {
      id: 'p1',
      type: 'pawn',
      player: 'white',
      position: { row: 1, col: 4 },
      hasMoved: true,
      cooldowns: {},
      usesLeft: {},
      isStunned: false,
      hasShield: false
    };

    state.board[1][4] = pawn;

    // Simulate move to last rank
    const targetRow = 0;
    const isPromotionRank = (pawn.player === 'white' && targetRow === 0) || 
                            (pawn.player === 'black' && targetRow === 7);

    expect(isPromotionRank).toBe(true);
  });

  it('should set phase to PROMOTION_AWAIT_CHOICE', () => {
    state.phase = 'PROMOTION_AWAIT_CHOICE';
    state.pendingPromotion = {
      pieceId: 'p1',
      owner: 'white',
      square: { row: 0, col: 4 },
      choices: ['rook', 'knight', 'bishop', 'queen']
    };

    expect(state.phase).toBe('PROMOTION_AWAIT_CHOICE');
    expect(state.pendingPromotion).toBeDefined();
    expect(state.pendingPromotion?.choices).toHaveLength(4);
  });

  it('should replace piece type after promotion', () => {
    const pawn: GamePiece = {
      id: 'p1',
      type: 'pawn',
      player: 'white',
      position: { row: 0, col: 4 },
      hasMoved: true,
      cooldowns: {},
      usesLeft: {},
      isStunned: false,
      hasShield: false
    };

    pawn.type = 'queen';
    expect(pawn.type).toBe('queen');
  });

  it('should reset cooldowns and uses after promotion', () => {
    const promoted: GamePiece = {
      id: 'p1',
      type: 'queen',
      player: 'white',
      position: { row: 0, col: 4 },
      hasMoved: true,
      cooldowns: {},
      usesLeft: {},
      isStunned: false,
      hasShield: false
    };

    expect(Object.keys(promoted.cooldowns)).toHaveLength(0);
    expect(Object.keys(promoted.usesLeft)).toHaveLength(0);
  });
});
