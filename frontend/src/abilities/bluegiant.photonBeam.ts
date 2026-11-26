import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';
import { validateFideSafety } from './fideSafety';

export const photonBeam: AbilityDef = {
  id: 'photon_beam',
  name: 'Photon Beam',
  pieceType: 'BLUE_GIANT',
  cooldown: 4,
  targetKind: 'vector',
  range: 3,

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    // Diagonal directions only
    const directions: Array<{ dx: -1 | 0 | 1; dy: -1 | 0 | 1 }> = [
      { dx: 1, dy: -1 },   // NE
      { dx: 1, dy: 1 },    // SE
      { dx: -1, dy: 1 },   // SW
      { dx: -1, dy: -1 }   // NW
    ];
    return directions.map(d => ({ kind: 'vector' as const, ...d }));
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    if (target.kind !== 'vector') return { ok: false, reason: 'Invalid target type' };
    
    // Ensure diagonal
    if (target.dx === 0 || target.dy === 0) {
      return { ok: false, reason: 'Must target diagonal' };
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
    if (target.kind !== 'vector') return {};
    
    const movedPieces: Array<{ id: string; q: number; r: number }> = [];
    const effects: StateDelta['effects'] = [];
    const { q, r } = ctx.actor;
    
    // Beam up to 3 squares along diagonal
    for (let dist = 1; dist <= 3; dist++) {
      const tq = q + target.dx * dist;
      const tr = r + target.dy * dist;
      
      if (tq < 0 || tq >= 8 || tr < 0 || tr >= 8) break;
      
      const piece = ctx.state.pieces.find(p => p.q === tq && p.r === tr);
      
      if (piece) {
        if (piece.owner !== ctx.player) {
          // First enemy hit - try to push 1 farther along diagonal
          const pushQ = tq + target.dx;
          const pushR = tr + target.dy;
          
          // Check if push destination is valid and empty
          const onBoard = pushQ >= 0 && pushQ < 8 && pushR >= 0 && pushR < 8;
          const pushOccupied = ctx.state.pieces.some(p => p.q === pushQ && p.r === pushR);
          
          if (onBoard && !pushOccupied) {
            // Push the piece
            movedPieces.push({ id: piece.id, q: pushQ, r: pushR });
          } else {
            // Can't push - stun for 1 turn (2 ply)
            effects!.push({ kind: 'STUN', pieceId: piece.id, ttl: 2 });
          }
        }
        // Stop at first piece (friendly or enemy)
        break;
      }
    }
    
    return { 
      movedPieces, 
      effects,
      cooldowns: [{ pieceId: ctx.actor.id, abilityId: this.id, turns: this.cooldown }]
    };
  }
};
