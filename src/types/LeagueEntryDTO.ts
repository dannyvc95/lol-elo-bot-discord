export type Tier =
    'IRON' |
    'BRONZE' |
    'SILVER' |
    'GOLD' |
    'PLATINUM' |
    'EMERALD' |
    'DIAMOND' |
    'MASTER' |
    'GRANDMASTER' |
    'CHALLENGER';

export type Rank = 'IV' | 'III' | 'II' | 'I';

export type QueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR';

interface MiniSeriesDTO {
    losses: number;
    progress: string;
    target: number;
    wins: number;
}

export interface LeagueEntryDTO {
    leagueId: string;
    summonerId: string;
    puuid: string;
    queueType: QueueType;
    tier: Tier;
    rank: Rank;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
    veteran: boolean;
    freshBlood: boolean;
    inactive: boolean;
    miniSeries: MiniSeriesDTO;
}
