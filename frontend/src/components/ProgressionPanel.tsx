import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export const ProgressionPanel: React.FC = () => {
  const { profile } = useAuth();
  const badges = profile?.badges ?? ['verified_pioneer'];

  return (
    <Card className="p-4 bg-slate-900/80 border-cyan-500/30 text-white space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-cyan-400">Commander Reputation</h3>
        <Badge className="bg-purple-700">{profile?.commander_rank || 'Cadet'}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <Badge key={b} variant="outline" className="border-cyan-500/40 text-cyan-200">
            {b.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    </Card>
  );
};
