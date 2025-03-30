import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {commands} from '../events/messageCreate';
import {getLeagueEntriesBySummonerName} from '../services/riotGamesService';
import {calculateWinRate, getTierColor, getTierImageSource} from '../utils/utils';
import roles from '../configs/roles.json';

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
                            value: `${rankedSoloDuo.tier} ${rankedSoloDuo.rank} (${rankedSoloDuo.leaguePoints} LP)`,
                            inline: false,
                        },
                        {
                            name: '\nGames',
                            value: String(rankedSoloDuo.wins + rankedSoloDuo.losses),
                            inline: true,
                        },
                        {
                            name: 'Wins',
                            value: String(rankedSoloDuo.wins),
                            inline: true,
                        },
                        {
                            name: 'Losses',
                            value: String(rankedSoloDuo.losses),
                            inline: true,
                        },
                        {
                            name: 'Win rate',
                            value: `${calculateWinRate(rankedSoloDuo.wins, rankedSoloDuo.losses)}%`,
                            inline: false,
                        },
                        {
                            name: '\nOP.GG',
                            // eslint-disable-next-line max-len
                            value: `[${summonerName}](${process.env.OP_GG_PROFILE_URL}/${summonerName.replace('#', '-')})`
                        }
                    ];

                    // Create the embed message to answer the !elo command
                    const embed = new EmbedBuilder()
                        .setTitle(`Hi ${message.author.displayName}, here you go...`)
                        .setDescription(`##\n${summonerName}\nThis is the information I found:\n`)
                        .setFields(fields)
                        .setColor(getTierColor(rankedSoloDuo.tier))
                        .setImage(getTierImageSource(rankedSoloDuo.tier));

                    await message.reply({embeds: [embed]});
                }

                try {
                    const member = await message.guild?.members.fetch(message.author.id);
                    const newRoleName = rankedSoloDuo?.tier.toUpperCase();
                    const newRole = message.guild?.roles.cache.find((role) => role.name === newRoleName);

                    if (member && newRole) {
                        const rolesToRemove = member.roles.cache.filter((role) =>
                            role.name in roles).filter((role) => role.name !== 'lol-elo-bot-approver');
                        // eslint-disable-next-line max-len
                        console.log(`Updating ${member.displayName} roles:\n\x1b[31m[-] ${rolesToRemove.map((role) => role.name).join(', ')}\x1b[0m\n\x1b[32m[+] ${newRoleName}\x1b[0m`);

                        for (const role of rolesToRemove) {
                            await member.roles.remove(role);
                        }

                        await member.roles.add(newRole);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                await message.reply(`:skull: ${summonerName} is unranked or does not exists`);
            }
        }
    } catch (error) {
        console.error(error);
    }
};
