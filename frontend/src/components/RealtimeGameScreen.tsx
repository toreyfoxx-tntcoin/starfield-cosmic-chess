import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameHUD } from './GameHUD';
import CheckmateModal from './CheckmateModal';
import { useRealtimeMatch } from '../hooks/useRealtimeMatch';
import { useAnalytics } from '../hooks/useAnalytics';
import { submitActionWithAck } from '../net/submitActionWithAck';
import { toast } from 'sonner';
import posthog from 'posthog-js';


interface RealtimeGameScreenProps {
  matchId: string;
  onBack: () => void;
}

export const RealtimeGameScreen: React.FC<RealtimeGameScreenProps> = ({ matchId, onBack }) => {
  const { matchState, isConnected, spectatorCount, sendMove } = useRealtimeMatch(matchId);
  const { trackGameStart, trackGameEnd } = useAnalytics();
  const [showCheckmateModal, setShowCheckmateModal] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    trackGameStart('multiplayer');
  }, []);

  useEffect(() => {
    if (matchState?.state === 'CHECKMATE_AWAIT_CHOICE') {
      setShowCheckmateModal(true);
    }
  }, [matchState?.state]);

  const handleSquareClick = async (position: { row: number; col: number }) => {
    if (!matchState || !isConnected) return;
    // Implement move logic with sendMove
  };

  const handleEndGame = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    trackGameEnd('checkmate', duration);
    setShowCheckmateModal(false);
    onBack();
  };

  const handleContinue = () => {
    setShowCheckmateModal(false);
    toast.success('Continuing in Annihilation Mode');
  };

  if (!matchState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading match...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="px-4 py-2 bg-slate-800 rounded-lg">
            ← Back
          </button>
          <div className="flex gap-2 items-center">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{spectatorCount} watching</span>
          </div>
        </div>
        {/* Game content */}
      </div>
      {showCheckmateModal && (
        <CheckmateModal
          isOpen={showCheckmateModal}
          winner={matchState.currentTurn === 'white' ? 'black' : 'white'}
          isRated={true}
          onEndGame={handleEndGame}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};
