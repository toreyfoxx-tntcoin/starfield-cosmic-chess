import { useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import { enumerateActions } from '../utils/actionEnumerator';
import { toast } from 'sonner';
import posthog from 'posthog-js';

interface UseAutoPassProps {
  gameState: GameState;
  isHumanTurn: boolean;
  onPass: () => void;
  enabled?: boolean;
}

export function useAutoPass({ gameState, isHumanTurn, onPass, enabled = true }: UseAutoPassProps) {
  const hasAutoPassedRef = useRef(false);
  const turnKeyRef = useRef<string>('');

  useEffect(() => {
    // Reset flag on turn change
    const currentTurnKey = `${gameState.currentPlayer}-${gameState.turnNumber || 0}`;
    if (currentTurnKey !== turnKeyRef.current) {
      hasAutoPassedRef.current = false;
      turnKeyRef.current = currentTurnKey;
    }

    // Only in Annihilation mode
    if (gameState.mode !== 'ANNIHILATION') return;
    
    // Only on human turn
    if (!isHumanTurn) return;
    
    // Only if enabled
    if (!enabled) return;
    
    // Only if phase is PLAYING
    if (gameState.phase !== 'PLAYING') return;
    
    // Don't auto-pass twice for same turn
    if (hasAutoPassedRef.current) return;

    // Check if player has any legal actions
    const player = gameState.currentPlayer === 'white' ? 'WHITE' : 'BLACK';
    const actions = enumerateActions(gameState.board, player, gameState);

    if (actions.length === 0) {
      hasAutoPassedRef.current = true;
      toast.info('Pass – no legal moves');
      posthog.capture('auto_pass_client', { 
        player: gameState.currentPlayer,
        mode: gameState.mode 
      });
      onPass();
    }
  }, [gameState, isHumanTurn, onPass, enabled]);
}
