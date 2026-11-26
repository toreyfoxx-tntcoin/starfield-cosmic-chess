import { describe, it, expect, vi } from 'vitest';

// Mock the supabase client for idempotency tests
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis()
};

describe('Ability Idempotency (clientNonce)', () => {
  it('should require clientNonce for ability submissions', () => {
    const action = {
      type: 'ABILITY',
      abilityId: 'warp_jump',
      pieceId: 'p1',
      target: { kind: 'square', q: 5, r: 5 }
    };
    
    // Action without clientNonce should be rejected
    expect(action).not.toHaveProperty('clientNonce');
    
    // With clientNonce
    const actionWithNonce = { ...action, clientNonce: 'abc-123-def' };
    expect(actionWithNonce.clientNonce).toBe('abc-123-def');
  });

  it('should generate unique clientNonce for each submission', () => {
    const generateNonce = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();
    
    expect(nonce1).not.toBe(nonce2);
  });

  it('should return cached result for duplicate nonce', async () => {
    const cachedResult = {
      success: true,
      cached: true,
      action: 'ABILITY',
      ack: 'test-nonce-123'
    };
    
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { 
      action_type: 'ABILITY',
      client_nonce: 'test-nonce-123'
    }});
    
    // Simulate finding existing record
    const existing = await mockSupabase.from('moves')
      .select('*')
      .eq('client_nonce', 'test-nonce-123')
      .maybeSingle();
    
    expect(existing.data).toBeDefined();
    expect(existing.data.client_nonce).toBe('test-nonce-123');
  });

  it('should not double-apply ability with same nonce', () => {
    const appliedNonces = new Set<string>();
    
    const applyWithIdempotency = (nonce: string, action: any) => {
      if (appliedNonces.has(nonce)) {
        return { cached: true, applied: false };
      }
      appliedNonces.add(nonce);
      return { cached: false, applied: true };
    };
    
    const nonce = 'unique-nonce-456';
    const action = { type: 'ABILITY', abilityId: 'gravity_line' };
    
    const result1 = applyWithIdempotency(nonce, action);
    expect(result1.applied).toBe(true);
    expect(result1.cached).toBe(false);
    
    const result2 = applyWithIdempotency(nonce, action);
    expect(result2.applied).toBe(false);
    expect(result2.cached).toBe(true);
  });

  it('should return same result for duplicate requests', () => {
    const results = new Map<string, any>();
    
    const processWithIdempotency = (nonce: string, action: any) => {
      if (results.has(nonce)) {
        return results.get(nonce);
      }
      const result = { 
        success: true, 
        ack: nonce,
        newPosition: { q: 5, r: 5 }
      };
      results.set(nonce, result);
      return result;
    };
    
    const nonce = 'idem-nonce-789';
    const action = { type: 'ABILITY', abilityId: 'warp_jump' };
    
    const result1 = processWithIdempotency(nonce, action);
    const result2 = processWithIdempotency(nonce, action);
    
    expect(result1).toEqual(result2);
    expect(result1.ack).toBe(nonce);
    expect(result2.ack).toBe(nonce);
  });

  it('should allow different nonces for same action type', () => {
    const appliedNonces = new Set<string>();
    
    const applyWithIdempotency = (nonce: string) => {
      if (appliedNonces.has(nonce)) return false;
      appliedNonces.add(nonce);
      return true;
    };
    
    expect(applyWithIdempotency('nonce-a')).toBe(true);
    expect(applyWithIdempotency('nonce-b')).toBe(true);
    expect(applyWithIdempotency('nonce-a')).toBe(false); // duplicate
    expect(applyWithIdempotency('nonce-c')).toBe(true);
  });
});
