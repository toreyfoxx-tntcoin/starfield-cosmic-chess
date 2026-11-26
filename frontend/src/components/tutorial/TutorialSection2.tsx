import React from 'react';

export const TutorialSection2: React.FC = () => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Opening Principles</h3>
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li>Control the center (e4, d4, e5, d5) with pawns and pieces</li>
          <li>Develop knights and bishops early - get them off the back rank</li>
          <li>Castle early to protect your king and connect your rooks</li>
          <li>Don't move the same piece twice without good reason</li>
          <li>Don't bring your queen out too early - it can be chased</li>
        </ul>
        <div className="mt-3 p-3 bg-slate-800/40 rounded-lg">
          <p className="text-sm text-cyan-400 font-semibold">Famous Openings:</p>
          <p className="text-slate-300 text-sm">Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4), Sicilian Defense (1.e4 c5), Queen's Gambit (1.d4 d5 2.c4)</p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Middlegame Strategy</h3>
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li>Create and exploit weaknesses in opponent's pawn structure</li>
          <li>Coordinate your pieces for attacks - pieces work better together</li>
          <li>Control open files with rooks and the 7th rank</li>
          <li>Look for tactical patterns: forks, pins, skewers, discovered attacks</li>
          <li>Trade pieces when ahead in material, avoid trades when behind</li>
        </ul>
        <div className="mt-3 p-3 bg-slate-800/40 rounded-lg">
          <p className="text-sm text-cyan-400 font-semibold">Key Tactics:</p>
          <p className="text-slate-300 text-sm"><strong>Fork:</strong> One piece attacks two+ enemies. <strong>Pin:</strong> Piece can't move without exposing more valuable piece. <strong>Skewer:</strong> Attack through one piece to another behind it.</p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Endgame Strategy</h3>
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li>Activate your king - it becomes a fighting piece in endgames</li>
          <li>Push passed pawns toward promotion</li>
          <li>Rooks belong behind passed pawns (yours or opponent's)</li>
          <li>Know basic checkmates: K+Q vs K, K+R vs K, K+2B vs K</li>
          <li>Opposition: Kings facing each other with one square between - who moves loses</li>
        </ul>
        <div className="mt-3 p-3 bg-slate-800/40 rounded-lg">
          <p className="text-sm text-cyan-400 font-semibold">Essential Endgames:</p>
          <p className="text-slate-300 text-sm">King and Pawn endings, Rook endings (Lucena & Philidor positions), basic piece checkmates.</p>
        </div>
      </section>
    </div>
  );
};
