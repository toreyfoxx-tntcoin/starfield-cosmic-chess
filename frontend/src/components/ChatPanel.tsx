import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { apiClient } from '@/lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessage {
  id: string;
  sender_uid: string;
  sender_username: string;
  type: 'quick_chat' | 'text' | 'system';
  text: string;
  created_at?: unknown;
}

interface ChatPanelProps {
  matchId: string;
  userId: string;
  opponentUid?: string;
}

const QUICK_CHAT_PRESETS = [
  { key: 'greetings_pioneer', label: 'Greetings, Pioneer!' },
  { key: 'well_played', label: 'Well played.' },
  { key: 'interesting_move', label: 'Interesting move!' },
  { key: 'good_game', label: 'Good game, Commander.' },
  { key: 'thinking', label: 'Taking a moment to think.' },
  { key: 'rematch', label: 'Rematch?' },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ matchId, userId, opponentUid }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [muted, setMuted] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('harassment');
  const [reportNote, setReportNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!db || !matchId) return;
    const chatRef = collection(db, 'matches', matchId, 'chat');
    const q = query(chatRef, orderBy('created_at', 'asc'), limit(100));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: ChatMessage[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, 'id'>),
      }));
      setMessages(items);
    });

    return () => unsub();
  }, [matchId]);

  const sendQuickChat = async (presetKey: string) => {
    setStatusNote(null);
    setSending(true);
    try {
      await apiClient.post(`/api/v1/matches/${matchId}/chat`, {
        type: 'quick_chat',
        preset_key: presetKey,
      });
    } catch (err: unknown) {
      setStatusNote(err instanceof Error ? err.message : 'Unable to send Quick Chat.');
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    setStatusNote(null);
    setSending(true);
    try {
      await apiClient.post(`/api/v1/matches/${matchId}/chat`, {
        type: 'text',
        text: trimmed,
      });
      setNewMessage('');
    } catch (err: unknown) {
      setStatusNote(err instanceof Error ? err.message : 'Message blocked by safety filter.');
    } finally {
      setSending(false);
    }
  };

  const submitReport = async () => {
    if (!opponentUid) return;
    try {
      await apiClient.post('/api/v1/moderation/report', {
        match_id: matchId,
        reported_uid: opponentUid,
        category: reportCategory,
        note: reportNote.trim(),
      });
      setMuted(true);
      setReportOpen(false);
      setReportNote('');
      setStatusNote('Report submitted for human review. Opponent has been muted.');
    } catch (err: unknown) {
      setStatusNote(err instanceof Error ? err.message : 'Unable to submit report.');
    }
  };

  const visibleMessages = muted
    ? messages.filter((m) => m.sender_uid === userId || m.type === 'system')
    : messages;

  return (
    <div className="flex flex-col h-[28rem] bg-slate-900/90 rounded-lg border border-cyan-500/30 p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-cyan-400">Match Comms</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={muted ? 'destructive' : 'outline'}
            onClick={() => setMuted((prev) => !prev)}
            className="text-xs h-7 px-2"
          >
            {muted ? 'Unmute' : 'Mute'}
          </Button>
          {opponentUid && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReportOpen((prev) => !prev)}
              className="text-xs h-7 px-2 border-amber-500/50 text-amber-300"
            >
              Report
            </Button>
          )}
        </div>
      </div>

      {reportOpen && (
        <div className="mb-3 p-3 rounded-md bg-slate-800 border border-amber-500/40 space-y-2 text-xs">
          <div className="font-semibold text-amber-300">Report Conduct (Human Review)</div>
          <select
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            className="w-full rounded bg-slate-900 border border-slate-700 p-1.5 text-white"
          >
            <option value="harassment">Harassment or Abuse</option>
            <option value="spam_external_link">Spam / Scam / External Link</option>
            <option value="intentional_stall">Intentional Clock Stalling</option>
            <option value="other">Other Rule Violation</option>
          </select>
          <Input
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            placeholder="Optional context (max 200 chars)"
            maxLength={200}
            className="bg-slate-900 border-slate-700 h-8 text-xs"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setReportOpen(false)} className="h-7 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={submitReport} className="h-7 text-xs bg-amber-600 hover:bg-amber-500">
              Submit & Mute
            </Button>
          </div>
        </div>
      )}

      {/* One-tap Zero-Toxicity Quick Chat */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {QUICK_CHAT_PRESETS.map((preset) => (
          <button
            key={preset.key}
            disabled={sending}
            onClick={() => sendQuickChat(preset.key)}
            className="text-xs px-2 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 mb-2 pr-2">
        {visibleMessages.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Use Quick Chat or send a respectful message. External links are blocked for Pioneer safety.
          </p>
        ) : (
          visibleMessages.map((msg) => (
            <div key={msg.id} className="mb-1.5 text-sm break-words">
              <span className="font-semibold text-cyan-400">{msg.sender_username}: </span>
              <span className="text-slate-100">{msg.text}</span>
            </div>
          ))
        )}
      </ScrollArea>

      {statusNote && <p className="text-xs text-amber-300 mb-2">{statusNote}</p>}

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          maxLength={200}
          placeholder="Respectful message (no links)..."
          className="bg-slate-800 border-cyan-500/30 text-sm"
        />
        <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-cyan-600 hover:bg-cyan-500">
          Send
        </Button>
      </div>
    </div>
  );
};
