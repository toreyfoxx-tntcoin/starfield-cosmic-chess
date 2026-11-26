import React, { useState } from 'react';
import { PIECE_MOVEMENTS } from '@/data/tutorialData';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const TutorialSection1: React.FC = () => {
  const [showDrawRules, setShowDrawRules] = useState(false);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Objective</h3>
        <p className="text-slate-300">The goal of chess is to checkmate your opponent's King. Checkmate occurs when the King is under attack (in check) and has no legal move to escape.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Initial Setup</h3>
        <p className="text-slate-300 mb-2">The board is 8×8 with alternating light and dark squares. White pieces start on ranks 1-2, Black on ranks 7-8. Queens start on their own color (white queen on light square).</p>
        <p className="text-slate-300">Back rank (from left): Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook. Front rank: 8 Pawns.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Piece Movements</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800/60">
                <th className="border border-slate-600 px-4 py-2 text-left text-cyan-400">Piece</th>
                <th className="border border-slate-600 px-4 py-2 text-left text-cyan-400">Movement & Special Rules</th>
              </tr>
            </thead>
            <tbody>
              {PIECE_MOVEMENTS.map((p, i) => (
                <tr key={p.piece} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/40'}>
                  <td className="border border-slate-600 px-4 py-2 font-semibold text-white">{p.piece}</td>
                  <td className="border border-slate-600 px-4 py-2 text-slate-300">{p.moves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <button onClick={() => setShowDrawRules(!showDrawRules)} className="flex items-center gap-2 text-xl font-bold text-cyan-300 mb-3 hover:text-cyan-200 transition-colors">
          Draw Conditions {showDrawRules ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showDrawRules && (
          <ul className="space-y-2 text-slate-300 bg-slate-800/40 p-4 rounded-lg">
            <li><strong className="text-white">Stalemate:</strong> Player has no legal moves but is not in check.</li>
            <li><strong className="text-white">Threefold Repetition:</strong> Same position occurs 3 times with same player to move.</li>
            <li><strong className="text-white">Fifty-Move Rule:</strong> 50 moves without pawn move or capture.</li>
            <li><strong className="text-white">Insufficient Material:</strong> Neither side can checkmate (e.g., K vs K, K+B vs K).</li>
            <li><strong className="text-white">Agreement:</strong> Both players agree to a draw.</li>
          </ul>
        )}
      </section>
    </div>
  );
};
