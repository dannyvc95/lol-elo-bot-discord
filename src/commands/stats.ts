import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {commands} from '../events/messageCreate';
import {getLeagueEntriesBySummonerName, getTopChampionMasteryBySummonerName} from '../services/riotGamesService';
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
                const topChampionMastery = await getTopChampionMasteryBySummonerName(summonerName);

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
                        {name: 'WR', value: `${calculateWinRate(rankedSolo.wins, rankedSolo.losses)}%`, inline: true},
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

                if (topChampionMastery) {
                    const fields = [
                        {name: 'Champion', value: topChampionMastery.champion.name, inline: true},
                        {name: 'Mastery points', value: topChampionMastery.points.toLocaleString(), inline: true},
                        {name: 'Tags', value: topChampionMastery.champion.tags.join(', '), inline: true},
                        // eslint-disable-next-line max-len
                        {name: 'Difficulty', value: topChampionMastery.champion.info.difficulty.toString(), inline: true},
                    ];

                    embeds.push(new EmbedBuilder()
                        .setTitle('Top mastery champion')
                        .setDescription('This is your best champion:')
                        .setFields(fields)
                        // eslint-disable-next-line max-len
                        //.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${topChampionMastery.champion.id}.png`)
                        // eslint-disable-next-line max-len
                        .setImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${topChampionMastery.champion.id}_0.jpg`));
                    // .setThumbnail(getTierImageSource(rankedFlex.tier)));
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
