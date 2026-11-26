import React from 'react';

export const TutorialSection4: React.FC = () => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Progression System</h3>
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li><strong className="text-white">Star Sets:</strong> Main Sequence (starter), Mixed Cosmos, Singularity (advanced)</li>
          <li><strong className="text-white">XP & Levels:</strong> Earn XP from matches to level up and unlock rewards</li>
          <li><strong className="text-white">Achievements:</strong> Complete challenges for bonus XP and cosmetics</li>
          <li><strong className="text-white">Daily Quests:</strong> Fresh objectives each day for extra rewards</li>
          <li><strong className="text-white">Leaderboards:</strong> Compete for top rankings in seasonal ladders</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Tournament Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/40 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Tournament Formats</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Swiss System (multiple rounds, paired by score)</li>
              <li>• Single Elimination (lose once, you're out)</li>
              <li>• Double Elimination (two losses to eliminate)</li>
            </ul>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Configuration</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Ruleset selection (Standard, Annihilation)</li>
              <li>• Ability bans/picks phase</li>
              <li>• Rating caps for fair matchmaking</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Additional Features</h3>
        <div className="space-y-3">
          <div className="bg-slate-800/40 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Spectator & Replay</h4>
            <p className="text-slate-300 text-sm">Watch live matches with enhanced spectator view. Review past games with full replay controls, move-by-move navigation, and position analysis.</p>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Analysis Engine</h4>
            <p className="text-slate-300 text-sm">Depth 3 position evaluation, evaluation graphs showing advantage over time, brilliant move and blunder tagging to learn from your games.</p>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-300 mb-2">Analytics Dashboard</h4>
            <p className="text-slate-300 text-sm">Track your performance metrics, win rates by opening, ability usage statistics, and improvement trends over time.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
