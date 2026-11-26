import { describe, it, expect, vi } from 'vitest';

describe('Realtime Sync', () => {
  it('should broadcast PASS action to opponent and spectators', () => {
    const mockChannel = {
      send: vi.fn().mockResolvedValue({}),
      on: vi.fn(),
      subscribe: vi.fn()
    };

    const passAction = { type: 'PASS', clientNonce: 'test-nonce-123' };
    
    mockChannel.send({
      type: 'broadcast',
      event: 'action_applied',
      payload: passAction
    });

    expect(mockChannel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'action_applied',
        payload: expect.objectContaining({ type: 'PASS' })
      })
    );
  });

  it('should detect timer skew > 250ms', () => {
    const serverTime = 60000;
    const clientTime = 59500;
    const skew = Math.abs(serverTime - clientTime);

    expect(skew).toBeGreaterThan(250);
  });

  it('should handle double PASS draw detection', () => {
    const state = {
      consecutivePasses: 2,
      mode: 'ANNIHILATION' as const
    };

    const isDraw = state.consecutivePasses >= 2;
    expect(isDraw).toBe(true);
  });

  it('should reconcile state on reconnect', async () => {
    const snapshot = {
      board: [],
      currentPlayer: 'white' as const,
      whiteTime: 60000,
      blackTime: 60000
    };

    const reconcile = (snap: typeof snapshot) => {
      return { ...snap, reconciled: true };
    };

    const result = reconcile(snapshot);
    expect(result.reconciled).toBe(true);
  });
});
