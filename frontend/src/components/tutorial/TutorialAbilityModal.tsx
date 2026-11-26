import React from 'react';
import { X } from 'lucide-react';

interface AbilityModalProps {
  ability: {
    stellarPiece: string;
    ability: string;
    targeting: string;
    cooldown: string;
    notes: string;
    image: string;
    tips: string;
  } | null;
  onClose: () => void;
}

export const TutorialAbilityModal: React.FC<AbilityModalProps> = ({ ability, onClose }) => {
  if (!ability) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-900 to-purple-900/80 rounded-xl max-w-lg w-full p-6 border border-cyan-500/30 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-cyan-300">{ability.stellarPiece}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <img src={ability.image} alt={ability.stellarPiece} className="w-24 h-24 rounded-lg object-cover border border-cyan-500/30" />
          <div>
            <p className="text-purple-400 font-semibold text-lg">{ability.ability}</p>
            <p className="text-cyan-400 text-sm">Cooldown: {ability.cooldown}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wide">Effect</p>
            <p className="text-slate-200">{ability.targeting}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wide">Notes</p>
            <p className="text-slate-200">{ability.notes}</p>
          </div>

          <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/20">
            <p className="text-sm text-cyan-400 uppercase tracking-wide mb-1">Strategy Tips</p>
            <p className="text-slate-200">{ability.tips}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
