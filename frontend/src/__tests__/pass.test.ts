import { describe, it, expect } from 'vitest';
import { enumerateActions } from '../utils/actionEnumerator';
import { handlePassAction } from '../utils/gameState';
import { getBestAction } from '../utils/aiOpponentV2';

describe('PASS action handling', () => {
  it('should return PASS when no legal actions in ANNIHILATION mode', () => {
    const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    const action = getBestAction(emptyBoard, 'white', 'easy', 'ANNIHILATION');
    expect(action.type).toBe('PASS');
  });

  it('should return STALEMATE in STANDARD mode with no legal actions', () => {
    const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    const action = getBestAction(emptyBoard, 'white', 'easy', 'STANDARD');
    expect(action.type).toBe('TERMINAL');
    expect(action.result).toBe('DRAW_STALEMATE');
  });

  it('should tick durations on PASS', () => {
    const state = {
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      currentPlayer: 'white' as const,
      consecutivePasses: 0,
      turnCount: 0,
      eventHorizonZones: [{ row: 4, col: 4 }]
    };
    
    const newState = handlePassAction(state as any);
    expect(newState.currentPlayer).toBe('black');
    expect(newState.consecutivePasses).toBe(1);
    expect(newState.turnCount).toBe(1);
  });
});
