import { GameState, GamePiece, Position } from '../types/game';
import { Player, PieceType } from '../data/pieceTypes';
import { getValidMoves } from './chessLogic';

export const createInitialBoard = (): (GamePiece | null)[][] => {
  const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  // Black pieces (top)
  pieceOrder.forEach((type, col) => {
    board[0][col] = createPiece(type, 'black', { row: 0, col });
  });
  for (let col = 0; col < 8; col++) {
    board[1][col] = createPiece('pawn', 'black', { row: 1, col });
  }
  
  // White pieces (bottom)
  pieceOrder.forEach((type, col) => {
    board[7][col] = createPiece(type, 'white', { row: 7, col });
  });
  for (let col = 0; col < 8; col++) {
    board[6][col] = createPiece('pawn', 'white', { row: 6, col });
  }
  
  return board;
};

let pieceIdCounter = 0;

const createPiece = (type: PieceType, player: Player, position: Position): GamePiece => {
  return {
    id: `${player}-${type}-${pieceIdCounter++}`,
    type,
    player,
    position,
    hasMoved: false,
    cooldowns: {},
    usesLeft: {},
    isStunned: false,
    hasShield: false
  };
};

export const createInitialGameState = (): GameState => {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedPiece: null,
    validMoves: [],
    capturedPieces: { white: [], black: [] },
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    turnCount: 0,
    eventHorizonZones: [],
    mode: 'FIDE_COSMIC',
    consecutivePasses: 0,
    phase: 'PLAYING',
    pendingPromotion: null,
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    positionHistory: [],
    castlingRights: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true }
  };
};



export const tickEffectDurations = (state: GameState): GameState => {
  const newBoard = state.board.map(row => 
    row.map(piece => {
      if (!piece) return null;
      const newCooldowns = { ...piece.cooldowns };
      Object.keys(newCooldowns).forEach(key => {
        if (newCooldowns[key] > 0) newCooldowns[key]--;
      });
      return { ...piece, cooldowns: newCooldowns, isStunned: false };
    })
  );
  
  // Decay event horizon zones (remove oldest)
  const newZones = state.eventHorizonZones.length > 0 
    ? state.eventHorizonZones.slice(0, -1) 
    : [];
  
  return { ...state, board: newBoard, eventHorizonZones: newZones };
};

export const handlePassAction = (state: GameState): GameState => {
  const tickedState = tickEffectDurations(state);
  const newConsecutivePasses = state.consecutivePasses + 1;
  
  // Check for double pass draw
  if (newConsecutivePasses >= 2) {
    const whitePieces = state.board.flat().filter(p => p && p.player === 'white');
    const blackPieces = state.board.flat().filter(p => p && p.player === 'black');
    
    // If one side has 0 pieces, the other wins
    if (whitePieces.length === 0 || blackPieces.length === 0) {
      // Let the game end naturally
    } else {
      // Double pass draw
      console.log('DRAW_ANH_PASS: Two consecutive passes');
    }
  }
  
  return {
    ...tickedState,
    currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
    consecutivePasses: newConsecutivePasses,
    turnCount: state.turnCount + 1
  };
};



export const movePiece = (
  state: GameState,
  from: Position,
  to: Position
): GameState => {
  const newBoard = state.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) return state;
  
  const capturedPiece = newBoard[to.row][to.col];
  let newHalfmoveClock = state.halfmoveClock + 1;
  let newEnPassantTarget: Position | null = null;
  
  // Handle en passant capture
  if (piece.type === 'pawn' && state.enPassantTarget && 
      to.row === state.enPassantTarget.row && to.col === state.enPassantTarget.col) {
    const capturedRow = piece.player === 'white' ? to.row + 1 : to.row - 1;
    const capturedPawn = newBoard[capturedRow][to.col];
    if (capturedPawn) {
      state.capturedPieces[capturedPawn.player].push(capturedPawn);
      newBoard[capturedRow][to.col] = null;
    }
  }
  
  // Handle capture
  if (capturedPiece) {
    const opponent = capturedPiece.player;
    state.capturedPieces[opponent].push(capturedPiece);
    newHalfmoveClock = 0; // Reset on capture
  }
  
  // Reset halfmove clock on pawn move
  if (piece.type === 'pawn') {
    newHalfmoveClock = 0;
    // Set en passant target for double pawn move
    if (Math.abs(to.row - from.row) === 2) {
      newEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    }
  }
  
  // Update castling rights
  const newCastlingRights = { ...state.castlingRights };
  if (piece.type === 'king') {
    if (piece.player === 'white') {
      newCastlingRights.whiteKingside = false;
      newCastlingRights.whiteQueenside = false;
    } else {
      newCastlingRights.blackKingside = false;
      newCastlingRights.blackQueenside = false;
    }
  }
  if (piece.type === 'rook') {
    if (piece.player === 'white') {
      if (from.col === 7) newCastlingRights.whiteKingside = false;
      if (from.col === 0) newCastlingRights.whiteQueenside = false;
    } else {
      if (from.col === 7) newCastlingRights.blackKingside = false;
      if (from.col === 0) newCastlingRights.blackQueenside = false;
    }
  }
  
  // Handle castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      const rook = newBoard[from.row][7];
      if (rook) {
        newBoard[from.row][5] = { ...rook, position: { row: from.row, col: 5 }, hasMoved: true };
        newBoard[from.row][7] = null;
      }
    } else if (to.col === 2) {
      const rook = newBoard[from.row][0];
      if (rook) {
        newBoard[from.row][3] = { ...rook, position: { row: from.row, col: 3 }, hasMoved: true };
        newBoard[from.row][0] = null;
      }
    }
  }
  
  newBoard[to.row][to.col] = { ...piece, position: to, hasMoved: true };
  newBoard[from.row][from.col] = null;
  
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    return {
      ...state,
      board: newBoard,
      phase: 'PROMOTION_AWAIT_CHOICE',
      pendingPromotion: {
        pieceId: piece.id,
        owner: piece.player,
        square: to,
        choices: ['queen', 'rook', 'bishop', 'knight']
      }
    };
  }
  
  const tickedState = tickEffectDurations({ ...state, board: newBoard });
  
  return {
    ...tickedState,
    currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
    selectedPiece: null,
    validMoves: [],
    turnCount: state.turnCount + 1,
    consecutivePasses: 0,
    enPassantTarget: newEnPassantTarget,
    halfmoveClock: newHalfmoveClock,
    fullmoveNumber: state.currentPlayer === 'black' ? state.fullmoveNumber + 1 : state.fullmoveNumber,
    castlingRights: newCastlingRights
  };
};



