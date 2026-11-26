import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from './ui/card';

export const ReplayViewer: React.FC<{ replayId: string }> = ({ replayId }) => {
  const [movesSan, setMovesSan] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('Loading match record...');

  useEffect(() => {
    const load = async () => {
      if (!db) {
        setSummary('Firebase not configured yet.');
        return;
      }
      const snap = await getDoc(doc(db, 'matches', replayId));
      if (!snap.exists()) {
        setSummary('Match record not found.');
        return;
      }
      const data = snap.data();
      setMovesSan(data.moves_san || []);
      setSummary(
        `@${data.players?.white?.username || 'White'} vs @${data.players?.black?.username || 'Black'} — ${data.result || 'active'} (${data.termination || 'in progress'})`
      );
    };
    load();
  }, [replayId]);

  return (
    <div className="p-6 max-w-3xl mx-auto text-white space-y-4">
      <h2 className="text-2xl font-bold text-cyan-400">Match Log</h2>
      <p className="text-slate-300 text-sm">{summary}</p>
      <Card className="p-4 bg-slate-900 border-cyan-500/20">
        {movesSan.length === 0 ? (
          <p className="text-slate-400 text-sm">No recorded moves.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-sm">
            {movesSan.map((san, idx) => (
              <div key={idx} className="bg-slate-800/80 px-2 py-1 rounded">
                <span className="text-slate-400 mr-1">{idx + 1}.</span>
                <span className="text-cyan-200">{san}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
