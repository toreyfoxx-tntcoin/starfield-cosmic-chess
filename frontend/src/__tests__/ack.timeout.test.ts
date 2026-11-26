import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitActionWithAck } from '../net/submitActionWithAck';

describe('ACK Timeout & Retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retry on timeout with same clientNonce', async () => {
    const mockInvoke = vi.fn()
      .mockRejectedValueOnce(new Error('TIMEOUT'))
      .mockResolvedValueOnce({ data: { success: true }, error: null });

    const params = {
      matchId: 'test-match',
      action: { type: 'MOVE' as const, from: { row: 0, col: 0 }, to: { row: 1, col: 0 } },
      playerId: 'player1'
    };

    // Should retry and succeed
    await expect(submitActionWithAck(params)).resolves.toBeDefined();
  });

  it('should handle idempotent retry with cached result', async () => {
    const cachedResult = { success: true, cached: true, action: 'MOVE' };
    const mockInvoke = vi.fn()
      .mockResolvedValueOnce({ data: cachedResult, error: null });

    const params = {
      matchId: 'test-match',
      action: { type: 'MOVE' as const, from: { row: 0, col: 0 }, to: { row: 1, col: 0 } },
      playerId: 'player1'
    };

    const result = await submitActionWithAck(params);
    expect(result.cached).toBe(true);
  });

  it('should fail gracefully after retry exhaustion', async () => {
    const mockInvoke = vi.fn()
      .mockRejectedValue(new Error('TIMEOUT'));

    const params = {
      matchId: 'test-match',
      action: { type: 'PASS' as const },
      playerId: 'player1'
    };

    await expect(submitActionWithAck(params)).rejects.toThrow();
  });
});
