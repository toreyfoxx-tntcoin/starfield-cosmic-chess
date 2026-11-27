import React from 'react';
import { useAuth, type FactionId } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const FACTIONS: { id: Exclude<FactionId, null>; name: string; motto: string }[] = [
  { id: 'astrolabe', name: 'Astrolabe Guild', motto: 'Precision, study, and deep calculation.' },
  { id: 'horizon', name: 'Horizon Navigators', motto: 'Bold exploration across uncharted sectors.' },
  { id: 'nebula', name: 'Nebula Wardens', motto: 'Sportsmanship, mentorship, and community stewardship.' },
];

export const ProgressionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, selectFaction } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Button
        onClick={onBack}
        className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
      >
        ← Back to Command Deck
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Commander Profile &amp; Reputation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Reputation is earned strictly through honorable matches and peer endorsements—never purchased.
        </p>
      </div>

      <Card className="p-6 bg-slate-900 border-cyan-500/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xl font-bold text-white">@{profile?.username || 'Pioneer'}</div>
            <div className="text-sm text-purple-300">Rank: {profile?.commander_rank || 'Cadet'}</div>
          </div>
          <Badge className="bg-emerald-700">
            ★ {profile?.stats?.sportsmanship_points ?? 0} Sportsmanship
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {(profile?.badges || ['verified_pioneer']).map((badge) => (
            <Badge key={badge} variant="outline" className="border-cyan-500/40 text-cyan-200 capitalize">
              {badge.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-purple-300">Cosmic Faction Allegiance (Identity Only)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FACTIONS.map((f) => {
            const active = profile?.faction === f.id;
            return (
              <Card
                key={f.id}
                className={`p-4 bg-slate-900 border ${
                  active ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-slate-800'
                } space-y-3`}
              >
                <div className="font-bold text-cyan-300">{f.name}</div>
                <p className="text-xs text-slate-400">{f.motto}</p>
                <Button
                  size="sm"
                  disabled={!profile || active}
                  onClick={() => selectFaction(f.id)}
                  className="w-full"
                >
                  {active ? 'Active Faction' : 'Align Faction'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
