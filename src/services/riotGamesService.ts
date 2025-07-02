import axios, {AxiosError} from 'axios';

import {LeagueEntryDTO} from '../types/LeagueEntryDTO';
import {ChampionDTO} from '../types/ChampionDTO';
import {ChampionMasteryDTO} from '../types/ChampionMasteryDTO';

import champion from '../resources/champion.json';
import {MatchDto} from '../types/MatchDTO';

const {
    RIOT_GAMES_API_AMERICAS_ACCOUNTS_BY_RIOT_ID,
    RIOT_GAMES_API_LA1_SUMMONERS_BY_PUUID,
    RIOT_GAMES_API_LA1_ENTRIES_BY_SUMMONER,
    RIOT_GAMES_API_LA1_CHAMPION_MASTERIES_BY_PUUID,
    RIOT_GAMES_API_KEY,
} = process.env;

export const getPuuidBySummonerName = async (summonerName: string): Promise<string | null> => {
    try {
        const [gameName, tagLine] = summonerName.split('#');

        // eslint-disable-next-line max-len
        const {data, status} = await axios.get(`${RIOT_GAMES_API_AMERICAS_ACCOUNTS_BY_RIOT_ID}/${gameName}/${tagLine}?api_key=${RIOT_GAMES_API_KEY}`);

        if (status === 200) {
            return data.puuid;
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};

export const getMatchesIdsByPuuid = async (puuid: string): Promise<string[] | null> => {
    try {
        // eslint-disable-next-line max-len
        const {data, status} = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_GAMES_API_KEY}`);

        if (status === 200 && Array.isArray(data)) {
            return data as string[];
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};

export const getMatchById = async (id: string): Promise<MatchDto | null> => {
    try {
        // eslint-disable-next-line max-len
        const {data, status} = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_GAMES_API_KEY}`);

        if (status === 200) {
            console.log(data);
            return data as MatchDto;
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};

const getSummonerIdByPuuid = async (puuid: string): Promise<string | null> => {
    try {
        // eslint-disable-next-line max-len
        const {data, status} = await axios.get(`${RIOT_GAMES_API_LA1_SUMMONERS_BY_PUUID}/${puuid}?api_key=${RIOT_GAMES_API_KEY}`);

        if (status === 200) {
            return data.id;
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};

// eslint-disable-next-line max-len
export const getTopChampionMasteryBySummonerName = async (summonerName: string): Promise<{ champion: ChampionDTO, points: number } | null> => {
    try {
        const puuid = await getPuuidBySummonerName(summonerName);

        if (puuid) {
            // eslint-disable-next-line max-len
            const {data, status} = await axios.get(`${RIOT_GAMES_API_LA1_CHAMPION_MASTERIES_BY_PUUID}/${puuid}/top?count=1&api_key=${RIOT_GAMES_API_KEY}`);

            if (status === 200 && Array.isArray(data) && data.length > 0) {
                const championMasteryDTO: ChampionMasteryDTO = data[0];
                const _champion = Object.values(champion.data).find((champion) =>
                    champion.key === String(championMasteryDTO.championId));

                if (championMasteryDTO && _champion) {
                    return {champion: _champion, points: championMasteryDTO.championPoints};
                }
            }
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};

export const getLeagueEntriesBySummonerName = async (summonerName: string): Promise<LeagueEntryDTO[] | null> => {
    try {
        const puuid = await getPuuidBySummonerName(summonerName);

        if (puuid) {
            const summonerId = await getSummonerIdByPuuid(puuid);

            if (summonerId) {
                // eslint-disable-next-line max-len
                const {data, status} = await axios.get(`${RIOT_GAMES_API_LA1_ENTRIES_BY_SUMMONER}/${summonerId}?api_key=${RIOT_GAMES_API_KEY}`);

                if (status === 200 && Array.isArray(data) && data.length > 0) {
                    console.log(`Summoner name: ${summonerName}`);
                    console.log(`Summoner ID: ${summonerId}`);
                    console.log(`PUUID: ${puuid}`);
                    return data as LeagueEntryDTO[];
                }
            }
        }
    } catch (error) {
        console.error((error as AxiosError).cause);
    }

    return null;
};
