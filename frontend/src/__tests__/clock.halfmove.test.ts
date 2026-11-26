import { describe, it, expect } from 'vitest';
import { applyAbility } from '@/abilities/abilityEngine';
import { GameState, GameAction, GamePiece } from '@/types/game';

const createBoard = (): (GamePiece | null)[][] => {
  return Array(8).fill(null).map(() => Array(8).fill(null));
};

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: createBoard(),
  currentPlayer: 'white',
  phase: 'PLAYING',
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  halfMoveClock: 10,
  fullMoveNumber: 5,
  mode: 'FIDE_COSMIC',
  ...overrides
} as GameState);

describe('Half-Move Clock', () => {
  it('should NOT reset on non-capturing ability use', () => {
    const state = createGameState({ halfMoveClock: 25 });
    const pulsar: GamePiece = {
      id: 'p1',
      type: 'pulsar',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: {},
      usesLeft: {}
    };
    state.board[4][4] = pulsar;

    const action: GameAction = {
      type: 'ABILITY',
      abilityId: 'warp_jump',
      pieceId: 'p1',
      target: { kind: 'square', q: 5, r: 5 }
    };

    const { newState } = applyAbility(state, action);
    
    // Half-move clock should remain unchanged (no capture)
    expect(newState.halfMoveClock).toBe(25);
  });

  it('should preserve halfMoveClock when applying Event Horizon', () => {
    const state = createGameState({ halfMoveClock: 30 });
    const blackHole: GamePiece = {
      id: 'bh1',
      type: 'black_hole',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: {},
      usesLeft: {}
    };
    state.board[4][4] = blackHole;

    const action: GameAction = {
      type: 'ABILITY',
      abilityId: 'event_horizon',
      pieceId: 'bh1',
      target: { kind: 'none' }
    };

    const { newState } = applyAbility(state, action);
    expect(newState.halfMoveClock).toBe(30);
  });

  it('should preserve halfMoveClock when applying Solar Shield', () => {
    const state = createGameState({ halfMoveClock: 40 });
    const king: GamePiece = {
      id: 'k1',
      type: 'king',
      player: 'white',
      position: { row: 7, col: 4 },
      hasMoved: false,
      cooldowns: {},
      usesLeft: {}
    };
    state.board[7][4] = king;

    const action: GameAction = {
      type: 'ABILITY',
      abilityId: 'solar_shield',
      pieceId: 'k1',
      target: { kind: 'none' }
    };

    const { newState } = applyAbility(state, action);
    expect(newState.halfMoveClock).toBe(40);
  });

  it('should preserve halfMoveClock when applying Gravity Line (pull only)', () => {
    const state = createGameState({ halfMoveClock: 15 });
    const neutron: GamePiece = {
      id: 'n1',
      type: 'neutron_star',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: {},
      usesLeft: {}
    };
    state.board[4][4] = neutron;

    const action: GameAction = {
      type: 'ABILITY',
      abilityId: 'gravity_line',
      pieceId: 'n1',
      target: { kind: 'vector', dx: 0, dy: -1 }
    };

    const { newState } = applyAbility(state, action);
    // No capture occurred, clock should stay same
    expect(newState.halfMoveClock).toBe(15);
  });

  it('should preserve halfMoveClock when applying Photon Beam (push only)', () => {
    const state = createGameState({ halfMoveClock: 20 });
    const blueGiant: GamePiece = {
      id: 'bg1',
      type: 'blue_giant',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: {},
      usesLeft: {}
    };
    state.board[4][4] = blueGiant;

    const action: GameAction = {
      type: 'ABILITY',
      abilityId: 'photon_beam',
      pieceId: 'bg1',
      target: { kind: 'vector', dx: 1, dy: -1 }
    };

    const { newState } = applyAbility(state, action);
    expect(newState.halfMoveClock).toBe(20);
  });
});
