import React, { useState } from 'react';
import { ABILITY_DATA } from '@/data/tutorialData';
import { TutorialAbilityModal } from './TutorialAbilityModal';
import { Info } from 'lucide-react';

export const TutorialSection3: React.FC = () => {
  const [selectedAbility, setSelectedAbility] = useState<typeof ABILITY_DATA[0] | null>(null);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Cosmic Ability Rules</h3>
        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li><strong className="text-white">FIDE Safety:</strong> Abilities cannot directly capture the enemy King</li>
          <li><strong className="text-white">Half-Move Clock:</strong> Only resets on captures, not ability use</li>
          <li><strong className="text-white">Zones & Stuns:</strong> Effects tick down each ply (half-turn)</li>
          <li><strong className="text-white">Idempotency:</strong> Each ability use has unique clientNonce for sync</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Stellar Pieces & Abilities</h3>
        <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
          <Info size={16} /> Click any row for detailed strategy tips
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800/80">
                <th className="border border-slate-600 px-2 py-2 text-cyan-400">Role</th>
                <th className="border border-slate-600 px-2 py-2 text-cyan-400">Stellar</th>
                <th className="border border-slate-600 px-2 py-2 text-cyan-400">Ability</th>
                <th className="border border-slate-600 px-2 py-2 text-cyan-400">Effect</th>
                <th className="border border-slate-600 px-2 py-2 text-cyan-400">CD</th>
                <th className="border border-slate-600 px-2 py-2 text-cyan-400 w-16">Image</th>
              </tr>
            </thead>
            <tbody>
              {ABILITY_DATA.map((a, i) => (
                <tr key={a.id} onClick={() => setSelectedAbility(a)} className={`cursor-pointer hover:bg-purple-900/40 transition-colors ${i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/40'}`}>
                  <td className="border border-slate-600 px-2 py-2 text-white">{a.classicalRole}</td>
                  <td className="border border-slate-600 px-2 py-2 text-purple-300 font-semibold">{a.stellarPiece}</td>
                  <td className="border border-slate-600 px-2 py-2 text-cyan-300">{a.ability}</td>
                  <td className="border border-slate-600 px-2 py-2 text-slate-300 text-xs">{a.targeting}</td>
                  <td className="border border-slate-600 px-2 py-2 text-yellow-400">{a.cooldown}</td>
                  <td className="border border-slate-600 px-1 py-1">
                    <img src={a.image} alt={a.stellarPiece} className="w-12 h-12 rounded object-cover mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <TutorialAbilityModal ability={selectedAbility} onClose={() => setSelectedAbility(null)} />
    </div>
  );
};
