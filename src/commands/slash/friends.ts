/* eslint-disable max-len */
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    spoiler,
    userMention,
} from 'discord.js';
import {getMatchById, getMatchesIdsByPuuid, getPuuidBySummonerName} from '../../services/riotGamesService';
import {FriendsDto} from '../../types/FriendsDto';

export const friendsCommand = new SlashCommandBuilder()
    .setName('friends')
    .setDescription('Muestra quienes son tus mejores amigos en la grieta del invocador.')
    .addStringOption((option) =>
        option.setName('summoner')
            .setDescription('Nombre de jugador y lema (por ejemplo, NoxMajesty#LAN)')
            .setRequired(true)
    );

export async function executeFriendsCommand(interaction: ChatInputCommandInteraction) {
    try {
        const summonerName = interaction.options.getString('summoner', true);

        console.log(summonerName);

        if (summonerName) {

            const description = `Hola ${userMention(interaction.user.id)}, estoy buscando a tus mejores amigos en la grieta del invocador.\n\n⏳ Dame un momento...\n`;

            const embed = new EmbedBuilder()
                .setTitle('⭐️ Buscando a tus mejores amigos...')
                .setDescription(`${description}`)
                .setThumbnail('https://media.giphy.com/media/YHkrDaZ59oqRC7CLiV/giphy.gif')
                .setColor('#A09B8C');

            const reply = await interaction.reply({embeds: [embed]});

            const puuid = await getPuuidBySummonerName(summonerName);

            console.log(puuid);

            if (puuid) {
                const matchesIds = await getMatchesIdsByPuuid(puuid);

                console.log(matchesIds);

                if (matchesIds && matchesIds.length > 0) {

                    const candidates = new Map<string, { name: string; count: number; }>();

                    for (const matchId of matchesIds) {

                        console.log(matchId);

                        const match = await getMatchById(matchId);

                        if (match) {
                            console.log(match);

                            const teamId = match.info.participants.find((participant) =>
                                participant.puuid === puuid)?.teamId;

                            console.log(teamId);

                            match.info.participants
                                .filter((participant) => participant.teamId === teamId && participant.puuid !== puuid)
                                .forEach((participant) => {
                                    if (candidates.has(participant.puuid)) {
                                        const currentCount = candidates.get(participant.puuid)?.count ?? 1;
                                        candidates.set(participant.puuid, {
                                            name: `${participant.riotIdGameName}#${participant.riotIdTagline}`,
                                            count: currentCount + 1,
                                        });
                                    } else {
                                        candidates.set(participant.puuid, {
                                            name: `${participant.riotIdGameName}#${participant.riotIdTagline}`,
                                            count: 1
                                        });
                                    }
                                });
                        }
                    }

                    const topThree = Array.from(candidates.values())
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3);

                    const friends: FriendsDto = {
                        firstPlace: {
                            gameName: topThree[0]?.name ?? '',
                            gamesPlayedTogether: topThree[0]?.count ?? 0,
                        },
                        secondPlace: {
                            gameName: topThree[1]?.name ?? '',
                            gamesPlayedTogether: topThree[1]?.count ?? 0,
                        },
                        thirdPlace: {
                            gameName: topThree[2]?.name ?? '',
                            gamesPlayedTogether: topThree[2]?.count ?? 0,
                        },
                    };

                    console.log(friends);

                    const description = `${userMention(interaction.user.id)}, estos son tus mejores amigos:\n
                            🥇 ${spoiler(friends.firstPlace.gameName)} (${friends.firstPlace.gamesPlayedTogether} juegos)\n
                            🥈 ${spoiler(friends.secondPlace.gameName)} (${friends.secondPlace.gamesPlayedTogether} juegos)\n
                            🥉 ${spoiler(friends.thirdPlace.gameName)} (${friends.thirdPlace.gamesPlayedTogether} juegos)\n`;

                    const embed = new EmbedBuilder()
                        .setTitle('⭐️ Tus mejores amigos')
                        .setDescription(`${description}`)
                        .setThumbnail('https://media.giphy.com/media/fyiKKFi87a9FR2rzv0/giphy.gif')
                        .setImage('https://media.giphy.com/media/JCo0BaDc42GgRJkRgr/giphy.gif')
                        .setFooter({text: '*Partidas jugadas recientemente.'})
                        .setColor('#A09B8C');

                    await reply.edit({embeds: [embed]});
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}
