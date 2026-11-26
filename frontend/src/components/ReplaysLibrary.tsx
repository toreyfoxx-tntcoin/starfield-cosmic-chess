import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ReplaysLibraryProps {
  onSelectReplay: (id: string) => void;
  onBack: () => void;
}

interface MatchSummary {
  id: string;
  mode: string;
  result: string | null;
  termination: string | null;
  move_count: number;
  players?: {
    white?: { username: string };
    black?: { username: string };
  };
}

export const ReplaysLibrary: React.FC<ReplaysLibraryProps> = ({ onSelectReplay, onBack }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db || !user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'matches'),
          where('participant_uids', 'array-contains', user.uid),
          where('status', '==', 'completed'),
          orderBy('updated_at', 'desc'),
          limit(25)
        );
        const snap = await getDocs(q);
        setMatches(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MatchSummary, 'id'>) })));
      } catch (err) {
        console.error('[Starfield] Failed loading match history:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-4xl mx-auto">
      <Button onClick={onBack} variant="outline" className="mb-6">← Back to Command Deck</Button>
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Match History &amp; Replays</h1>
      {loading ? (
        <p className="text-slate-400">Loading your completed matches...</p>
      ) : matches.length === 0 ? (
        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-300">
          No completed multiplayer matches yet. Finish a Live or 24h Correspondence match to review its moves here.
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Card key={m.id} className="p-4 bg-slate-900 border-cyan-500/20 flex items-center justify-between">
              <div>
                <div className="font-semibold text-cyan-300">
                  @{m.players?.white?.username || 'White'} vs @{m.players?.black?.username || 'Black'}
                </div>
                <div className="text-xs text-slate-400">
                  Result: {m.result || 'N/A'} ({m.termination || 'completed'}) • {m.move_count || 0} moves
                </div>
              </div>
              <Button size="sm" onClick={() => onSelectReplay(m.id)} className="bg-cyan-600 hover:bg-cyan-500">
                Inspect
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
