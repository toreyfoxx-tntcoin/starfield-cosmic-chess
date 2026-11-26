import { describe, it, expect } from 'vitest';
import { stellarFlare } from '@/abilities/reddwarf.stellarFlare';
import { AbilityContext } from '@/abilities/types';
import { GameState, Piece } from '@/types/game';

const createMockState = (pieces: Piece[]): GameState => ({
  pieces,
  board: Array(8).fill(null).map(() => Array(8).fill(null)),
  currentPlayer: 'white',
  mode: 'FIDE_COSMIC',
  halfMoveClock: 10
} as any);

const createCtx = (actor: Piece, pieces: Piece[], captor?: Piece): AbilityContext & { captor?: Piece } => ({
  state: createMockState(pieces),
  actor,
  player: actor.owner,
  mode: 'STANDARD',
  ...(captor ? { captor } : {})
});

describe('Stellar Flare', () => {
  it('should be reactive only - no active targets', () => {
    const redDwarf: Piece = { id: 'rd1', type: 'RED_DWARF', owner: 'WHITE', q: 4, r: 6 };
    const ctx = createCtx(redDwarf, [redDwarf]);
    const targets = stellarFlare.getTargets(ctx);
    expect(targets).toHaveLength(0);
  });

  it('should reject active use', () => {
    const redDwarf: Piece = { id: 'rd1', type: 'RED_DWARF', owner: 'WHITE', q: 4, r: 6 };
    const ctx = createCtx(redDwarf, [redDwarf]);
    const result = stellarFlare.validate(ctx, { kind: 'none' });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('reactive');
  });

  it('should stun captor for 1 ply when captured', () => {
    const redDwarf: Piece = { id: 'rd1', type: 'RED_DWARF', owner: 'WHITE', q: 4, r: 6 };
    const captor: Piece = { id: 'c1', type: 'PAWN', owner: 'BLACK', q: 4, r: 5 };
    const ctx = createCtx(redDwarf, [redDwarf, captor], captor);
    
    const delta = stellarFlare.onCapture!(ctx as any);
    expect(delta).not.toBeNull();
    expect(delta!.effects).toContainEqual({ kind: 'STUN', pieceId: 'c1', ttl: 2 });
  });

  it('should NOT trigger when captured by king', () => {
    const redDwarf: Piece = { id: 'rd1', type: 'RED_DWARF', owner: 'WHITE', q: 4, r: 6 };
    const king: Piece = { id: 'k1', type: 'KING', owner: 'BLACK', q: 4, r: 5 };
    const ctx = createCtx(redDwarf, [redDwarf, king], king);
    
    const delta = stellarFlare.onCapture!(ctx as any);
    expect(delta).toBeNull();
  });

  it('should have 1 use only', () => {
    expect(stellarFlare.uses).toBe(1);
  });

  it('should decrement uses when triggered', () => {
    const redDwarf: Piece = { id: 'rd1', type: 'RED_DWARF', owner: 'WHITE', q: 4, r: 6 };
    const captor: Piece = { id: 'c1', type: 'ROOK', owner: 'BLACK', q: 4, r: 5 };
    const ctx = createCtx(redDwarf, [redDwarf, captor], captor);
    
    const delta = stellarFlare.onCapture!(ctx as any);
    expect(delta!.usesDecrement).toContainEqual({ pieceId: 'rd1', abilityId: 'stellar_flare' });
  });
});
