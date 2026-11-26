import React, { useState } from 'react';
import { MainMenu } from './MainMenu';
import { GameScreen } from './GameScreen';
import { CollectionScreen } from './CollectionScreen';
import { TutorialScreen } from './TutorialScreen';
import { ProgressionScreen } from './ProgressionScreen';
import { Matchmaking } from './Matchmaking';
import { Store } from './Store';
import { ReplayViewer } from './ReplayViewer';
import { ReplaysLibrary } from './ReplaysLibrary';
import { TournamentLobby } from './TournamentLobby';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AIDifficulty } from '@/utils/aiOpponent';

type Screen =
  | 'menu'
  | 'game'
  | 'collection'
  | 'tutorial'
  | 'progression'
  | 'multiplayer'
  | 'store'
  | 'replays'
  | 'replay-viewer'
  | 'tournaments'
  | 'analytics';

const AppLayout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [selectedReplayId, setSelectedReplayId] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const handleStartGame = (difficulty?: AIDifficulty) => {
    if (difficulty) setAiDifficulty(difficulty);
    setActiveMatchId(null);
    setCurrentScreen('game');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {currentScreen === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onViewCollection={() => setCurrentScreen('collection')}
          onViewTutorial={() => setCurrentScreen('tutorial')}
          onViewProgression={() => setCurrentScreen('progression')}
          onMultiplayer={() => setCurrentScreen('multiplayer')}
          onStore={() => setCurrentScreen('store')}
          onViewReplays={() => setCurrentScreen('replays')}
          onTournaments={() => setCurrentScreen('tournaments')}
          onAnalytics={() => setCurrentScreen('analytics')}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          onBack={() => setCurrentScreen('menu')}
          vsAI={!activeMatchId}
          aiDifficulty={aiDifficulty}
        />
      )}

      {currentScreen === 'collection' && (
        <CollectionScreen onBack={() => setCurrentScreen('menu')} />
      )}

      {currentScreen === 'tutorial' && (
        <TutorialScreen onBack={() => setCurrentScreen('menu')} />
      )}

      {currentScreen === 'progression' && (
        <ProgressionScreen onBack={() => setCurrentScreen('menu')} />
      )}

      {currentScreen === 'multiplayer' && (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <button
              onClick={() => setCurrentScreen('menu')}
              className="mb-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
            >
              ← Back to Command Deck
            </button>
            <Matchmaking
              onMatchFound={(id) => {
                setActiveMatchId(id);
                setCurrentScreen('game');
              }}
            />
          </div>
        </div>
      )}

      {currentScreen === 'store' && (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 max-w-5xl mx-auto">
          <button
            onClick={() => setCurrentScreen('menu')}
            className="mb-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
          >
            ← Back to Command Deck
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">
            Star Sets &amp; Progression Rewards
          </h1>
          <Store />
        </div>
      )}

      {currentScreen === 'replays' && (
        <ReplaysLibrary
          onSelectReplay={(id) => {
            setSelectedReplayId(id);
            setCurrentScreen('replay-viewer');
          }}
          onBack={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'replay-viewer' && selectedReplayId && (
        <div className="min-h-screen bg-slate-950">
          <button
            onClick={() => setCurrentScreen('replays')}
            className="m-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
          >
            ← Back to Replays
          </button>
          <ReplayViewer replayId={selectedReplayId} />
        </div>
      )}

      {currentScreen === 'tournaments' && (
        <div className="min-h-screen bg-slate-950">
          <button
            onClick={() => setCurrentScreen('menu')}
            className="m-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
          >
            ← Back to Command Deck
          </button>
          <TournamentLobby />
        </div>
      )}

      {currentScreen === 'analytics' && (
        <div className="min-h-screen bg-slate-950">
          <button
            onClick={() => setCurrentScreen('menu')}
            className="m-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
          >
            ← Back to Command Deck
          </button>
          <AnalyticsDashboard />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
