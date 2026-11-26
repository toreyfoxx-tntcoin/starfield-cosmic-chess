import React, { useState } from 'react';
import { ComplianceModal, type ComplianceDocType } from './ComplianceModal';

export const Footer: React.FC = () => {
  const [docType, setDocType] = useState<ComplianceDocType>(null);

  return (
    <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-cyan-500/20 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Starfield Cosmic Chess</h3>
            <p className="text-sm text-slate-400">
              A Pi-native social strategy platform focused on thoughtful gameplay, community participation, and verified human interaction.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Pi Authentication Only</li>
              <li>Zero Wagering &amp; Zero Pay-to-Win</li>
              <li>Human-First Moderation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Policies &amp; Safety</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setDocType('rules')} className="hover:text-cyan-400 transition-colors">
                  Community Rules
                </button>
              </li>
              <li>
                <button onClick={() => setDocType('privacy')} className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>&copy; 2026 Starfield Cosmic Chess. Built for Pioneers inside Pi Browser.</p>
        </div>
      </div>

      <ComplianceModal docType={docType} onClose={() => setDocType(null)} />
    </footer>
  );
};
