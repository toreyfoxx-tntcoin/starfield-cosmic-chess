import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createPiSupporterTip } from '@/lib/piSdk';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PI_TIPS_ENABLED = import.meta.env.VITE_ENABLE_PI_TIPS === 'true';

const starSetRewards = [
  {
    sku: 'starter_cosmos_set',
    name: 'Pioneer Starfield Set',
    description: 'Standard luminous star and black hole cosmic pieces available to every verified Pioneer.',
    requirement: 'Unlocked on Pi Login',
    unlockedAtGames: 0,
  },
  {
    sku: 'mixed_cosmos_set',
    name: 'Mixed Cosmos Set',
    description: 'Enhanced nebular starlight aesthetics earned purely through honorable community play.',
    requirement: 'Complete 5 Honorable Matches',
    unlockedAtGames: 5,
  },
  {
    sku: 'singularity_set',
    name: 'Singularity Horizon Set',
    description: 'Deep-space gravitational lensing theme unlocked for dedicated Galactic Pathfinders.',
    requirement: 'Complete 15 Honorable Matches',
    unlockedAtGames: 15,
  },
];

const TIP_AMOUNTS = [1, 3, 5];

export function Store() {
  const { user, profile } = useAuth();
  const gamesCompleted = profile?.stats?.games_completed ?? 0;
  const isSupporter = Boolean(profile?.badges?.includes('galactic_supporter'));
  const [tipStatus, setTipStatus] = useState<string | null>(null);
  const [tipError, setTipError] = useState(false);

  const handleTip = (amount: number) => {
    setTipError(false);
    createPiSupporterTip(amount, (msg, isErr) => {
      setTipStatus(msg);
      setTipError(Boolean(isErr));
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/70 p-4 text-sm text-cyan-200">
        All Star Sets in Starfield Cosmic Chess are <strong>100% free and purely cosmetic</strong>—earned through completed matches and sportsmanship. Zero pay-to-win, zero wagering, and zero gameplay advantages.
      </div>

      {/* Optional Pi Community Tip Jar (gated by VITE_ENABLE_PI_TIPS until Mainnet Multisig Wallet is active) */}
      <Card className="bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-400/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-purple-200">Support the Galaxy — Optional Pi Tip Jar</h2>
            <p className="text-sm text-slate-300 mt-1">
              100% voluntary Pi-only tip to help support community servers. Grants the purely cosmetic <strong>Galactic Supporter</strong> profile badge (zero gameplay advantage).
            </p>
          </div>
          {isSupporter ? (
            <Badge className="bg-amber-600 text-white">★ Galactic Supporter</Badge>
          ) : !PI_TIPS_ENABLED ? (
            <Badge className="bg-slate-700 text-cyan-200">Awaiting App Wallet Activation</Badge>
          ) : null}
        </div>

        {PI_TIPS_ENABLED ? (
          <>
            <div className="flex flex-wrap gap-3">
              {TIP_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  disabled={!user}
                  onClick={() => handleTip(amt)}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-bold px-5"
                >
                  Tip {amt} π
                </Button>
              ))}
            </div>
            {!user && (
              <p className="text-xs text-slate-400">Sign in with Pi on the Command Deck to use the optional Pi Tip Jar.</p>
            )}
            {tipStatus && (
              <p className={`text-xs font-medium ${tipError ? 'text-red-300' : 'text-emerald-300'}`}>
                {tipStatus}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-300">
            Optional Pi supporter tips will activate automatically once our Mainnet Incoming App Wallet is approved. All gameplay and Star Sets remain 100% free.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {starSetRewards.map((item) => {
          const unlocked = gamesCompleted >= item.unlockedAtGames;
          return (
            <Card key={item.sku} className="bg-slate-900/80 border-cyan-500/30 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-cyan-400">{item.name}</h3>
                  <Badge variant={unlocked ? 'default' : 'outline'} className={unlocked ? 'bg-emerald-600' : 'text-slate-300 border-slate-600'}>
                    {unlocked ? 'Unlocked' : 'Earnable'}
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm mt-3">{item.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-xs text-purple-300 font-medium">
                Milestone: {item.requirement}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
