import type { Player } from './types';
import playersJson from '../../../assets/data/players.json';

export const PLAYERS: Player[] = playersJson as Player[];

export function getDataset(): Player[] {
  return PLAYERS;
}
