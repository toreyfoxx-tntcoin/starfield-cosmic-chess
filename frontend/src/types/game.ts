import { PieceType, Player } from '../data/pieceTypes';

export interface Position {
  row: number;
  col: number;
}

export interface GamePiece {
  id: string;
  type: PieceType;
  player: Player;
  position: Position;
  hasMoved: boolean;
  cooldowns: Record<string, number>;
  usesLeft: Record<string, number>;
  isStunned: boolean;
  hasShield: boolean;
}

export type GameMode = 'FIDE_CLASSIC' | 'FIDE_COSMIC' | 'COSMIC_ANNIHILATION';
export type GamePhase = 'PLAYING' | 'CHECKMATE_AWAIT_CHOICE' | 'PROMOTION_AWAIT_CHOICE' | 'ENDED';


export interface PendingPromotion {
  pieceId: string;
  owner: Player;
  square: Position;
  choices: PieceType[];
}

export interface GameState {
  board: (GamePiece | null)[][];
  currentPlayer: Player;
  selectedPiece: GamePiece | null;
  validMoves: Position[];
  capturedPieces: { white: GamePiece[]; black: GamePiece[] };
  moveHistory: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  turnCount: number;
  eventHorizonZones: Position[][];
  mode: GameMode;
  consecutivePasses: number;
  phase: GamePhase;
  pendingPromotion: PendingPromotion | null;
  enPassantTarget: Position | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  positionHistory: string[];
  castlingRights: { whiteKingside: boolean; whiteQueenside: boolean; blackKingside: boolean; blackQueenside: boolean };
}



export type ActionType = 'MOVE' | 'ABILITY' | 'PASS' | 'TERMINAL' | 'PROMOTE';

export interface GameAction {
  type: ActionType;
  from?: Position;
  to?: Position;
  abilityKey?: string;
  abilityId?: string;
  pieceId?: string;
  target?: any;
  result?: 'DRAW_STALEMATE' | 'DRAW_ANH_PASS' | 'WIN_ANNIHILATION';
  promoteTo?: PieceType;
  clientNonce?: string;
}


export interface Piece {
  id: string;
  type: PieceType;
  owner: 'WHITE' | 'BLACK';
  q: number;
  r: number;
}

export { PieceType, Player };



export interface Move {
  from: Position;
  to: Position;
  isCapture: boolean;
  capturedPiece?: GamePiece;
}
