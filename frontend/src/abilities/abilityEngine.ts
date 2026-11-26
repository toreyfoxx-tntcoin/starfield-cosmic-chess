import { GameState, Piece, GameAction } from '@/types/game';
import { AbilityContext, AbilityTarget, StateDelta, Effect } from './types';
import { byId, ABILITIES } from './registry';
import { validateFideSafety } from './fideSafety';

export interface AbilityValidationResult {
  legal: boolean;
  reasons: string[];
}

export interface AbilityApplyResult {
  newState: GameState;
  delta: StateDelta;
}

// Convert GameState board to Piece array for ability context
function boardToPieces(state: GameState): Piece[] {
  const pieces: Piece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let q = 0; q < 8; q++) {
      const gp = state.board[r][q];
      if (gp) {
        pieces.push({
          id: gp.id,
          type: gp.type.toUpperCase() as any,
          owner: gp.player === 'white' ? 'WHITE' : 'BLACK',
          q, r
        });
      }
    }
  }
  return pieces;
}

export function createAbilityContext(state: GameState, pieceId: string): AbilityContext | null {
  const pieces = boardToPieces(state);
  const actor = pieces.find(p => p.id === pieceId);
  if (!actor) return null;
  
  return {
    state: { ...state, pieces },
    actor,
    player: actor.owner,
    mode: state.mode === 'COSMIC_ANNIHILATION' ? 'ANNIHILATION' : 'STANDARD'
  };
}

export function validateAbility(state: GameState, action: GameAction): AbilityValidationResult {
  const reasons: string[] = [];
  
  if (action.type !== 'ABILITY' || !action.abilityId || !action.pieceId) {
    return { legal: false, reasons: ['Invalid ability action'] };
  }
  
  const abilityDef = byId(action.abilityId);
  if (!abilityDef) {
    return { legal: false, reasons: [`Unknown ability: ${action.abilityId}`] };
  }
  
  const ctx = createAbilityContext(state, action.pieceId);
  if (!ctx) {
    return { legal: false, reasons: ['Piece not found'] };
  }
  
  // Check piece ownership
  const currentPlayer = state.currentPlayer === 'white' ? 'WHITE' : 'BLACK';
  if (ctx.actor.owner !== currentPlayer) {
    return { legal: false, reasons: ['Not your piece'] };
  }
  
  // Check cooldown
  const gp = state.board.flat().find(p => p?.id === action.pieceId);
  if (gp) {
    const cd = gp.cooldowns?.[action.abilityId] || 0;
    if (cd > 0) reasons.push(`On cooldown: ${cd} turns remaining`);
    
    const uses = abilityDef.uses ? (gp.usesLeft?.[action.abilityId] ?? abilityDef.uses) : Infinity;
    if (uses <= 0) reasons.push('No uses remaining');
    
    if (gp.isStunned) reasons.push('Piece is stunned');
  }
  
  if (reasons.length > 0) {
    return { legal: false, reasons };
  }
  
  // Validate with ability definition
  const target = action.target as AbilityTarget;
  const result = abilityDef.validate(ctx, target);
  
  if (!result.ok) {
    return { legal: false, reasons: [result.reason || 'Validation failed'] };
  }
  
  return { legal: true, reasons: [] };
}

export function applyAbility(state: GameState, action: GameAction): AbilityApplyResult {
  const abilityDef = byId(action.abilityId!);
  if (!abilityDef) return { newState: state, delta: {} };
  
  const ctx = createAbilityContext(state, action.pieceId!);
  if (!ctx) return { newState: state, delta: {} };
  
  const target = action.target as AbilityTarget;
  const delta = abilityDef.apply(ctx, target);
  
  let newState = { ...state };
  newState.board = state.board.map(row => row.map(p => p ? { ...p } : null));
  
  // Apply moved pieces
  if (delta.movedPieces) {
    for (const move of delta.movedPieces) {
      for (let r = 0; r < 8; r++) {
        for (let q = 0; q < 8; q++) {
          const p = newState.board[r][q];
          if (p?.id === move.id) {
            newState.board[r][q] = null;
            newState.board[move.r][move.q] = { ...p, position: { row: move.r, col: move.q } };
          }
        }
      }
    }
  }
  
  // Apply captures (does NOT reset halfmove clock per spec)
  if (delta.capturedPieces) {
    for (const id of delta.capturedPieces) {
      for (let r = 0; r < 8; r++) {
        for (let q = 0; q < 8; q++) {
          const p = newState.board[r][q];
          if (p?.id === id) {
            newState.capturedPieces[p.player].push(p);
            newState.board[r][q] = null;
          }
        }
      }
    }
  }
  
  // Apply cooldowns
  if (delta.cooldowns) {
    for (const cd of delta.cooldowns) {
      for (let r = 0; r < 8; r++) {
        for (let q = 0; q < 8; q++) {
          const p = newState.board[r][q];
          if (p?.id === cd.pieceId) {
            p.cooldowns = { ...p.cooldowns, [cd.abilityId]: cd.turns };
          }
        }
      }
    }
  }
  
  // Apply uses decrement
  if (delta.usesDecrement) {
    for (const ud of delta.usesDecrement) {
      for (let r = 0; r < 8; r++) {
        for (let q = 0; q < 8; q++) {
          const p = newState.board[r][q];
          if (p?.id === ud.pieceId) {
            const current = p.usesLeft?.[ud.abilityId] ?? 1;
            p.usesLeft = { ...p.usesLeft, [ud.abilityId]: current - 1 };
          }
        }
      }
    }
  }
  
  return { newState, delta };
}

// Tick all effects by 1 ply
export function tickEffects(state: GameState): GameState {
  const newState = { ...state };
  newState.board = state.board.map(row => row.map(p => {
    if (!p) return null;
    const newP = { ...p, cooldowns: { ...p.cooldowns } };
    
    // Decrement cooldowns
    for (const key of Object.keys(newP.cooldowns)) {
      if (newP.cooldowns[key] > 0) newP.cooldowns[key]--;
    }
    
    return newP;
  }));
  
  return newState;
}
