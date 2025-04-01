import {
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Message,
    OmitPartialGroupDMChannel,
} from 'discord.js';
import {commands} from '../events/messageCreate';
import {getLeagueEntriesBySummonerName} from '../services/riotGamesService';
import {calculateWinRate, getTierColor, getTierImageSource} from '../utils/utils';
import {pendingApprovals} from '..';

export const reviewResult = {
    rejected: 'rejected',
    approved: 'approved',
};

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
                            value: `${rankedSoloDuo.tier} ${rankedSoloDuo.rank} (${rankedSoloDuo.leaguePoints} PL)`,
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
                            name: '\nYour OP.GG',
                            // eslint-disable-next-line max-len
                            value: `[op.gg/${summonerName.replace('#', '-')}](${process.env.OP_GG_PROFILE_URL}/${summonerName.replace('#', '-')})`
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
                        const reviewMessage = await message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('Role update')
                                    .setDescription(`${member.displayName} wants the ${newRole.name} role`)
                            ],
                            components: [
                                {
                                    components: [
                                        {
                                            customId: reviewResult.rejected,
                                            label: 'Reject',
                                            style: ButtonStyle.Secondary,
                                            type: ComponentType.Button
                                        },
                                        {
                                            customId: reviewResult.approved,
                                            label: 'Approve',
                                            style: ButtonStyle.Primary,
                                            type: ComponentType.Button
                                        }
                                    ],
                                    type: ComponentType.ActionRow,
                                }
                            ],
                        });

                        pendingApprovals.push({member: member, role: newRole, message: reviewMessage});
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
