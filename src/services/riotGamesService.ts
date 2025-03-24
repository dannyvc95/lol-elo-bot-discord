import axios, {AxiosError} from 'axios';

import {LeagueEntryDTO} from '../types/LeagueEntryDTO';

const {
    RIOT_GAMES_API_AMERICAS_ACCOUNTS_BY_RIOT_ID,
    RIOT_GAMES_API_LA1_SUMMONERS_BY_PUUID,
    RIOT_GAMES_API_LA1_ENTRIES_BY_SUMMONER,
    RIOT_GAMES_API_KEY,
} = process.env;

const getPuuidBySummonerName = async (summonerName: string): Promise<string | null> => {
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
