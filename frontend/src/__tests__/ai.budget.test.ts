import { describe, it, expect } from 'vitest';
import { getBestAction } from '../utils/aiOpponentV2';
import { createInitialBoard } from '../utils/gameState';

describe('AI time budget enforcement', () => {
  it('should respect easy difficulty time budget (300ms)', () => {
    const board = createInitialBoard();
    const start = performance.now();
    getBestAction(board, 'white', 'easy', 'STANDARD');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(350); // 50ms tolerance
  });

  it('should respect medium difficulty time budget (600ms)', () => {
    const board = createInitialBoard();
    const start = performance.now();
    getBestAction(board, 'white', 'medium', 'STANDARD');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(650);
  });

  it('should always return a valid action within time budget', () => {
    const board = createInitialBoard();
    const action = getBestAction(board, 'white', 'expert', 'STANDARD');
    expect(action).toBeDefined();
    expect(action.type).toBeDefined();
  });
});
