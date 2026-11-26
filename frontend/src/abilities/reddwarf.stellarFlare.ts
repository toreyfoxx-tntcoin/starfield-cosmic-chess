import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';
import { Piece } from '@/types/game';

export const stellarFlare: AbilityDef = {
  id: 'stellar_flare',
  name: 'Stellar Flare',
  pieceType: 'RED_DWARF',
  cooldown: 0,
  uses: 1,
  targetKind: 'none',

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    // Reactive ability - no active targets
    return [];
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    // Cannot be actively used - reactive only
    return { ok: false, reason: 'Stellar Flare is reactive only - triggers when captured' };
  },

  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    // Not used directly - see onCapture
    return {};
  },

  // Triggered when this Red Dwarf pawn is captured
  onCapture(ctx: AbilityContext & { captor: Piece }): StateDelta | null {
    // Check if ability has uses left
    const actor = ctx.state.pieces.find(p => p.id === ctx.actor.id);
    if (!actor) return null;
    
    // Don't trigger if captor is a king (kings can't be stunned)
    if (ctx.captor.type.toLowerCase().includes('king')) {
      return null;
    }
    
    // Stun the captor for 1 turn (2 ply)
    return {
      effects: [{
        kind: 'STUN',
        pieceId: ctx.captor.id,
        ttl: 2 // 1 turn = 2 ply
      }],
      usesDecrement: [{ pieceId: ctx.actor.id, abilityId: 'stellar_flare' }]
    };
  }
};
