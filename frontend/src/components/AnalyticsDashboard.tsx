import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from './ui/card';

export const AnalyticsDashboard: React.FC = () => {
  const { profile } = useAuth();
  const stats = profile?.stats;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">Personal Strategy Stats</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border-cyan-500/30">
          <div className="text-xs text-slate-400">Games Completed</div>
          <div className="text-3xl font-bold text-cyan-300">{stats?.games_completed ?? 0}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-emerald-500/30">
          <div className="text-xs text-slate-400">Wins</div>
          <div className="text-3xl font-bold text-emerald-300">{stats?.wins ?? 0}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-purple-500/30">
          <div className="text-xs text-slate-400">Sportsmanship</div>
          <div className="text-3xl font-bold text-purple-300">{stats?.sportsmanship_points ?? 0}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-amber-500/30">
          <div className="text-xs text-slate-400">Daily Signal Streak</div>
          <div className="text-3xl font-bold text-amber-300">{stats?.daily_signal_streak ?? 0}</div>
        </Card>
      </div>
    </div>
  );
};
