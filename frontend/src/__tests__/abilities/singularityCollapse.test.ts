import { describe, it, expect } from 'vitest';
import { singularityCollapse } from '@/abilities/king.abilities';
import { AbilityContext } from '@/abilities/types';
import { GameState, Piece } from '@/types/game';

const createMockState = (pieces: Piece[]): GameState => ({
  pieces,
  board: Array(8).fill(null).map(() => Array(8).fill(null)),
  currentPlayer: 'white',
  mode: 'COSMIC_ANNIHILATION'
} as any);

const createCtx = (actor: Piece, pieces: Piece[], mode: 'STANDARD' | 'ANNIHILATION' = 'ANNIHILATION'): AbilityContext => ({
  state: createMockState(pieces),
  actor,
  player: actor.owner,
  mode
});

describe('Singularity Collapse', () => {
  it('should only be available in Annihilation mode', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    
    const stdCtx = createCtx(king, [king, friendly, enemy], 'STANDARD');
    const targets = singularityCollapse.getTargets(stdCtx);
    expect(targets).toHaveLength(0);
  });

  it('should require adjacent friendly to sacrifice', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(king, [king, enemy]);
    
    const result = singularityCollapse.validate(ctx, { kind: 'piece', id: 'e1' });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('adjacent friendly');
  });

  it('should target enemies within radius 2', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const enemyNear: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const enemyFar: Piece = { id: 'e2', type: 'PAWN', owner: 'BLACK', q: 4, r: 0 };
    const ctx = createCtx(king, [king, friendly, enemyNear, enemyFar]);
    
    const targets = singularityCollapse.getTargets(ctx);
    expect(targets).toContainEqual({ kind: 'piece', id: 'e1' });
    expect(targets).not.toContainEqual({ kind: 'piece', id: 'e2' });
  });

  it('should NOT target enemy king', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const enemyKing: Piece = { id: 'ek1', type: 'KING', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(king, [king, friendly, enemyKing]);
    
    const targets = singularityCollapse.getTargets(ctx);
    expect(targets).not.toContainEqual({ kind: 'piece', id: 'ek1' });
    
    const result = singularityCollapse.validate(ctx, { kind: 'piece', id: 'ek1' });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('enemy king');
  });

  it('should capture both friendly sacrifice and enemy target', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(king, [king, friendly, enemy]);
    
    const delta = singularityCollapse.apply(ctx, { kind: 'piece', id: 'e1' });
    expect(delta.capturedPieces).toContain('e1');
    expect(delta.capturedPieces).toContain('f1');
  });

  it('should have 1 use only', () => {
    expect(singularityCollapse.uses).toBe(1);
  });

  it('should decrement uses after apply', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const friendly: Piece = { id: 'f1', type: 'PAWN', owner: 'WHITE', q: 5, r: 4 };
    const enemy: Piece = { id: 'e1', type: 'PAWN', owner: 'BLACK', q: 4, r: 2 };
    const ctx = createCtx(king, [king, friendly, enemy]);
    
    const delta = singularityCollapse.apply(ctx, { kind: 'piece', id: 'e1' });
    expect(delta.usesDecrement).toContainEqual({ pieceId: 'k1', abilityId: 'singularity_collapse' });
  });
});
