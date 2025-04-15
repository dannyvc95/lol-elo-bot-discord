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
import {QueueType} from '../types/LeagueEntryDTO';

const createCustomId = (action: 'approve' | 'reject', userId: string, roleId: string) => {
    return `${action}|${userId}|${roleId}`;
};

export const handleElo = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content.length > commands.elo.length && message.content.includes('#')) {
            let summonerName = '';
            let queueType: QueueType = 'RANKED_SOLO_5x5';
            if (message.content.startsWith('!elo flexq ')) {
                summonerName = message.content.substring(11);
                queueType = 'RANKED_FLEX_SR';
            } else if (message.content.startsWith('!elo soloq ')) {
                summonerName = message.content.substring(11);
            } else {
                summonerName = message.content.substring(commands.elo.length);
            }

            const leagueEntries = await getLeagueEntriesBySummonerName(summonerName);

            if (leagueEntries) {
                const rankedSoloDuo = leagueEntries.find((entry) => entry.queueType === queueType);

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

                // Process to show the approve/reject buttons
                try {
                    const member = await message.guild?.members.fetch(message.author.id);
                    const newRole = message.guild?.roles.cache.find((role) =>
                        role.name === rankedSoloDuo?.tier.toUpperCase());

                    if (member && newRole) {
                        await message.reply({
                            embeds: [{title: '', description: `${member.displayName} wants the ${newRole.name} role`}],
                            components: [{
                                components: [
                                    {
                                        custom_id: createCustomId('reject', member.id, newRole.id),
                                        label: 'Reject',
                                        style: ButtonStyle.Secondary,
                                        type: ComponentType.Button
                                    },
                                    {
                                        custom_id: createCustomId('approve', member.id, newRole.id),
                                        label: 'Approve',
                                        style: ButtonStyle.Primary,
                                        type: ComponentType.Button
                                    }
                                ],
                                type: ComponentType.ActionRow,
                            }],
                        });
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
