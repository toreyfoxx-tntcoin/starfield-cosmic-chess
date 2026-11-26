export interface StarSet {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  description: string;
  unlockLevel: number;
  unlockCost: number;
  theme: string;
}

export const STAR_SETS: StarSet[] = [
  {
    id: 'main_sequence',
    name: 'Main Sequence Set',
    tier: 1,
    description: 'Classic stellar objects from the main sequence of star evolution',
    unlockLevel: 0,
    unlockCost: 0,
    theme: 'Starter set with vibrant colored stars'
  },
  {
    id: 'mixed_cosmos',
    name: 'Mixed Cosmos Set',
    tier: 2,
    description: 'A blend of evolved stars and early black holes',
    unlockLevel: 5,
    unlockCost: 1000,
    theme: 'Enhanced VFX with gravitational effects'
  },
  {
    id: 'singularity',
    name: 'Singularity Set',
    tier: 3,
    description: 'Pure black hole dominance with exotic quantum effects',
    unlockLevel: 15,
    unlockCost: 5000,
    theme: 'Maximum VFX with space-time distortion'
  }
];
