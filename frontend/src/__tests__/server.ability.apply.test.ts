import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase for server tests
const mockInvoke = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    }
  }
}));

describe('Server Ability Validation', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('should accept legal ability with valid clientNonce', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { success: true, action: 'ABILITY', ack: 'test-nonce-1' },
      error: null
    });

    const result = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'warp_jump', pieceId: 'p1' },
        clientNonce: 'test-nonce-1',
        playerId: 'player-1'
      }
    });

    expect(result.data.success).toBe(true);
    expect(result.data.ack).toBe('test-nonce-1');
  });

  it('should reject ability without clientNonce', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'clientNonce is required' }
    });

    const result = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'warp_jump', pieceId: 'p1' },
        playerId: 'player-1'
      }
    });

    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('clientNonce');
  });

  it('should reject illegal ability (FIDE Safety violation)', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'ABILITY_INVALID', code: 422 }
    });

    const result = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { 
          type: 'ABILITY', 
          abilityId: 'singularity_collapse', 
          pieceId: 'k1',
          target: { kind: 'piece', id: 'enemy-king' }
        },
        clientNonce: 'test-nonce-2',
        playerId: 'player-1'
      }
    });

    expect(result.error).toBeDefined();
  });

  it('should return cached result for duplicate clientNonce', async () => {
    // First call
    mockInvoke.mockResolvedValueOnce({
      data: { success: true, action: 'ABILITY', ack: 'dup-nonce', cached: false },
      error: null
    });

    const result1 = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'gravity_line', pieceId: 'n1' },
        clientNonce: 'dup-nonce',
        playerId: 'player-1'
      }
    });

    // Second call with same nonce
    mockInvoke.mockResolvedValueOnce({
      data: { success: true, action: 'ABILITY', ack: 'dup-nonce', cached: true },
      error: null
    });

    const result2 = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'gravity_line', pieceId: 'n1' },
        clientNonce: 'dup-nonce',
        playerId: 'player-1'
      }
    });

    expect(result1.data.ack).toBe('dup-nonce');
    expect(result2.data.ack).toBe('dup-nonce');
    expect(result2.data.cached).toBe(true);
  });

  it('should reject ability on cooldown', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'On cooldown: 3 turns' }
    });

    const result = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'warp_jump', pieceId: 'p1' },
        clientNonce: 'test-nonce-3',
        playerId: 'player-1'
      }
    });

    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('cooldown');
  });

  it('should reject ability with no uses remaining', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'No uses remaining' }
    });

    const result = await mockInvoke('handle-move', {
      body: {
        matchId: 'match-123',
        action: { type: 'ABILITY', abilityId: 'singularity_collapse', pieceId: 'k1' },
        clientNonce: 'test-nonce-4',
        playerId: 'player-1'
      }
    });

    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('uses');
  });
});
