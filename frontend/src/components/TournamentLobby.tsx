import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export const TournamentLobby: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-400">Community Galactic Events</h1>
        <Badge className="bg-purple-700">100% Free • Zero Entry Fees</Badge>
      </div>
      <Card className="p-6 bg-slate-900 border-cyan-500/30 space-y-3">
        <h2 className="text-xl font-semibold text-white">Upcoming: Sector 01 Opening Operation</h2>
        <p className="text-sm text-slate-300">
          Cooperative community milestone: complete honorable matches with verified Pioneers to help chart the Orion Observatory backdrop for everyone in the Pi Galaxy.
        </p>
      </Card>
    </div>
  );
};
