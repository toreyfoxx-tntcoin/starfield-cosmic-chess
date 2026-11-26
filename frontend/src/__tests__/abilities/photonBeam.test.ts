import { describe, it, expect } from 'vitest';
import { photonBeam } from '@/abilities/bluegiant.photonBeam';
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

describe('Photon Beam', () => {
  it('should only target diagonal directions', () => {
    const blueGiant: Piece = { id: 'bg1', type: 'BLUE_GIANT', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blueGiant, [blueGiant]);
    const targets = photonBeam.getTargets(ctx);
    
    expect(targets).toHaveLength(4);
    expect(targets).toContainEqual({ kind: 'vector', dx: 1, dy: -1 });  // NE
    expect(targets).toContainEqual({ kind: 'vector', dx: 1, dy: 1 });   // SE
    expect(targets).toContainEqual({ kind: 'vector', dx: -1, dy: 1 });  // SW
    expect(targets).toContainEqual({ kind: 'vector', dx: -1, dy: -1 }); // NW
  });

  it('should reject non-diagonal directions', () => {
    const blueGiant: Piece = { id: 'bg1', type: 'BLUE_GIANT', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(blueGiant, [blueGiant]);
    
    const result = photonBeam.validate(ctx, { kind: 'vector', dx: 0, dy: -1 });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('diagonal');
  });

  it('should push first enemy 1 square if space empty', () => {
    const blueGiant: Piece = { id: 'bg1', type: 'BLUE_GIANT', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 5, r: 3 };
    const ctx = createCtx(blueGiant, [blueGiant, enemy]);
    
    const delta = photonBeam.apply(ctx, { kind: 'vector', dx: 1, dy: -1 });
    expect(delta.movedPieces).toContainEqual({ id: 'e1', q: 6, r: 2 });
  });

  it('should stun enemy if push destination blocked', () => {
    const blueGiant: Piece = { id: 'bg1', type: 'BLUE_GIANT', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 5, r: 3 };
    const blocker: Piece = { id: 'b1', type: 'PAWN', owner: 'BLACK', q: 6, r: 2 };
    const ctx = createCtx(blueGiant, [blueGiant, enemy, blocker]);
    
    const delta = photonBeam.apply(ctx, { kind: 'vector', dx: 1, dy: -1 });
    expect(delta.effects).toContainEqual({ kind: 'STUN', pieceId: 'e1', ttl: 2 });
  });

  it('should stun if push would go off board', () => {
    const blueGiant: Piece = { id: 'bg1', type: 'BLUE_GIANT', owner: 'WHITE', q: 6, r: 2 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 7, r: 1 };
    const ctx = createCtx(blueGiant, [blueGiant, enemy]);
    
    const delta = photonBeam.apply(ctx, { kind: 'vector', dx: 1, dy: -1 });
    expect(delta.effects).toContainEqual({ kind: 'STUN', pieceId: 'e1', ttl: 2 });
  });

  it('should have cooldown of 4 turns', () => {
    expect(photonBeam.cooldown).toBe(4);
  });

  it('should have range of 3 squares', () => {
    expect(photonBeam.range).toBe(3);
  });
});
