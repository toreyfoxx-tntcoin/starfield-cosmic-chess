import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signInWithPi, isPiBrowser, authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePiLogin = async () => {
    setSubmitting(true);
    setLocalError(null);
    try {
      await signInWithPi();
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Unable to complete Pi Authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-cyan-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">
            Enter the Starfield with Pi
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Starfield Cosmic Chess uses Pi Authentication exclusively so every opponent is a verified Pioneer. No passwords, emails, or external accounts required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!isPiBrowser && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-200">
              Open <span className="font-semibold">starfieldcosmicchess.com</span> inside the{' '}
              <span className="font-semibold">Pi Browser</span> app to sign in with your verified Pioneer identity.
            </div>
          )}

          {displayError && (
            <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
              {displayError}
            </div>
          )}

          <Button
            onClick={handlePiLogin}
            disabled={submitting}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500"
          >
            {submitting ? 'Verifying Pioneer Identity...' : 'Sign In with Pi'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            We only request your Pi username to build your Commander profile, match history, and sportsmanship reputation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
