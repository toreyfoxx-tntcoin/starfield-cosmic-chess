import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export type ComplianceDocType = 'privacy' | 'rules' | null;

interface ComplianceModalProps {
  docType: ComplianceDocType;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ docType, onClose }) => {
  return (
    <Dialog open={docType !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-cyan-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">
            {docType === 'privacy' ? 'Privacy Policy' : 'Community Rules'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-3 text-sm text-slate-300 space-y-4">
          {docType === 'privacy' ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">Effective Date: November 25, 2026 • Starfield Cosmic Chess</p>
              <p>
                Starfield Cosmic Chess is a Pi-native social strategy platform designed around minimal data collection and verified human play.
              </p>
              <h4 className="font-semibold text-white">1. Data We Collect</h4>
              <p>
                We collect only your Pi UID and Pi username (via Pi Authentication), along with your in-app match history, faction allegiance, sportsmanship reputation, and active match chat messages. We do not collect emails, phone numbers, real names, or financial credentials.
              </p>
              <h4 className="font-semibold text-white">2. How We Use Data</h4>
              <p>
                Your data is used strictly to power matchmaking, server-validated chess gameplay, real-time board synchronization, community reputation badges, and human-first safety moderation.
              </p>
              <h4 className="font-semibold text-white">3. Zero Data Selling & No External Redirects</h4>
              <p>
                We never sell Pioneer data to third parties and we block external links inside match chat to protect Pioneers from off-platform phishing.
              </p>
              <h4 className="font-semibold text-white">4. Account & Data Deletion</h4>
              <p>
                You may request deletion of your Commander profile and match records at any time through the in-app Report/Support flow.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>
                Every opponent in Starfield Cosmic Chess is a verified human Pioneer. Please uphold these six codes of conduct:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Respect Every Pioneer:</strong> Harassment, slurs, insults, and toxic conduct are not tolerated.</li>
                <li><strong>Play Honorably:</strong> Play your own moves—no external chess engines or intentional clock stalling.</li>
                <li><strong>Keep the Galaxy Scam-Free:</strong> Never ask for Pi Wallet passphrases or post external URLs in chat.</li>
                <li><strong>Zero Wagering or Speculation:</strong> Starfield Cosmic Chess is strictly a free social strategy community—never arrange side-bets.</li>
                <li><strong>Use Mute & Report Constructively:</strong> Mute any opponent in 1 tap or report violations for human moderator review.</li>
                <li><strong>Celebrate Sportsmanship:</strong> Endorse respectful opponents after matches to build a welcoming galaxy.</li>
              </ul>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
