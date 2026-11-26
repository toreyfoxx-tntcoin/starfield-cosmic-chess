import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MatchmakingProps {
  onMatchFound: (matchId: string) => void;
}

type MatchMode = 'correspondence_24h' | 'live_10m';

export function Matchmaking({ onMatchFound }: MatchmakingProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<MatchMode>('correspondence_24h');
  const [searching, setSearching] = useState(false);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Listen for newly assigned active match while searching
  useEffect(() => {
    if (!searching || !db || !user) return;

    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('participant_uids', 'array-contains', user.uid),
      where('status', '==', 'active'),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    const startedAt = Date.now() - 5000;
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      if (!first) return;
      const data = first.data();
      const createdMs = data.created_at?.toMillis ? data.created_at.toMillis() : Date.now();
      if (createdMs >= startedAt) {
        setSearching(false);
        onMatchFound(first.id);
      }
    });

    return () => unsub();
  }, [searching, user, onMatchFound]);

  const handleJoinQueue = async () => {
    setError('');
    setSearching(true);
    try {
      const resp = await apiClient.post<{ matched: boolean; match_id?: string }>(
        '/api/v1/matchmaking/join',
        { mode }
      );
      if (resp.matched && resp.match_id) {
        setSearching(false);
        onMatchFound(resp.match_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to join matchmaking.');
      setSearching(false);
    }
  };

  const handleCancel = async () => {
    try {
      await apiClient.delete('/api/v1/matchmaking/leave');
    } catch {
      // Ignore cancel errors
    } finally {
      setSearching(false);
    }
  };

  const handleCreateChallenge = async () => {
    setError('');
    try {
      const resp = await apiClient.post<{ code: string }>('/api/v1/challenges', { mode });
      setChallengeCode(resp.code);
      setCopied(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create challenge code.');
    }
  };

  const handleAcceptChallenge = async () => {
    const clean = joinCode.trim().toUpperCase();
    if (!clean) return;
    setError('');
    try {
      const resp = await apiClient.post<{ match_id: string }>(`/api/v1/challenges/${clean}/accept`);
      onMatchFound(resp.match_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired challenge code.');
    }
  };

  const copyInvite = () => {
    if (!challengeCode) return;
    navigator.clipboard?.writeText(
      `Join me on Starfield Cosmic Chess in Pi Browser! Challenge code: ${challengeCode}`
    );
    setCopied(true);
  };

  return (
    <Card className="p-6 md:p-8 bg-slate-900/90 border-cyan-500/30 text-white space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-cyan-400">Galactic Matchmaking</h2>
        <p className="text-sm text-slate-300">
          Play verified Pioneers in 24-hour Correspondence or 10-minute Live Rapid matches.
        </p>
      </div>

      {/* Time Control Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode('correspondence_24h')}
          className={`p-3 rounded-xl border text-left transition-all ${
            mode === 'correspondence_24h'
              ? 'border-cyan-400 bg-cyan-950/60'
              : 'border-slate-700 bg-slate-800/60'
          }`}
        >
          <div className="font-bold text-cyan-300">24h Correspondence</div>
          <div className="text-xs text-slate-400">Play at your pace daily</div>
        </button>
        <button
          onClick={() => setMode('live_10m')}
          className={`p-3 rounded-xl border text-left transition-all ${
            mode === 'live_10m'
              ? 'border-purple-400 bg-purple-950/60'
              : 'border-slate-700 bg-slate-800/60'
          }`}
        >
          <div className="font-bold text-purple-300">10m Live Rapid</div>
          <div className="text-xs text-slate-400">Real-time head-to-head</div>
        </button>
      </div>

      {/* Quick Match */}
      <div className="space-y-3">
        {!searching ? (
          <Button
            onClick={handleJoinQueue}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600"
          >
            Find Verified Pioneer
          </Button>
        ) : (
          <div className="text-center space-y-3">
            <div className="animate-pulse text-cyan-300 font-medium">
              Scanning star sectors for an opponent...
            </div>
            <Button onClick={handleCancel} variant="outline" className="w-full">
              Cancel Search
            </Button>
          </div>
        )}
      </div>

      {/* Direct Friend Challenge */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
          Challenge a Friend (Share in Pi Chats)
        </h3>
        <div className="flex gap-2">
          <Button onClick={handleCreateChallenge} variant="outline" className="border-cyan-500/40 text-cyan-200">
            Generate Code
          </Button>
          {challengeCode && (
            <Button onClick={copyInvite} className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-mono">
              {copied ? `Copied ${challengeCode}!` : `Code: ${challengeCode} (Tap to Copy)`}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter friend code (e.g. STAR-7492)"
            className="bg-slate-800 border-slate-700 uppercase font-mono"
          />
          <Button onClick={handleAcceptChallenge} className="bg-purple-600 hover:bg-purple-500">
            Join
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
    </Card>
  );
}
