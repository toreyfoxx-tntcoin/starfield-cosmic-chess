import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';
import { validateFideSafety } from './fideSafety';

export const gravityLine: AbilityDef = {
  id: 'gravity_line',
  name: 'Gravity Line',
  pieceType: 'NEUTRON_STAR',
  cooldown: 4,
  targetKind: 'vector',
  range: 3,

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    // N/E/S/W only (orthogonal directions)
    const directions: Array<{ dx: -1 | 0 | 1; dy: -1 | 0 | 1 }> = [
      { dx: 0, dy: -1 },  // North
      { dx: 1, dy: 0 },   // East
      { dx: 0, dy: 1 },   // South
      { dx: -1, dy: 0 }   // West
    ];
    return directions.map(d => ({ kind: 'vector' as const, ...d }));
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    if (target.kind !== 'vector') return { ok: false, reason: 'Invalid target type' };
    
    // Ensure orthogonal only (N/E/S/W)
    if (target.dx !== 0 && target.dy !== 0) {
      return { ok: false, reason: 'Must target orthogonal direction (N/E/S/W)' };
    }
    
    // Compute delta first to validate FIDE safety
    const delta = this.apply(ctx, target);
    const safety = validateFideSafety(ctx, target, delta);
    if (!safety.safe) return { ok: false, reason: safety.reason };
    
    return { ok: true };
  },


  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    if (target.kind !== 'vector') return {};
    
    const movedPieces: Array<{ id: string; q: number; r: number }> = [];
    const effects: StateDelta['effects'] = [];
    const { q, r } = ctx.actor;
    
    // Process up to 3 squares along the line
    for (let dist = 1; dist <= 3; dist++) {
      const tq = q + target.dx * dist;
      const tr = r + target.dy * dist;
      
      if (tq < 0 || tq >= 8 || tr < 0 || tr >= 8) break;
      
      const piece = ctx.state.pieces.find(p => p.q === tq && p.r === tr);
      
      if (piece) {
        if (piece.owner === ctx.player) {
          // Stop at friendly blocker
          break;
        }
        
        // Enemy piece - try to pull 1 square toward Neutron
        const pullQ = tq - target.dx;
        const pullR = tr - target.dy;
        
        // Check if landing square is empty (and not the Neutron itself)
        const landingOccupied = ctx.state.pieces.some(p => p.q === pullQ && p.r === pullR);
        const isNeutronSquare = pullQ === q && pullR === r;
        
        if (!landingOccupied && !isNeutronSquare) {
          // Pull the piece
          movedPieces.push({ id: piece.id, q: pullQ, r: pullR });
        } else {
          // Can't pull - stun for 1 turn
          effects!.push({ kind: 'STUN', pieceId: piece.id, ttl: 2 });
        }
      }
    }
    
    return { 
      movedPieces, 
      effects,
      cooldowns: [{ pieceId: ctx.actor.id, abilityId: this.id, turns: this.cooldown }]
    };
  }
};
