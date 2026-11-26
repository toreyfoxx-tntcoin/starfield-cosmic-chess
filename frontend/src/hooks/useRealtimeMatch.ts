import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { apiClient } from '@/lib/apiClient';

export interface MatchState {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  mode: 'correspondence_24h' | 'live_10m';
  status: 'active' | 'completed' | 'aborted';
  result: 'white_win' | 'black_win' | 'draw' | null;
  termination: string | null;
  players: {
    white: { uid: string; username: string; faction?: string | null };
    black: { uid: string; username: string; faction?: string | null };
  };
  moves_san: string[];
  last_move?: {
    uci: string;
    san: string;
    by_uid: string;
  } | null;
  clock?: {
    white_remaining_ms: number;
    black_remaining_ms: number;
  };
  draw_offer_by?: string | null;
}

interface UseRealtimeMatchProps {
  matchId: string;
  playerId: string;
  onStateUpdate?: (state: MatchState) => void;
  onOpponentMove?: (move: MatchState['last_move']) => void;
}

export const useRealtimeMatch = ({
  matchId,
  playerId,
  onStateUpdate,
  onOpponentMove,
}: UseRealtimeMatchProps) => {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!db || !matchId) return;

    const matchRef = doc(db, 'matches', matchId);
    let lastMoveUci: string | undefined;

    const unsub = onSnapshot(
      matchRef,
      (snap) => {
        if (!snap.exists()) return;
        setConnected(true);
        setReconnecting(false);

        const state = { id: snap.id, ...(snap.data() as Omit<MatchState, 'id'>) };
        setMatchState(state);
        onStateUpdate?.(state);

        if (
          state.last_move &&
          state.last_move.uci !== lastMoveUci &&
          state.last_move.by_uid !== playerId
        ) {
          lastMoveUci = state.last_move.uci;
          onOpponentMove?.(state.last_move);
        }
      },
      () => {
        setConnected(false);
        setReconnecting(true);
      }
    );

    return () => unsub();
  }, [matchId, playerId, onStateUpdate, onOpponentMove]);

  const sendMove = useCallback(
    async (uci: string) => {
      return apiClient.post(`/api/v1/matches/${matchId}/move`, { uci });
    },
    [matchId]
  );

  const sendAction = useCallback(
    async (action: 'resign' | 'offer_draw' | 'accept_draw' | 'decline_draw' | 'claim_timeout') => {
      return apiClient.post(`/api/v1/matches/${matchId}/action`, { action });
    },
    [matchId]
  );

  return {
    matchState,
    connected,
    reconnecting,
    sendMove,
    sendAction,
  };
};
