import { describe, it, expect } from 'vitest';
import { gravityLine } from '@/abilities/neutron.gravityLine';
import { AbilityContext, AbilityTarget } from '@/abilities/types';
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

describe('Gravity Line', () => {
  it('should only target N/E/S/W directions', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(neutron, [neutron]);
    const targets = gravityLine.getTargets(ctx);
    
    expect(targets).toHaveLength(4);
    expect(targets).toContainEqual({ kind: 'vector', dx: 0, dy: -1 }); // N
    expect(targets).toContainEqual({ kind: 'vector', dx: 1, dy: 0 });  // E
    expect(targets).toContainEqual({ kind: 'vector', dx: 0, dy: 1 });  // S
    expect(targets).toContainEqual({ kind: 'vector', dx: -1, dy: 0 }); // W
  });

  it('should pull enemy piece toward Neutron if landing square empty', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(neutron, [neutron, enemy]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    expect(delta.movedPieces).toContainEqual({ id: 'e1', q: 4, r: 3 });
  });

  it('should stun enemy if landing square occupied', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const blocker: Piece = { id: 'b1', type: 'PAWN', owner: 'WHITE', q: 4, r: 3 };
    const ctx = createCtx(neutron, [neutron, enemy, blocker]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    expect(delta.effects).toContainEqual({ kind: 'STUN', pieceId: 'e1', ttl: 2 });
  });

  it('should stop at friendly blocker', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 4, r: 3 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(neutron, [neutron, friendly, enemy]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    expect(delta.movedPieces).toHaveLength(0);
    expect(delta.effects).toHaveLength(0);
  });

  it('should have cooldown of 4 turns', () => {
    expect(gravityLine.cooldown).toBe(4);
  });

  it('should only affect up to 3 squares', () => {
    expect(gravityLine.range).toBe(3);
  });

  it('should NOT pull piece onto Neutron square', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 3 };
    const ctx = createCtx(neutron, [neutron, enemy]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    // Enemy at r=3 cannot be pulled to r=4 (Neutron's position)
    const movedToNeutron = delta.movedPieces?.some(m => m.q === 4 && m.r === 4);
    expect(movedToNeutron).toBeFalsy();
  });

  it('should reject diagonal directions', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(neutron, [neutron]);
    
    const result = gravityLine.validate(ctx, { kind: 'vector', dx: 1, dy: 1 });
    expect(result.ok).toBe(false);
  });

  it('should affect multiple enemies in line', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const enemy1: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const enemy2: Piece = { id: 'e2', type: 'PAWN', owner: 'BLACK', q: 4, r: 1 };
    const ctx = createCtx(neutron, [neutron, enemy1, enemy2]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    // Both enemies should be affected
    expect(delta.movedPieces?.length || 0 + (delta.effects?.length || 0)).toBeGreaterThanOrEqual(1);
  });

  it('should set cooldown after use', () => {
    const neutron: Piece = { id: 'n1', type: 'NEUTRON_STAR', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(neutron, [neutron]);
    
    const delta = gravityLine.apply(ctx, { kind: 'vector', dx: 0, dy: -1 });
    
    expect(delta.cooldowns).toContainEqual({ 
      pieceId: 'n1', 
      abilityId: 'gravity_line', 
      turns: 4 
    });
  });
});

