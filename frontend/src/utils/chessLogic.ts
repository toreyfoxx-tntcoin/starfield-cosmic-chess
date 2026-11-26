import { GamePiece, Position } from '../types/game';
import { Player } from '../data/pieceTypes';
import { getCastlingMoves } from './castling';


export const isSamePosition = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const getValidMoves = (
  piece: GamePiece,
  board: (GamePiece | null)[][],
  enPassantTarget: Position | null = null,
  checkForCheck: boolean = true
): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  switch (piece.type) {
    case 'pawn':
      const direction = piece.player === 'white' ? -1 : 1;
      const startRow = piece.player === 'white' ? 6 : 1;
      
      // Forward move
      const forward = { row: row + direction, col };
      if (isValidPosition(forward) && !board[forward.row][forward.col]) {
        moves.push(forward);
        
        // Double move from start
        if (row === startRow && !piece.hasMoved) {
          const doubleForward = { row: row + 2 * direction, col };
          if (!board[doubleForward.row][doubleForward.col]) {
            moves.push(doubleForward);
          }
        }
      }
      
      // Captures (including en passant)
      [-1, 1].forEach(dc => {
        const capturePos = { row: row + direction, col: col + dc };
        if (isValidPosition(capturePos)) {
          const target = board[capturePos.row][capturePos.col];
          if (target && target.player !== piece.player) {
            moves.push(capturePos);
          }
          // En passant
          if (enPassantTarget && isSamePosition(capturePos, enPassantTarget)) {
            moves.push(capturePos);
          }
        }
      });
      break;



    case 'rook':
      addLinearMoves(moves, piece, board, [
        { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
        { dr: 0, dc: 1 }, { dr: 0, dc: -1 }
      ]);
      break;

    case 'knight':
      [
        { dr: 2, dc: 1 }, { dr: 2, dc: -1 },
        { dr: -2, dc: 1 }, { dr: -2, dc: -1 },
        { dr: 1, dc: 2 }, { dr: 1, dc: -2 },
        { dr: -1, dc: 2 }, { dr: -1, dc: -2 }
      ].forEach(({ dr, dc }) => {
        const pos = { row: row + dr, col: col + dc };
        if (isValidPosition(pos)) {
          const target = board[pos.row][pos.col];
          if (!target || target.player !== piece.player) {
            moves.push(pos);
          }
        }
      });
      break;

    case 'bishop':
      addLinearMoves(moves, piece, board, [
        { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
        { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
      ]);
      break;

    case 'queen':
      addLinearMoves(moves, piece, board, [
        { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
        { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
        { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
        { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
      ]);
      break;

    case 'king':
      [
        { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
        { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
        { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
        { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
      ].forEach(({ dr, dc }) => {
        const pos = { row: row + dr, col: col + dc };
        if (isValidPosition(pos)) {
          const target = board[pos.row][pos.col];
          if (!target || target.player !== piece.player) {
            moves.push(pos);
          }
        }
      });
      
      // Add castling moves
      const castlingMoves = getCastlingMoves(piece, board);
      moves.push(...castlingMoves);
      break;

  }

  return moves;
};

const addLinearMoves = (
  moves: Position[],
  piece: GamePiece,
  board: (GamePiece | null)[][],
  directions: { dr: number; dc: number }[]
) => {
  directions.forEach(({ dr, dc }) => {
    let r = piece.position.row + dr;
    let c = piece.position.col + dc;
    
    while (isValidPosition({ row: r, col: c })) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c });
      } else {
        if (target.player !== piece.player) {
          moves.push({ row: r, col: c });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  });
};

export const isInCheck = (
  board: (GamePiece | null)[][],
  player: Player
): boolean => {
  const king = findKing(board, player);
  if (!king) return false;
  
  return isSquareUnderAttack(board, king.position, player);
};

export const findKing = (
  board: (GamePiece | null)[][],
  player: Player
): GamePiece | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.player === player) {
        return piece;
      }
    }
  }
  return null;
};

export const isSquareUnderAttack = (
  board: (GamePiece | null)[][],
  position: Position,
  byPlayer: Player
): boolean => {
  const opponent = byPlayer === 'white' ? 'black' : 'white';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        const moves = getValidMoves(piece, board, false);
        if (moves.some(m => isSamePosition(m, position))) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isCheckmate = (
  board: (GamePiece | null)[][],
  player: Player
): boolean => {
  if (!isInCheck(board, player)) return false;
  
  // Check if any legal move can escape check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const moves = getValidMoves(piece, board, false);
        for (const move of moves) {
          if (isMoveLegal(board, piece, move, player)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

export const isMoveLegal = (
  board: (GamePiece | null)[][],
  piece: GamePiece,
  move: Position,
  player: Player
): boolean => {
  const newBoard = simulateMove(board, piece.position, move);
  return !isInCheck(newBoard, player);
};

export const simulateMove = (
  board: (GamePiece | null)[][],
  from: Position,
  to: Position
): (GamePiece | null)[][] => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  newBoard[to.row][to.col] = piece ? { ...piece, position: to } : null;
  newBoard[from.row][from.col] = null;
  return newBoard;
};

export const getAllLegalMoves = (
  board: (GamePiece | null)[][],
  player: Player
): Array<{ piece: GamePiece; move: Position }> => {
  const legalMoves: Array<{ piece: GamePiece; move: Position }> = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const moves = getValidMoves(piece, board, false);
        for (const move of moves) {
          if (isMoveLegal(board, piece, move, player)) {
            legalMoves.push({ piece, move });
          }
        }
      }
    }
  }
  return legalMoves;
};

export const isStalemate = (board: (GamePiece | null)[][], player: Player): boolean => {
  if (isInCheck(board, player)) return false;
  return getAllLegalMoves(board, player).length === 0;
};

export const hasInsufficientMaterial = (board: (GamePiece | null)[][]): boolean => {
  const pieces = board.flat().filter(p => p !== null) as GamePiece[];
  if (pieces.length === 2) return true; // K vs K
  if (pieces.length === 3) {
    const hasKnight = pieces.some(p => p.type === 'knight');
    const hasBishop = pieces.some(p => p.type === 'bishop');
    if (hasKnight || hasBishop) return true; // K+N vs K or K+B vs K
  }
  if (pieces.length === 4) {
    const bishops = pieces.filter(p => p.type === 'bishop');
    if (bishops.length === 2) {
      const sameColor = (bishops[0].position.row + bishops[0].position.col) % 2 === 
                        (bishops[1].position.row + bishops[1].position.col) % 2;
      if (sameColor) return true; // K+B vs K+B same color
    }
  }
  return false;
};

