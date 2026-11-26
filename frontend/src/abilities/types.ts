import { GameState, Piece, PieceType } from '@/types/game';

export type AbilityTarget =
  | { kind: 'none' }
  | { kind: 'square'; q: number; r: number }
  | { kind: 'vector'; dx: -1 | 0 | 1; dy: -1 | 0 | 1 }
  | { kind: 'piece'; id: string };

export interface AbilityContext {
  state: GameState;
  actor: Piece;
  player: 'WHITE' | 'BLACK';
  mode: 'STANDARD' | 'ANNIHILATION';
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export interface StateDelta {
  movedPieces?: Array<{ id: string; q: number; r: number }>;
  capturedPieces?: string[];
  effects?: Effect[];
  cooldowns?: Array<{ pieceId: string; abilityId: string; turns: number }>;
  usesDecrement?: Array<{ pieceId: string; abilityId: string }>;
}

export type Effect =
  | { kind: 'STUN'; pieceId: string; ttl: number }
  | { kind: 'ZONE_EVENT_HORIZON'; owner: 'WHITE' | 'BLACK'; squares: Array<{ q: number; r: number }>; ttl: number }
  | { kind: 'SHIELD_ADJACENT'; kingId: string; ttl: number }
  | { kind: 'IMMOBILIZE'; pieceId: string; ttl: number };

export interface AbilityDef {
  id: string;
  name: string;
  pieceType: PieceType;
  cooldown: number;
  uses?: number;
  targetKind: AbilityTarget['kind'];
  range?: number;

  getTargets(ctx: AbilityContext): AbilityTarget[];
  validate(ctx: AbilityContext, target: AbilityTarget): ValidationResult;
  apply(ctx: AbilityContext, target: AbilityTarget): StateDelta;

  onCapture?(ctx: AbilityContext & { captor: Piece }): StateDelta | null;
}
