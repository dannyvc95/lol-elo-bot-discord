import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {commands} from '../events/messageCreate';
import {getLeagueEntriesBySummonerName} from '../services/riotGamesService';
import {calculateWinRate, getTierColor, getTierImageSource, yesNo} from '../utils/utils';

export const handleStats = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content.length > commands.stats.length && message.content.includes('#')) {
            // Get the summoner name by getting rid of the command section of the message
            const summonerName = message.content.substring(commands.stats.length);

            const leagueEntries = await getLeagueEntriesBySummonerName(summonerName);

            if (leagueEntries) {
                const rankedSolo = leagueEntries.find(({queueType}) => queueType === 'RANKED_SOLO_5x5');
                const rankedFlex = leagueEntries.find(({queueType}) => queueType === 'RANKED_FLEX_SR');
                const embeds = [];

                if (rankedSolo) {
                    const fields = [
                        {name: 'Summoner name', value: summonerName, inline: false},
                        {name: 'Tier', value: rankedSolo.tier, inline: true},
                        {name: 'Rank', value: rankedSolo.rank, inline: true},
                        {name: 'LP', value: String(rankedSolo.leaguePoints), inline: true},
                        {name: 'Games', value: String(rankedSolo.wins + rankedSolo.losses), inline: true},
                        {name: 'Wins', value: String(rankedSolo.wins), inline: true},
                        {name: 'Losses', value: String(rankedSolo.losses), inline: true},
                        {name: 'WR', value: `${calculateWinRate(rankedSolo.wins, rankedSolo.losses)}%`, inline: true,
                        },
                        {name: 'Veteran player?', value: yesNo(rankedSolo.veteran), inline: false},
                        {name: 'Inactive player?', value: yesNo(rankedSolo.inactive), inline: false},
                        {name: 'In a hot streak?', value: yesNo(rankedSolo.hotStreak), inline: false},
                        {name: 'Is fresh?', value: yesNo(rankedSolo.freshBlood), inline: false},
                    ];

                    embeds.push(new EmbedBuilder()
                        .setTitle('Ranked Solo/Duo')
                        .setDescription('These are your queue stats:')
                        .setFields(fields)
                        .setColor(getTierColor(rankedSolo.tier))
                        .setThumbnail(getTierImageSource(rankedSolo.tier)));
                }

                if (rankedFlex) {
                    const fields = [
                        {name: 'Summoner name', value: summonerName, inline: false},
                        {name: 'Tier', value: rankedFlex.tier, inline: true},
                        {name: 'Rank', value: rankedFlex.rank, inline: true},
                        {name: 'LP', value: String(rankedFlex.leaguePoints), inline: true},
                        {name: 'Games', value: String(rankedFlex.wins + rankedFlex.losses), inline: true},
                        {name: 'Wins', value: String(rankedFlex.wins), inline: true},
                        {name: 'Losses', value: String(rankedFlex.losses), inline: true},
                        {name: 'WR', value: `${calculateWinRate(rankedFlex.wins, rankedFlex.losses)}%`, inline: true},
                        {name: 'Veteran player?', value: yesNo(rankedFlex.veteran), inline: false},
                        {name: 'Inactive player?', value: yesNo(rankedFlex.inactive), inline: false},
                        {name: 'In a hot streak?', value: yesNo(rankedFlex.hotStreak), inline: false},
                        {name: 'Is fresh?', value: yesNo(rankedFlex.freshBlood), inline: false},
                    ];

                    embeds.push(new EmbedBuilder()
                        .setTitle('Ranked Flex')
                        .setDescription('These are your queue stats:')
                        .setFields(fields)
                        .setColor(getTierColor(rankedFlex.tier))
                        .setThumbnail(getTierImageSource(rankedFlex.tier)));
                }

                await message.reply({embeds: [...embeds]});
            } else {
                await message.reply(`:skull: ${summonerName} is unranked or does not exists`);
            }
        }
    } catch (error) {
        console.error(error);
    }
};
