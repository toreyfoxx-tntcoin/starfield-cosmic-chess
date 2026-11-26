import { GameState, GamePiece } from '../types/game';
import { Player } from '../data/pieceTypes';
import { enumerateActions } from './actionEnumerator';
import { isInCheck } from './chessLogic';

export interface AuditResult {
  phase: 'PLAYING' | 'CHECKMATE_AWAIT_CHOICE' | 'ENDED';
  terminal?: 'DRAW_STALEMATE' | 'CHECKMATE';
  pauseTimers?: boolean;
}

export function preTurnAudit(state: GameState): AuditResult {
  const player = state.currentPlayer === 'white' ? 'WHITE' : 'BLACK';
  const actions = enumerateActions(state.board, player, state);
  
  // Has legal actions - continue playing
  if (actions.length > 0) {
    return { phase: 'PLAYING' };
  }
  
  // No legal actions in ANNIHILATION - handled by PASS system
  if (state.mode === 'ANNIHILATION') {
    return { phase: 'PLAYING' }; // PASS will handle this
  }
  
  // No legal actions in STANDARD mode
  const inCheck = isInCheck(state.board, state.currentPlayer);
  
  if (inCheck) {
    // Checkmate - pause timers and await choice
    return {
      phase: 'CHECKMATE_AWAIT_CHOICE',
      terminal: 'CHECKMATE',
      pauseTimers: true
    };
  } else {
    // Stalemate - immediate draw
    return {
      phase: 'ENDED',
      terminal: 'DRAW_STALEMATE'
    };
  }
}
