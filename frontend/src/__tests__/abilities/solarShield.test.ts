import { describe, it, expect } from 'vitest';
import { solarShield } from '@/abilities/king.abilities';
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

describe('Solar Shield', () => {
  it('should create shield effect on 8 adjacent squares', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(king, [king]);
    
    const delta = solarShield.apply(ctx, { kind: 'none' });
    const shield = delta.effects?.find(e => e.kind === 'SHIELD_ADJACENT');
    
    expect(shield).toBeDefined();
    expect(shield!.kingId).toBe('k1');
  });

  it('should have TTL of 2 ply', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(king, [king]);
    
    const delta = solarShield.apply(ctx, { kind: 'none' });
    const shield = delta.effects?.find(e => e.kind === 'SHIELD_ADJACENT');
    
    expect(shield!.ttl).toBe(2);
  });

  it('should have cooldown of 6 turns', () => {
    expect(solarShield.cooldown).toBe(6);
  });

  it('should always be valid (no FIDE safety concerns)', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(king, [king]);
    
    const result = solarShield.validate(ctx, { kind: 'none' });
    expect(result.ok).toBe(true);
  });

  it('should set cooldown after use', () => {
    const king: Piece = { id: 'k1', type: 'KING', owner: 'WHITE', q: 4, r: 4 };
    const ctx = createCtx(king, [king]);
    
    const delta = solarShield.apply(ctx, { kind: 'none' });
    
    expect(delta.cooldowns).toContainEqual({ 
      pieceId: 'k1', 
      abilityId: 'solar_shield', 
      turns: 6 
    });
  });

  it('should be targetKind none', () => {
    expect(solarShield.targetKind).toBe('none');
  });
});
