import {
    bold,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    Message,
    OmitPartialGroupDMChannel,
    SlashCommandBuilder,
} from 'discord.js';
import {commands} from '../../events/messageCreate';
import {getLeagueEntriesBySummonerName} from '../../services/riotGamesService';
import {calculateWinRate, getTierColor, getTierImageSource} from '../../utils/utils';
import {QueueType} from '../../types/LeagueEntryDTO';

export const eloCommand = new SlashCommandBuilder()
    .setName('elo')
    // eslint-disable-next-line max-len
    .setDescription('Muestra información de tu liga y división entre otras estadísticas, también puedes obtener un rol.')
    .addStringOption(option =>
        option.setName('summoner')
            .setDescription('Nombre de jugador y lema (por ejemplo, NoxMajesty#LAN)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('queue')
            .setDescription('Elige entre Solo/Duo o Flex')
            .addChoices(
                {name: 'Solo/Duo', value: 'RANKED_SOLO_5x5'},
                {name: 'Flex', value: 'RANKED_FLEX_SR'}
            )
            .setRequired(false)
    );


export async function executeEloCommand(interaction: ChatInputCommandInteraction) {
    try {
        const summonerName = interaction.options.getString('summoner', true);
        const queueType = interaction.options.getString('queue') as QueueType || 'RANKED_SOLO_5x5';

        const leagueEntries = await getLeagueEntriesBySummonerName(summonerName);

        if (!leagueEntries) {
            await interaction.reply({
                // eslint-disable-next-line max-len
                content: `:skull: No pude encontrar a ${bold(summonerName)}, probablemente la cuenta es UNRANKED o no existe en el servidor de LAN.`,
                ephemeral: true
            });
            return;
        }

        const ranked = leagueEntries.find((entry) => entry.queueType === queueType);

        if (!ranked) {
            await interaction.reply({
                content: `No encontré información de ${summonerName} para la cola seleccionada.`,
                ephemeral: true
            });
            return;
        }

        const fields = [
            {
                name: 'Este es tu rango:',
                value: `${ranked.tier} ${ranked.rank} (${ranked.leaguePoints} PL)`,
                inline: false,
            },
            {
                name: '\nJuegos:',
                value: String(ranked.wins + ranked.losses),
                inline: true,
            },
            {
                name: 'Victorias:',
                value: String(ranked.wins),
                inline: true,
            },
            {
                name: 'Derrotas:',
                value: String(ranked.losses),
                inline: true,
            },
            {
                name: 'Tasa de victoria:',
                value: `${calculateWinRate(ranked.wins, ranked.losses)}%`,
                inline: false,
            },
            {
                name: '\nPuedes ir a OP.GG para obtener más detalles:',
                // eslint-disable-next-line max-len
                value: `[op.gg/${summonerName.replace('#', '-')}](${process.env.OP_GG_PROFILE_URL}/${summonerName.replace('#', '-')})`
            }
        ];

        const embed = new EmbedBuilder()
            .setTitle(`${bold(summonerName)}`)
            .setFields(fields)
            .setColor(getTierColor(ranked.tier))
            .setImage(getTierImageSource(ranked.tier));

        const member = await interaction.guild?.members.fetch(interaction.user.id);
        const newRole = interaction.guild?.roles.cache.find((role) =>
            role.name === ranked?.tier.toUpperCase());

        await interaction.reply({
            embeds: [embed],
            components: [{components: [{
                custom_id: createCustomId('reject', member?.id ?? '', newRole?.id ?? ''),
                label: 'Rechazar',
                style: ButtonStyle.Secondary,
                type: ComponentType.Button
            },
            {
                custom_id: createCustomId('approve', member?.id ?? '', newRole?.id ?? ''),
                label: 'Aprobar',
                style: ButtonStyle.Primary,
                type: ComponentType.Button
            }], type: ComponentType.ActionRow}],
        });
    } catch (error) {
        console.error('Error executing /elo command:', error);
        await interaction.reply({
            content: 'Something went wrong while fetching rank info.',
            ephemeral: true,
        });
    }
}

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
