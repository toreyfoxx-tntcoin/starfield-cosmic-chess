export const ABILITY_DATA = [
  {
    id: 'red-dwarf',
    classicalRole: 'Pawn',
    stellarPiece: 'Red Dwarf',
    ability: 'Stellar Flare',
    targeting: 'Reactive: When this pawn is captured, the captor is stunned (skips its next turn).',
    cooldown: '1 use',
    notes: 'Sacrifice play - use to punish aggressive captures.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778926896_14911fc0.webp',
    tips: 'Best used when opponent has a strong piece that would benefit from tempo. Position your Red Dwarf where capturing it would disrupt enemy plans.'
  },
  {
    id: 'neutron-star',
    classicalRole: 'Rook',
    stellarPiece: 'Neutron Star',
    ability: 'Gravity Line',
    targeting: 'Choose N/E/S/W. For up to 3 squares: pulls or stuns enemies.',
    cooldown: '4 turns',
    notes: 'Control lanes and disrupt enemy formations.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778927857_f64449d8.webp',
    tips: 'Use to pull enemy pieces into vulnerable positions or stun key defenders before an attack.'
  },
  {
    id: 'pulsar',
    classicalRole: 'Knight',
    stellarPiece: 'Pulsar',
    ability: 'Warp Jump',
    targeting: 'Teleport to any empty square within 3×3 area.',
    cooldown: '3 turns',
    notes: 'Escape or reposition instantly.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778928737_a9a7c438.webp',
    tips: 'Great for escaping pins or forks. Can also be used to suddenly appear near the enemy king.'
  },
  {
    id: 'blue-giant',
    classicalRole: 'Bishop',
    stellarPiece: 'Blue Giant',
    ability: 'Photon Beam',
    targeting: 'Choose a diagonal; first enemy hit is pushed or stunned.',
    cooldown: '4 turns',
    notes: 'Long-range disruption along diagonals.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778929656_fd81d7f2.webp',
    tips: 'Combine with diagonal control to push enemies into unfavorable squares or off key diagonals.'
  },
  {
    id: 'black-hole',
    classicalRole: 'Queen',
    stellarPiece: 'Supermassive Black Hole',
    ability: 'Event Horizon',
    targeting: 'Create a 3×3 zone where enemies cannot enter or exit for 1 turn.',
    cooldown: '5 turns',
    notes: 'Zone control - trap or protect.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778930578_3df6a861.webp',
    tips: 'Use defensively to protect your king or offensively to trap enemy pieces in a corner.'
  },
  {
    id: 'stellar-king',
    classicalRole: 'King (Star)',
    stellarPiece: 'Stellar King',
    ability: 'Solar Shield',
    targeting: 'Surround king with protective shield (2 ply); first adjacent capture is cancelled.',
    cooldown: '6 turns',
    notes: 'Emergency defense.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778931474_2afdf5d1.webp',
    tips: 'Save for critical moments when under heavy attack. Can turn a losing position into a draw.'
  },
  {
    id: 'singularity-king',
    classicalRole: 'King (BH)',
    stellarPiece: 'Singularity King',
    ability: 'Singularity Collapse',
    targeting: 'Sacrifice one adjacent friendly to remove one enemy within radius 2 (not enemy king).',
    cooldown: '1 per game',
    notes: 'Ultimate sacrifice play.',
    image: 'https://d64gsuwffb70l.cloudfront.net/692882eb99f976efc05a81c4_1764778932542_825d34f7.webp',
    tips: 'Save for removing a critical enemy piece like their queen. The sacrifice must be worth the trade.'
  }
];

export const PIECE_MOVEMENTS = [
  { piece: 'King', moves: 'One square in any direction. Cannot move into check. Special: Castling with rook.' },
  { piece: 'Queen', moves: 'Any number of squares horizontally, vertically, or diagonally.' },
  { piece: 'Rook', moves: 'Any number of squares horizontally or vertically. Participates in castling.' },
  { piece: 'Bishop', moves: 'Any number of squares diagonally. Stays on same color squares.' },
  { piece: 'Knight', moves: 'L-shape: 2 squares in one direction, 1 square perpendicular. Can jump over pieces.' },
  { piece: 'Pawn', moves: '1 square forward (2 on first move). Captures diagonally. Special: En passant, promotion.' }
];
