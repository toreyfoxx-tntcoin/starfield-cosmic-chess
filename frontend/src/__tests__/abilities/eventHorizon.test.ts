import { describe, it, expect } from 'vitest';
import { eventHorizon } from '@/abilities/blackhole.eventHorizon';
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

describe('Event Horizon', () => {
  it('should create 3x3 zone centered on queen', () => {
    const blackHole: Piece = { id: 'bh1', type: 'BLACK_HOLE', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blackHole, [blackHole]);
    
    const delta = eventHorizon.apply(ctx, { kind: 'none' });
    const zone = delta.effects?.find(e => e.kind === 'ZONE_EVENT_HORIZON');
    
    expect(zone).toBeDefined();
    expect(zone!.squares).toHaveLength(9); // 3x3 = 9 squares
    
    // Verify all squares are within Chebyshev distance 1
    for (const sq of zone!.squares) {
      expect(Math.max(Math.abs(sq.q - 4), Math.abs(sq.r - 4))).toBeLessThanOrEqual(1);
    }
  });

  it('should have TTL of 2 ply (1 turn)', () => {
    const blackHole: Piece = { id: 'bh1', type: 'BLACK_HOLE', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blackHole, [blackHole]);
    
    const delta = eventHorizon.apply(ctx, { kind: 'none' });
    const zone = delta.effects?.find(e => e.kind === 'ZONE_EVENT_HORIZON');
    
    expect(zone!.ttl).toBe(2);
  });

  it('should have cooldown of 5 turns', () => {
    expect(eventHorizon.cooldown).toBe(5);
  });

  it('should handle edge of board correctly', () => {
    const blackHole: Piece = { id: 'bh1', type: 'BLACK_HOLE', owner: 'WHITE', q: 0, r: 0 };
    const ctx = createCtx(blackHole, [blackHole]);
    
    const delta = eventHorizon.apply(ctx, { kind: 'none' });
    const zone = delta.effects?.find(e => e.kind === 'ZONE_EVENT_HORIZON');
    
    // Corner: only 4 squares on board
    expect(zone!.squares).toHaveLength(4);
    expect(zone!.squares).toContainEqual({ q: 0, r: 0 });
    expect(zone!.squares).toContainEqual({ q: 1, r: 0 });
    expect(zone!.squares).toContainEqual({ q: 0, r: 1 });
    expect(zone!.squares).toContainEqual({ q: 1, r: 1 });
  });

  it('should always be valid (no FIDE safety concerns)', () => {
    const blackHole: Piece = { id: 'bh1', type: 'BLACK_HOLE', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blackHole, [blackHole]);
    
    const result = eventHorizon.validate(ctx, { kind: 'none' });
    expect(result.ok).toBe(true);
  });

  it('should set owner on zone effect', () => {
    const blackHole: Piece = { id: 'bh1', type: 'BLACK_HOLE', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blackHole, [blackHole]);
    
    const delta = eventHorizon.apply(ctx, { kind: 'none' });
    const zone = delta.effects?.find(e => e.kind === 'ZONE_EVENT_HORIZON');
    
    expect(zone!.owner).toBe('WHITE');
  });
});
