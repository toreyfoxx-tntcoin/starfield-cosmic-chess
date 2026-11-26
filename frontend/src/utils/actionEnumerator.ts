import { GamePiece, Position, GameAction, GameState, Piece } from '../types/game';
import { Player } from '../data/pieceTypes';
import { getAllLegalMoves } from './chessLogic';
import { byPieceType } from '@/abilities/registry';
import { AbilityContext } from '@/abilities/types';

export interface EnumeratedAction {
  action: GameAction;
  piece?: GamePiece;
}

export interface EnumeratedActions {
  moves: EnumeratedAction[];
  abilities: EnumeratedAction[];
}

export function enumerateActions(
  board: (GamePiece | null)[][],
  player: Player,
  state?: GameState
): EnumeratedAction[] {
  const result = enumerateActionsDetailed(board, player, state);
  return [...result.moves, ...result.abilities];
}

export function enumerateActionsDetailed(
  board: (GamePiece | null)[][],
  player: Player,
  state?: GameState
): EnumeratedActions {
  const moves: EnumeratedAction[] = [];
  const abilities: EnumeratedAction[] = [];
  
  // 1. Get all legal chess moves
  const legalMoves = getAllLegalMoves(board, player);
  for (const move of legalMoves) {
    moves.push({
      action: {
        type: 'MOVE',
        from: move.piece.position,
        to: move.move
      },
      piece: move.piece
    });
  }
  
  // 2. Get all usable abilities
  if (state) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.player === player) {
          const pieceAbilities = getUsableAbilities(piece, state);
          abilities.push(...pieceAbilities);
        }
      }
    }
  }
  
  return { moves, abilities };
}

function getUsableAbilities(gamePiece: GamePiece, state: GameState): EnumeratedAction[] {
  const abilities: EnumeratedAction[] = [];
  
  const abilityDefs = byPieceType(gamePiece.type.toUpperCase() as any);
  
  for (const def of abilityDefs) {
    const cooldown = gamePiece.cooldowns?.[def.id] || 0;
    const uses = gamePiece.usesLeft?.[def.id];
    const canUse = cooldown === 0 && (uses === undefined || uses > 0);
    
    if (!canUse) continue;
    
    const actor: Piece = {
      id: gamePiece.id || `${gamePiece.position.row}-${gamePiece.position.col}`,
      type: gamePiece.type.toUpperCase() as any,
      owner: gamePiece.player === 'white' ? 'WHITE' : 'BLACK',
      q: gamePiece.position.col,
      r: gamePiece.position.row
    };
    
    const ctx: AbilityContext = {
      state,
      actor,
      player: actor.owner,
      mode: state.mode || 'STANDARD'
    };
    
    const targets = def.getTargets(ctx);
    
    for (const target of targets) {
      abilities.push({
        action: {
          type: 'ABILITY',
          abilityId: def.id,
          pieceId: actor.id,
          target
        },
        piece: gamePiece
      });
    }
  }
  
  return abilities;
}
