import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './Auth/AuthModal';
import { ComplianceModal, type ComplianceDocType } from './ComplianceModal';
import AISettings from './AISettings';
import { Button } from './ui/button';
import { AIDifficulty } from '@/utils/aiOpponent';

interface MainMenuProps {
  onStartGame: (difficulty?: AIDifficulty) => void;
  onViewCollection: () => void;
  onViewTutorial: () => void;
  onViewProgression: () => void;
  onMultiplayer: () => void;
  onStore: () => void;
  onViewReplays?: () => void;
  onTournaments?: () => void;
  onAnalytics?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onViewCollection,
  onViewTutorial,
  onViewProgression,
  onMultiplayer,
  onStore,
  onViewReplays,
  onTournaments,
  onAnalytics,
}) => {
  const { user, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [complianceDoc, setComplianceDoc] = useState<ComplianceDocType>(null);

  const handleAIGame = (difficulty: AIDifficulty) => {
    setShowAISettings(false);
    onStartGame(difficulty);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80 mb-2">
            Pi-Native Social Strategy Platform
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Starfield Cosmic Chess
          </h1>
          <p className="text-base md:text-xl text-slate-300 font-light">
            Verified Pioneers • Tactical Exploration • Competition Without Toxicity
          </p>

          {user && profile ? (
            <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-slate-900/80 border border-cyan-500/30 px-4 py-2 text-sm">
              <span className="text-cyan-300 font-semibold">@{profile.username}</span>
              <span className="text-purple-300">{profile.commander_rank || 'Cadet'}</span>
              <span className="text-emerald-300">
                ★ {profile.stats?.sportsmanship_points ?? 0} Sportsmanship
              </span>
              <Button onClick={signOut} variant="ghost" size="sm" className="h-7 text-xs text-slate-300">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold px-6"
              >
                Enter the Starfield with Pi
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-900/85 to-indigo-950/75 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-cyan-500/30 shadow-2xl shadow-purple-500/15">
          <div className="space-y-3">
            {user ? (
              <button
                onClick={onMultiplayer}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl text-lg md:text-xl font-bold transition-all"
              >
                Play Verified Pioneers (Live &amp; 24h Async)
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl text-lg md:text-xl font-bold transition-all"
              >
                Sign In with Pi for Multiplayer
              </button>
            )}

            <button
              onClick={() => setShowAISettings(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-lg font-bold transition-all"
            >
              Practice vs Cosmic AI
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={onViewCollection}
                className="py-3 px-4 bg-purple-900/60 hover:bg-purple-800/70 border border-purple-500/30 rounded-xl font-semibold transition-all"
              >
                Star Pieces &amp; Abilities
              </button>

              <button
                onClick={onStore}
                className="py-3 px-4 bg-indigo-900/60 hover:bg-indigo-800/70 border border-cyan-500/30 rounded-xl font-semibold transition-all"
              >
                Star Sets &amp; Rewards
              </button>

              <button
                onClick={onViewTutorial}
                className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-semibold transition-all"
              >
                Interactive Tutorial
              </button>

              <button
                onClick={onViewProgression}
                className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-semibold transition-all"
              >
                Commander Profile &amp; Badges
              </button>

              {onViewReplays && (
                <button
                  onClick={onViewReplays}
                  className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-semibold transition-all"
                >
                  Match History &amp; Replays
                </button>
              )}

              {onTournaments && (
                <button
                  onClick={onTournaments}
                  className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-semibold transition-all"
                >
                  Community Events
                </button>
              )}
            </div>

            {onAnalytics && (
              <button
                onClick={onAnalytics}
                className="w-full py-2.5 px-4 bg-slate-900/70 hover:bg-slate-800 border border-slate-700/70 rounded-xl text-sm text-slate-300 font-medium transition-all"
              >
                Personal Strategy Stats
              </button>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <button onClick={() => setComplianceDoc('rules')} className="hover:text-cyan-400 underline-offset-4 hover:underline">
              Community Rules
            </button>
            <span>•</span>
            <button onClick={() => setComplianceDoc('privacy')} className="hover:text-cyan-400 underline-offset-4 hover:underline">
              Privacy Policy
            </button>
            <span>•</span>
            <span>100% Free • Zero Wagering • Pi Browser Native</span>
          </div>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <ComplianceModal docType={complianceDoc} onClose={() => setComplianceDoc(null)} />
      <AISettings isOpen={showAISettings} onClose={() => setShowAISettings(false)} onStartGame={handleAIGame} />
    </div>
  );
};
