import { describe, it, expect } from 'vitest';
import { tickEffects } from '@/abilities/abilityEngine';
import { GameState, GamePiece } from '@/types/game';

const createBoard = (): (GamePiece | null)[][] => {
  return Array(8).fill(null).map(() => Array(8).fill(null));
};

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: createBoard(),
  currentPlayer: 'white',
  phase: 'PLAYING',
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  halfMoveClock: 0,
  fullMoveNumber: 1,
  mode: 'FIDE_COSMIC',
  effects: [],
  ...overrides
} as GameState);

describe('Zones & Stuns TTL', () => {
  it('should tick cooldowns each ply', () => {
    const state = createGameState();
    const piece: GamePiece = {
      id: 'p1',
      type: 'neutron_star',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: { gravity_line: 4 },
      usesLeft: {}
    };
    state.board[4][4] = piece;

    const newState = tickEffects(state);
    expect(newState.board[4][4]?.cooldowns?.gravity_line).toBe(3);
  });

  it('should tick cooldowns to zero', () => {
    const state = createGameState();
    const piece: GamePiece = {
      id: 'p1',
      type: 'pulsar',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: { warp_jump: 1 },
      usesLeft: {}
    };
    state.board[4][4] = piece;

    const newState = tickEffects(state);
    expect(newState.board[4][4]?.cooldowns?.warp_jump).toBe(0);
  });

  it('should not go negative on cooldowns', () => {
    const state = createGameState();
    const piece: GamePiece = {
      id: 'p1',
      type: 'blue_giant',
      player: 'white',
      position: { row: 4, col: 4 },
      hasMoved: false,
      cooldowns: { photon_beam: 0 },
      usesLeft: {}
    };
    state.board[4][4] = piece;

    const newState = tickEffects(state);
    expect(newState.board[4][4]?.cooldowns?.photon_beam).toBe(0);
  });

  it('should tick multiple cooldowns on same piece', () => {
    const state = createGameState();
    const piece: GamePiece = {
      id: 'k1',
      type: 'king',
      player: 'white',
      position: { row: 7, col: 4 },
      hasMoved: false,
      cooldowns: { solar_shield: 6, singularity_collapse: 0 },
      usesLeft: {}
    };
    state.board[7][4] = piece;

    const newState = tickEffects(state);
    expect(newState.board[7][4]?.cooldowns?.solar_shield).toBe(5);
    expect(newState.board[7][4]?.cooldowns?.singularity_collapse).toBe(0);
  });

  it('should tick cooldowns on all pieces', () => {
    const state = createGameState();
    const piece1: GamePiece = {
      id: 'n1',
      type: 'neutron_star',
      player: 'white',
      position: { row: 0, col: 0 },
      hasMoved: false,
      cooldowns: { gravity_line: 3 },
      usesLeft: {}
    };
    const piece2: GamePiece = {
      id: 'p1',
      type: 'pulsar',
      player: 'black',
      position: { row: 7, col: 7 },
      hasMoved: false,
      cooldowns: { warp_jump: 2 },
      usesLeft: {}
    };
    state.board[0][0] = piece1;
    state.board[7][7] = piece2;

    const newState = tickEffects(state);
    expect(newState.board[0][0]?.cooldowns?.gravity_line).toBe(2);
    expect(newState.board[7][7]?.cooldowns?.warp_jump).toBe(1);
  });

  it('should preserve piece properties when ticking', () => {
    const state = createGameState();
    const piece: GamePiece = {
      id: 'bg1',
      type: 'blue_giant',
      player: 'white',
      position: { row: 2, col: 2 },
      hasMoved: true,
      cooldowns: { photon_beam: 4 },
      usesLeft: { photon_beam: 2 }
    };
    state.board[2][2] = piece;

    const newState = tickEffects(state);
    expect(newState.board[2][2]?.id).toBe('bg1');
    expect(newState.board[2][2]?.type).toBe('blue_giant');
    expect(newState.board[2][2]?.player).toBe('white');
    expect(newState.board[2][2]?.hasMoved).toBe(true);
    expect(newState.board[2][2]?.usesLeft?.photon_beam).toBe(2);
  });
});
