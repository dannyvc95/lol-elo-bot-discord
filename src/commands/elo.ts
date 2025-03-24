import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {commands} from '../events/messageCreate';
import {getLeagueEntriesBySummonerName} from '../services/riotGamesService';
import {calculateWinRate, getTierColor, getTierImageSource} from '../utils/utils';

export const handleElo = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content.length > commands.elo.length && message.content.includes('#')) {
            // Get the summoner name by getting rid of the command section of the message
            const summonerName = message.content.substring(commands.elo.length);

            const leagueEntries = await getLeagueEntriesBySummonerName(summonerName);

            if (leagueEntries) {
                const rankedSoloDuo = leagueEntries.find(({queueType}) => queueType === 'RANKED_SOLO_5x5');

                if (rankedSoloDuo) {
                    // Create relevant fields to show in the embed answer
                    const fields = [
                        {
                            name: 'Ranked Solo/Duo',
                            value: `${rankedSoloDuo.tier} ${rankedSoloDuo.rank}`,
                            inline: true,
                        },
                        {
                            name: 'LP',
                            value: String(rankedSoloDuo.leaguePoints),
                            inline: true,
                        },
                        {
                            name: 'WR',
                            value: `${calculateWinRate(rankedSoloDuo.wins, rankedSoloDuo.losses)}%`,
                            inline: true,
                        },
                        {
                            name: 'Check your OP.GG',
                            value: `[here](${process.env.OP_GG_PROFILE_URL}/${summonerName.replace('#', '-')})`
                        }
                    ];

                    // Create the embed message to answer the !elo command
                    const embed = new EmbedBuilder()
                        .setTitle(`Hi ${message.author.displayName}, here you go...`)
                        .setDescription(`##\n${summonerName}\n`)
                        .setFields(fields)
                        .setColor(getTierColor(rankedSoloDuo.tier))
                        .setImage(getTierImageSource(rankedSoloDuo.tier))
                        .setFooter({text: `Try !stats ${summonerName}`, iconURL: process.env.LOL_LOGO_IMAGE_SRC});

                    await message.reply({embeds: [embed]});
                }
            } else {
                await message.reply(`:skull: ${summonerName} is unranked or does not exists`);
            }
        }
    } catch (error) {
        console.error(error);
    }
};
