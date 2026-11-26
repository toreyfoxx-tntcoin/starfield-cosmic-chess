import { GameState, Piece, Position } from '@/types/game';
import { StateDelta, AbilityContext, AbilityTarget } from './types';
import { byId } from './registry';

export interface FideSafetyResult {
  safe: boolean;
  reason?: string;
}

// Convert Piece array to board for check detection
function piecesToBoard(pieces: Piece[]): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  for (const p of pieces) {
    if (p.q >= 0 && p.q < 8 && p.r >= 0 && p.r < 8) {
      board[p.r][p.q] = p;
    }
  }
  return board;
}

// Check if a square is attacked by opponent
function isSquareAttacked(board: (Piece | null)[][], pos: Position, byPlayer: 'WHITE' | 'BLACK'): boolean {
  const opponent = byPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
  for (let r = 0; r < 8; r++) {
    for (let q = 0; q < 8; q++) {
      const piece = board[r][q];
      if (piece && piece.owner === opponent) {
        if (canPieceAttack(piece, pos, board)) return true;
      }
    }
  }
  return false;
}

function canPieceAttack(piece: Piece, target: Position, board: (Piece | null)[][]): boolean {
  const dr = target.row - piece.r;
  const dc = target.col - piece.q;
  const type = piece.type.toLowerCase();

  if (type === 'pawn' || type === 'red_dwarf') {
    const dir = piece.owner === 'WHITE' ? -1 : 1;
    return dr === dir && Math.abs(dc) === 1;
  }
  if (type === 'knight' || type === 'pulsar') {
    return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  }
  if (type === 'king' || type === 'stellar_king' || type === 'singularity_king') {
    return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
  }
  if (type === 'rook' || type === 'neutron_star') {
    if (dr !== 0 && dc !== 0) return false;
    return isPathClear(piece.q, piece.r, target.col, target.row, board);
  }
  if (type === 'bishop' || type === 'blue_giant') {
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    return isPathClear(piece.q, piece.r, target.col, target.row, board);
  }
  if (type === 'queen' || type === 'black_hole' || type === 'sm_black_hole') {
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      return isPathClear(piece.q, piece.r, target.col, target.row, board);
    }
  }
  return false;
}

function isPathClear(fromQ: number, fromR: number, toQ: number, toR: number, board: (Piece | null)[][]): boolean {
  const dq = Math.sign(toQ - fromQ);
  const dr = Math.sign(toR - fromR);
  let q = fromQ + dq, r = fromR + dr;
  while (q !== toQ || r !== toR) {
    if (board[r]?.[q]) return false;
    q += dq; r += dr;
  }
  return true;
}

export function validateFideSafety(ctx: AbilityContext, target: AbilityTarget, delta: StateDelta): FideSafetyResult {
  const pieces = [...ctx.state.pieces];
  
  // Apply delta to get resulting position
  if (delta.capturedPieces) {
    for (const id of delta.capturedPieces) {
      const idx = pieces.findIndex(p => p.id === id);
      if (idx >= 0) {
        if (pieces[idx].type.toLowerCase().includes('king')) {
          return { safe: false, reason: 'Cannot capture enemy king with ability' };
        }
        pieces.splice(idx, 1);
      }
    }
  }
  
  if (delta.movedPieces) {
    for (const move of delta.movedPieces) {
      const idx = pieces.findIndex(p => p.id === move.id);
      if (idx >= 0) {
        pieces[idx] = { ...pieces[idx], q: move.q, r: move.r };
      }
    }
  }
  
  // Find own king
  const ownKing = pieces.find(p => p.owner === ctx.player && p.type.toLowerCase().includes('king'));
  if (!ownKing) return { safe: true };
  
  const board = piecesToBoard(pieces);
  if (isSquareAttacked(board, { row: ownKing.r, col: ownKing.q }, ctx.player)) {
    return { safe: false, reason: 'Ability would leave own king in check' };
  }
  
  return { safe: true };
}
