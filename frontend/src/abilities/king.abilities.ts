import { AbilityDef, AbilityContext, AbilityTarget, ValidationResult, StateDelta } from './types';
import { validateFideSafety } from './fideSafety';

export const solarShield: AbilityDef = {
  id: 'solar_shield',
  name: 'Solar Shield',
  pieceType: 'KING',
  cooldown: 6,
  targetKind: 'none',

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    return [{ kind: 'none' }];
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    // Shield doesn't move pieces or capture, so FIDE safe by default
    return { ok: true };
  },

  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    return {
      effects: [{
        kind: 'SHIELD_ADJACENT',
        kingId: ctx.actor.id,
        ttl: 2 // 2 ply
      }],
      cooldowns: [{ pieceId: ctx.actor.id, abilityId: this.id, turns: this.cooldown }]
    };
  }
};

export const singularityCollapse: AbilityDef = {
  id: 'singularity_collapse',
  name: 'Singularity Collapse',
  pieceType: 'KING',
  cooldown: 0,
  uses: 1,
  targetKind: 'piece',

  getTargets(ctx: AbilityContext): AbilityTarget[] {
    if (ctx.mode !== 'ANNIHILATION') return [];
    
    const { q, r } = ctx.actor;
    const targets: AbilityTarget[] = [];
    
    // Find adjacent friendly pieces (to sacrifice)
    const adjacentFriendlies = ctx.state.pieces.filter(p => {
      if (p.owner !== ctx.player) return false;
      if (p.id === ctx.actor.id) return false;
      const dq = Math.abs(p.q - q);
      const dr = Math.abs(p.r - r);
      return dq <= 1 && dr <= 1 && (dq > 0 || dr > 0);
    });
    
    if (adjacentFriendlies.length === 0) return [];
    
    // Find enemy pieces within radius 2 (not king)
    const enemiesInRange = ctx.state.pieces.filter(p => {
      if (p.owner === ctx.player) return false;
      if (p.type.toLowerCase().includes('king')) return false;
      const dq = Math.abs(p.q - q);
      const dr = Math.abs(p.r - r);
      return Math.max(dq, dr) <= 2;
    });
    
    // Return enemy targets (sacrifice will be chosen automatically or via UI)
    for (const enemy of enemiesInRange) {
      targets.push({ kind: 'piece', id: enemy.id });
    }
    
    return targets;
  },

  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult {
    if (ctx.mode !== 'ANNIHILATION') {
      return { ok: false, reason: 'Only available in Annihilation mode' };
    }
    
    if (target.kind !== 'piece') {
      return { ok: false, reason: 'Must target a piece' };
    }
    
    const { q, r } = ctx.actor;
    
    // Check adjacent friendly exists
    const adjacentFriendly = ctx.state.pieces.find(p => {
      if (p.owner !== ctx.player) return false;
      if (p.id === ctx.actor.id) return false;
      const dq = Math.abs(p.q - q);
      const dr = Math.abs(p.r - r);
      return dq <= 1 && dr <= 1 && (dq > 0 || dr > 0);
    });
    
    if (!adjacentFriendly) {
      return { ok: false, reason: 'No adjacent friendly to sacrifice' };
    }
    
    // Check target is valid enemy
    const targetPiece = ctx.state.pieces.find(p => p.id === target.id);
    if (!targetPiece) return { ok: false, reason: 'Target not found' };
    if (targetPiece.owner === ctx.player) return { ok: false, reason: 'Cannot target own piece' };
    if (targetPiece.type.toLowerCase().includes('king')) {
      return { ok: false, reason: 'Cannot target enemy king' };
    }
    
    const dq = Math.abs(targetPiece.q - q);
    const dr = Math.abs(targetPiece.r - r);
    if (Math.max(dq, dr) > 2) return { ok: false, reason: 'Target out of range' };
    
    return { ok: true };
  },

  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta {
    if (target.kind !== 'piece') return {};
    
    const { q, r } = ctx.actor;
    const captured: string[] = [target.id];
    
    // Find and sacrifice closest adjacent friendly
    const adjacentFriendly = ctx.state.pieces.find(p => {
      if (p.owner !== ctx.player || p.id === ctx.actor.id) return false;
      return Math.abs(p.q - q) <= 1 && Math.abs(p.r - r) <= 1;
    });
    
    if (adjacentFriendly) {
      captured.push(adjacentFriendly.id);
    }
    
    return {
      capturedPieces: captured,
      usesDecrement: [{ pieceId: ctx.actor.id, abilityId: this.id }]
    };
  }
};
