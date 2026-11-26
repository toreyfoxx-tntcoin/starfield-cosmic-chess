import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';

export const eventHorizon: AbilityDef = {
  id: 'event_horizon',
  name: 'Event Horizon',
  pieceType: 'BLACK_HOLE',
  cooldown: 5,
  targetKind: 'none',

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    return [{ kind: 'none' }];
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    // Event Horizon doesn't directly affect pieces, so no FIDE safety check needed
    // It only creates a zone that restricts movement
    return { ok: true };
  },

  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    const { q, r } = ctx.actor;
    const squares: Array<{ q: number; r: number }> = [];
    
    // 3×3 zone centered on the queen (Chebyshev ≤ 1)
    for (let dq = -1; dq <= 1; dq++) {
      for (let dr = -1; dr <= 1; dr++) {
        const tq = q + dq;
        const tr = r + dr;
        if (tq >= 0 && tq < 8 && tr >= 0 && tr < 8) {
          squares.push({ q: tq, r: tr });
        }
      }
    }
    
    return {
      effects: [{
        kind: 'ZONE_EVENT_HORIZON',
        owner: ctx.player,
        squares,
        ttl: 2 // 1 turn = 2 ply (one for each player)
      }],
      cooldowns: [{ pieceId: ctx.actor.id, abilityId: this.id, turns: this.cooldown }]
    };
  }
};
