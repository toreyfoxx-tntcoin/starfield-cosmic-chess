export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type Player = 'white' | 'black';

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  usesPerGame?: number;
  range?: number;
}

export interface PieceDefinition {
  type: PieceType;
  starName: string;
  description: string;
  ability: Ability;
  image: string;
  color: string;
}

export const PIECE_DEFINITIONS: Record<PieceType, PieceDefinition> = {
  pawn: {
    type: 'pawn',
    starName: 'Red Dwarf',
    description: 'Small but fierce, can flare when captured',
    ability: {
      id: 'stellar_flare',
      name: 'Stellar Flare',
      description: 'When captured, stuns the capturing piece for 1 turn',
      cooldown: 0,
      usesPerGame: 1
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262783660_fad4fcd7.webp',
    color: '#ff4444'
  },
  rook: {
    type: 'rook',
    starName: 'Neutron Star',
    description: 'Dense and powerful, controls gravity lines',
    ability: {
      id: 'gravity_line',
      name: 'Gravity Line',
      description: 'Pull enemy pieces 1 square closer or stun them',
      cooldown: 4,
      range: 3
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262784799_30f3e8f0.webp',
    color: '#00d9ff'
  },
  knight: {
    type: 'knight',
    starName: 'Pulsar',
    description: 'Electromagnetic beams allow warping through space',
    ability: {
      id: 'warp_jump',
      name: 'Warp Jump',
      description: 'Teleport to any square in a 3x3 area',
      cooldown: 3,
      range: 1
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262786128_ebed3672.webp',
    color: '#9d4edd'
  },
  bishop: {
    type: 'bishop',
    starName: 'Blue Giant',
    description: 'Fires photon beams along diagonals',
    ability: {
      id: 'photon_beam',
      name: 'Photon Beam',
      description: 'Force enemy piece to retreat or stun it',
      cooldown: 3,
      range: 3
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262786966_e110a588.webp',
    color: '#4cc9f0'
  },
  queen: {
    type: 'queen',
    starName: 'Supermassive Black Hole',
    description: 'Creates event horizons that trap enemies',
    ability: {
      id: 'event_horizon',
      name: 'Event Horizon',
      description: 'Trap enemies in 3x3 area for 1 turn',
      cooldown: 5,
      range: 1
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262792861_293b24e4.webp',
    color: '#ff006e'
  },
  king: {
    type: 'king',
    starName: 'Massive Star',
    description: 'The core of your stellar empire',
    ability: {
      id: 'solar_shield',
      name: 'Solar Shield',
      description: 'Prevent capture of adjacent friendly piece',
      cooldown: 6,
      usesPerGame: 3
    },
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764262793732_e3fd724b.webp',
    color: '#ffd60a'
  }
};
