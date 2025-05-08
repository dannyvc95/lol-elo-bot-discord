import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

export const friendsCommand = new SlashCommandBuilder()
    .setName('friends')
    .setDescription('Muestra quienes son tus mejores amigos en la grieta del invocador.')
    .addStringOption(option =>
        option.setName('summoner')
            .setDescription('Nombre de jugador y lema (por ejemplo, NoxMajesty#LAN)')
            .setRequired(true)
    );

export async function executeFriendsCommand(interaction: ChatInputCommandInteraction) {
    try {
        const summonerName = interaction.options.getString('summoner', true);
        console.log(summonerName);
        await interaction.reply('🛠️ Estoy trabajando en este comando, pronto estará disponible...');
    } catch (error) {
        console.error(error);
    }
}
