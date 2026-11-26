import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export const TournamentCreate: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <Card className="p-6 bg-slate-900 border-cyan-500/30 text-white space-y-4">
      <h2 className="text-xl font-bold text-cyan-400">Community Galactic Events (Phase 2)</h2>
      <p className="text-sm text-slate-300">
        Non-wagering, reputation-driven community events and weekly Galactic Operations unlock in Phase 2 once Pioneer Factions go live.
      </p>
      <Button onClick={onClose} variant="outline">Close</Button>
    </Card>
  );
};
