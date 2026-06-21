import type { SimResult } from '../game/data/types';

// Social is deferred to a later phase. Everything goes through this interface so a
// real backend can be dropped in later without touching the UI. v1 ships the local
// stub: no network, no accounts.

export interface GameSummary {
  id: string;
  playedAt: number;
  mode: 'classic' | 'scoutseye';
  wins: number;
  losses: number;
  rosterIds: string[];
}

export interface SocialService {
  submitScore(summary: GameSummary): Promise<void>;
  getLeaderboard(): Promise<GameSummary[]>;
  getDailyChallengeSeed(): Promise<number | null>;
}

export class LocalSocialService implements SocialService {
  async submitScore(): Promise<void> {
    // no-op in v1
  }
  async getLeaderboard(): Promise<GameSummary[]> {
    return [];
  }
  async getDailyChallengeSeed(): Promise<number | null> {
    return null;
  }
}

export const social: SocialService = new LocalSocialService();
