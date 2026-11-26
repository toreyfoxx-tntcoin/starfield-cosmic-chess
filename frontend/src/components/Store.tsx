import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export function Store() {
  const { profile } = useAuth();
  const gamesCompleted = profile?.stats?.games_completed ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/70 p-4 text-sm text-cyan-200">
        All Star Sets in Starfield Cosmic Chess are <strong>100% free and purely cosmetic</strong>—earned through completed matches and sportsmanship. Zero pay-to-win, zero wagering, and zero gameplay advantages.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {starSetRewards.map((item) => {
          const unlocked = gamesCompleted >= item.unlockedAtGames;
          return (
            <Card key={item.sku} className="bg-slate-900/80 border-cyan-500/30 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-cyan-400">{item.name}</h3>
                  <Badge variant={unlocked ? 'default' : 'outline'} className={unlocked ? 'bg-emerald-600' : 'text-slate-300'}>
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
