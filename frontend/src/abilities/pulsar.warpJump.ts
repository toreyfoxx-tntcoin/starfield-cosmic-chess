import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';
import { validateFideSafety } from './fideSafety';

export const warpJump: AbilityDef = {
  id: 'warp_jump',
  name: 'Warp Jump',
  pieceType: 'PULSAR',
  cooldown: 3,
  targetKind: 'square',
  range: 1, // Chebyshev distance

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    const targets: AbilityTarget[] = [];
    const { q, r } = ctx.actor;
    
    // 3×3 around the Pulsar (Chebyshev distance ≤ 1)
    for (let dq = -1; dq <= 1; dq++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dq === 0 && dr === 0) continue; // Can't stay in place
        
        const tq = q + dq;
        const tr = r + dr;
        
        // Must be on board
        if (tq < 0 || tq >= 8 || tr < 0 || tr >= 8) continue;
        
        // Must be empty
        const occupied = ctx.state.pieces.some(p => p.q === tq && p.r === tr);
        if (!occupied) {
          targets.push({ kind: 'square', q: tq, r: tr });
        }
      }
    }
    
    return targets;
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    if (target.kind !== 'square') return { ok: false, reason: 'Invalid target type' };
    
    const { q, r } = ctx.actor;
    const dq = Math.abs(target.q - q);
    const dr = Math.abs(target.r - r);
    
    // Must be within 3×3 (Chebyshev ≤ 1)
    if (dq > 1 || dr > 1) {
      return { ok: false, reason: 'Target out of range' };
    }
    
    // Must be empty
    const occupied = ctx.state.pieces.some(p => p.q === target.q && p.r === target.r);
    if (occupied) {
      return { ok: false, reason: 'Square occupied' };
    }
    
    // FIDE Safety check
    const delta = this.apply(ctx, target);
    const safety = validateFideSafety(ctx, target, delta);
    if (!safety.safe) {
      return { ok: false, reason: safety.reason };
    }
    
    return { ok: true };
  },

  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    if (target.kind !== 'square') return {};
    
    return {
      movedPieces: [{ id: ctx.actor.id, q: target.q, r: target.r }],
      cooldowns: [{ pieceId: ctx.actor.id, abilityId: this.id, turns: this.cooldown }]
    };
  }
};
