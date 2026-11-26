import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Position, PendingPromotion } from '../types/game';
import { createInitialGameState, movePiece } from '../utils/gameState';
import { getValidMoves, isSamePosition, isMoveLegal } from '../utils/chessLogic';
import { PieceType } from '../data/pieceTypes';
import { toast } from 'sonner';

type SelectionState = 'IDLE' | 'PIECE_SELECTED' | 'SUBMITTING_ACTION' | 'MODAL';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  const [selectionVersion, setSelectionVersion] = useState(0);
  const [selectionState, setSelectionState] = useState<SelectionState>('IDLE');
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);

  // 2.5s UI watchdog - auto-clear stuck states
  const startWatchdog = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      if (selectionState !== 'IDLE') {
        console.warn('[Watchdog] Auto-clearing stuck selection state');
        clearSelection();
      }
    }, 2500);
  }, [selectionState]);

  // ESC key handler - escape hatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectionState !== 'MODAL') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionState]);

  const clearSelection = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    setGameState(prev => ({
      ...prev,
      selectedPiece: null,
      validMoves: []
    }));
    setSelectionState('IDLE');
  }, []);


  const selectPiece = useCallback((position: Position) => {
    try {
      const piece = gameState.board[position.row][position.col];
      
      // Click same piece = toggle off (escape hatch)
      if (gameState.selectedPiece && isSamePosition(gameState.selectedPiece.position, position)) {
        clearSelection();
        return;
      }
      
      // Not your piece
      if (!piece || piece.player !== gameState.currentPlayer) {
        if (piece && piece.player !== gameState.currentPlayer) {
          toast.error("Not your piece!");
        } else {
          // Click empty = clear selection (escape hatch)
          clearSelection();
        }
        return;
      }
      
      // Stunned
      if (piece.isStunned) {
        toast.error("Piece is stunned!");
        clearSelection();
        return;
      }
      
      // Compute valid moves
      const allMoves = getValidMoves(piece, gameState.board, false);
      const validMoves = allMoves.filter(move => 
        isMoveLegal(gameState.board, piece, move, gameState.currentPlayer)
      );
      
      // CRITICAL: No legal moves = show feedback and return to IDLE
      if (validMoves.length === 0) {
        toast.error("No legal moves for this piece!");
        clearSelection();
        return;
      }
      
      // Valid selection
      setSelectionVersion(v => v + 1);
      setGameState(prev => ({
        ...prev,
        selectedPiece: piece,
        validMoves
      }));
      setSelectionState('PIECE_SELECTED');
      startWatchdog(); // Start watchdog for this selection
    } finally {
      // Always restore interactivity
    }
  }, [gameState, clearSelection, startWatchdog]);


  const makeMove = useCallback(async (to: Position) => {
    if (!gameState.selectedPiece) return;
    
    const currentVersion = selectionVersion;
    
    try {
      setSelectionState('SUBMITTING_ACTION');
      
      const isValid = gameState.validMoves.some(move => isSamePosition(move, to));
      
      if (!isValid) {
        toast.error("Invalid move!");
        return;
      }
      
      const newState = movePiece(gameState, gameState.selectedPiece.position, to);
      setGameState(newState);
      setSelectionVersion(v => v + 1);
    } catch (error) {
      toast.error("Move failed!");
      console.error(error);
    } finally {
      // Always restore to IDLE
      if (currentVersion === selectionVersion) {
        clearSelection();
      }
    }
  }, [gameState, selectionVersion, clearSelection]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setSelectionVersion(0);
    setSelectionState('IDLE');
  }, []);

  return {
    gameState,
    selectPiece,
    makeMove,
    resetGame,
    selectionVersion,
    selectionState,
    clearSelection
  };
};
