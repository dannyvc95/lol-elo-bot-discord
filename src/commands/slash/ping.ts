import {SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, bold} from 'discord.js';

export const pingCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Revisa si el bot está en línea.');

export async function executePingCommand(interaction: ChatInputCommandInteraction) {
    try {
        const embed = new EmbedBuilder()
            .setTitle(bold('Pong!'))
            .setDescription('El bot está en línea.')
            .setThumbnail('https://media.giphy.com/media/7mK9NefOGX6XqnnNGo/giphy.gif')
            .setColor('#005A82');

        await interaction.reply({embeds: [embed]});
    } catch (error) {
        console.error(error);
    }
}
