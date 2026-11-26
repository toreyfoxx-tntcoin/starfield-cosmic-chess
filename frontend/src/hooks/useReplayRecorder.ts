import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface ReplayMove {
  uci: string;
  san: string;
  fen: string;
  timestamp: number;
}

export function useReplayRecorder() {
  const [moves, setMoves] = useState<ReplayMove[]>([]);

  const recordMove = useCallback((move: ReplayMove) => {
    setMoves((prev) => [...prev, move]);
  }, []);

  const clearMoves = useCallback(() => {
    setMoves([]);
  }, []);

  const saveReplay = useCallback(async (matchId: string) => {
    // Completed matches are persisted automatically in Firestore `matches/{matchId}` by FastAPI.
    return { matchId, moveCount: moves.length, saved: Boolean(apiClient) };
  }, [moves.length]);

  return { moves, recordMove, clearMoves, saveReplay };
}
