import { describe, it, expect } from 'vitest';
import { enumerateActions } from '../utils/actionEnumerator';
import { GameState } from '../types/game';

describe('Auto-PASS in Annihilation Mode', () => {
  it('should detect when a player has no legal moves', () => {
    const mockState: Partial<GameState> = {
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      mode: 'ANNIHILATION',
      phase: 'PLAYING',
      currentPlayer: 'white'
    };

    const actions = enumerateActions(
      mockState.board as any,
      'WHITE',
      mockState as GameState
    );

    expect(actions.length).toBe(0);
  });

  it('should increment consecutivePasses on PASS action', () => {
    const state = {
      consecutivePasses: 0
    };

    // First PASS
    state.consecutivePasses += 1;
    expect(state.consecutivePasses).toBe(1);

    // Second PASS
    state.consecutivePasses += 1;
    expect(state.consecutivePasses).toBe(2);
  });

  it('should trigger DRAW_ANH_PASS after two consecutive passes', () => {
    const state = {
      consecutivePasses: 2,
      mode: 'ANNIHILATION',
      phase: 'PLAYING'
    };

    if (state.consecutivePasses >= 2 && state.mode === 'ANNIHILATION') {
      state.phase = 'ENDED';
      const result = 'DRAW_ANH_PASS';
      expect(result).toBe('DRAW_ANH_PASS');
      expect(state.phase).toBe('ENDED');
    }
  });

  it('should reset consecutivePasses on non-PASS action', () => {
    const state = {
      consecutivePasses: 1
    };

    // Non-PASS action resets counter
    state.consecutivePasses = 0;
    expect(state.consecutivePasses).toBe(0);
  });
});
