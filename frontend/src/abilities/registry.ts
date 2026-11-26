import { AbilityDef } from './types';
import { PieceType } from '@/types/game';
import { gravityLine } from './neutron.gravityLine';
import { warpJump } from './pulsar.warpJump';
import { photonBeam } from './bluegiant.photonBeam';
import { eventHorizon } from './blackhole.eventHorizon';
import { solarShield, singularityCollapse } from './king.abilities';
import { stellarFlare } from './reddwarf.stellarFlare';

export const ABILITIES: AbilityDef[] = [
  gravityLine,
  warpJump,
  photonBeam,
  eventHorizon,
  solarShield,
  singularityCollapse,
  stellarFlare
];

export const byPieceType = (t: PieceType): AbilityDef[] => 
  ABILITIES.filter(a => a.pieceType === t);

export const byId = (id: string): AbilityDef | undefined => 
  ABILITIES.find(a => a.id === id);
