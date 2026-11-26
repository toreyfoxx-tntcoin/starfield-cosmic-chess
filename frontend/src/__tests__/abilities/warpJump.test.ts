import { describe, it, expect } from 'vitest';
import { warpJump } from '@/abilities/pulsar.warpJump';
import { AbilityContext } from '@/abilities/types';
import { GameState, Piece } from '@/types/game';

const createMockState = (pieces: Piece[]): GameState => ({
  pieces,
  board: Array(8).fill(null).map(() => Array(8).fill(null)),
  currentPlayer: 'white',
  mode: 'FIDE_COSMIC'
} as any);

const createCtx = (actor: Piece, pieces: Piece[]): AbilityContext => ({
  state: createMockState(pieces),
  actor,
  player: actor.owner,
  mode: 'STANDARD'
});

describe('Warp Jump', () => {
  it('should target only empty squares in 3x3 (Chebyshev ≤ 1)', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(pulsar, [pulsar]);
    const targets = warpJump.getTargets(ctx);
    
    // 8 squares around (3x3 minus center)
    expect(targets).toHaveLength(8);
    
    // Verify all targets are within Chebyshev distance 1
    for (const t of targets) {
      if (t.kind === 'square') {
        const dq = Math.abs(t.q - 4);
        const dr = Math.abs(t.r - 4);
        expect(Math.max(dq, dr)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('should not target occupied squares', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const blocker: Piece = { id: 'b1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const ctx = createCtx(pulsar, [pulsar, blocker]);
    const targets = warpJump.getTargets(ctx);
    
    expect(targets).toHaveLength(7); // One less due to blocker
    expect(targets).not.toContainEqual({ kind: 'square', q: 5, r: 4 });
  });

  it('should reject targets outside 3x3 range', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(pulsar, [pulsar]);
    
    const result = warpJump.validate(ctx, { kind: 'square', q: 6, r: 4 });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('out of range');
  });

  it('should reject occupied target squares', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const blocker: Piece = { id: 'b1', type: 'PAWN', owner: 'BLACK', q: 5, r: 4 };
    const ctx = createCtx(pulsar, [pulsar, blocker]);
    
    const result = warpJump.validate(ctx, { kind: 'square', q: 5, r: 4 });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('occupied');
  });

  it('should move pulsar to target square', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(pulsar, [pulsar]);
    
    const delta = warpJump.apply(ctx, { kind: 'square', q: 5, r: 5 });
    
    expect(delta.movedPieces).toContainEqual({ id: 'p1', q: 5, r: 5 });
  });

  it('should have cooldown of 3 turns', () => {
    expect(warpJump.cooldown).toBe(3);
  });



  it('should handle edge of board correctly', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 0, r: 0 };
    const ctx = createCtx(pulsar, [pulsar]);
    const targets = warpJump.getTargets(ctx);
    
    // Corner: only 3 valid squares
    expect(targets).toHaveLength(3);
    expect(targets).toContainEqual({ kind: 'square', q: 1, r: 0 });
    expect(targets).toContainEqual({ kind: 'square', q: 0, r: 1 });
    expect(targets).toContainEqual({ kind: 'square', q: 1, r: 1 });
  });

  it('should set cooldown after use', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(pulsar, [pulsar]);
    
    const delta = warpJump.apply(ctx, { kind: 'square', q: 5, r: 5 });
    
    expect(delta.cooldowns).toContainEqual({ 
      pieceId: 'p1', 
      abilityId: 'warp_jump', 
      turns: 3 
    });
  });

  it('should reject same square as current position', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(pulsar, [pulsar]);
    const targets = warpJump.getTargets(ctx);
    
    // Should not include current position
    expect(targets).not.toContainEqual({ kind: 'square', q: 4, r: 4 });
  });

  it('should have targetKind square', () => {
    expect(warpJump.targetKind).toBe('square');
  });

  it('should not target squares with enemy pieces', () => {
    const pulsar: Piece = { id: 'p1', type: 'PULSAR', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 5, r: 5 };
    const ctx = createCtx(pulsar, [pulsar, enemy]);
    const targets = warpJump.getTargets(ctx);
    
    expect(targets).not.toContainEqual({ kind: 'square', q: 5, r: 5 });
  });
});
