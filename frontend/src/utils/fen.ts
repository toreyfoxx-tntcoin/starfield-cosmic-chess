import { GameState, GamePiece, Position } from '../types/game';
import { PieceType, Player } from '../data/pieceTypes';

const pieceToFEN: Record<string, string> = {
  'white-pawn': 'P', 'white-rook': 'R', 'white-knight': 'N',
  'white-bishop': 'B', 'white-queen': 'Q', 'white-king': 'K',
  'black-pawn': 'p', 'black-rook': 'r', 'black-knight': 'n',
  'black-bishop': 'b', 'black-queen': 'q', 'black-king': 'k'
};

export const boardToFEN = (state: GameState): string => {
  let fen = '';
  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (!piece) {
        empty++;
      } else {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += pieceToFEN[`${piece.player}-${piece.type}`];
      }
    }
    if (empty > 0) fen += empty;
    if (row < 7) fen += '/';
  }
  
  fen += ` ${state.currentPlayer === 'white' ? 'w' : 'b'}`;
  
  let castling = '';
  if (state.castlingRights.whiteKingside) castling += 'K';
  if (state.castlingRights.whiteQueenside) castling += 'Q';
  if (state.castlingRights.blackKingside) castling += 'k';
  if (state.castlingRights.blackQueenside) castling += 'q';
  fen += ` ${castling || '-'}`;
  
  const ep = state.enPassantTarget;
  fen += ` ${ep ? `${String.fromCharCode(97 + ep.col)}${8 - ep.row}` : '-'}`;
  
  fen += ` ${state.halfmoveClock} ${state.fullmoveNumber}`;
  
  return fen;
};
