export interface MatchDto {
    matchId: string;
    info: {
        participants: {
            puuid: string;
            riotIdGameName: string;
            riotIdTagline: string;
            teamId: number;
        }[],
    }
}
