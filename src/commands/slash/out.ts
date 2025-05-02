import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    userMention,
    inlineCode,
    bold,
} from 'discord.js';
import rolesJson from '../../configs/roles.json';

export const outCommand = new SlashCommandBuilder()
    .setName('out')
    .setDescription('Elimina los roles de elo de tu usuario.');

export async function executeOutCommand(interaction: ChatInputCommandInteraction) {
    try {
        const guildMembers = await interaction.guild?.members.fetch();
        if (guildMembers?.find(({id}) => id === interaction.member?.user.id)) {
            const guildMember = guildMembers?.find(({id}) => id === interaction.member?.user.id);
            if (guildMember) {
                const removeRoles = guildMember?.roles.cache
                    .filter((role) => role.name in rolesJson)
                    .filter((role) => role.name !== 'lol-elo-bot-approver');

                console.log('remove:', removeRoles.map(({name}) => name));
                for (const role of removeRoles) {
                    await guildMember.roles.remove(role);
                    console.log(`\x1b[31m[-] ${role[1].name}\x1b[0m`);
                }
            }
        }

        // eslint-disable-next-line max-len
        const description = `${userMention(interaction.member?.user.id ?? '')}, eliminé tus roles de elo. Recuerda que si quieres, puedes volver a obtener tu rol con el comando ${inlineCode('/elo')}.`;

        const embed = new EmbedBuilder()
            .setTitle(bold('👋 Hasta pronto...'))
            .setDescription(`${description}`)
            // eslint-disable-next-line max-len
            .setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2lkdzU1dnZocXp6M2U1azc1ZnY0M3g2eXZpYXRzM2hlaTB3MHUweiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/5Ay8TJlVmtWh6XYznJ/giphy.gif')
            .setColor('#FFFFFF');

        await interaction.reply({embeds: [embed]});
    } catch (error) {
        console.error(error);
    }
}
