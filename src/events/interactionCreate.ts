import {CacheType, GuildMember, Interaction, userMention} from 'discord.js';
import roles from '../configs/roles.json';

const isApprover = async (interaction: Interaction<CacheType>, userId: string) => {
    try {
        const member = await interaction.guild?.members.fetch(userId);
        return member && member.roles.cache.some(({name}) => name === 'lol-elo-bot-approver');
    } catch (error) {
        console.error(error);
    }
    return false;
};

const cleanupRoles = async (guildMember: GuildMember) => {
    try {
        const removeRoles = guildMember.roles.cache
            .filter((role) => role.name in roles)
            .filter((role) => role.name !== 'lol-elo-bot-approver');

        for (const role of removeRoles) {
            await guildMember.roles.remove(role);
            console.log(`\x1b[31m[-] ${role[1].name}\x1b[0m`);
        }
    } catch (error) {
        console.error(error);
    }
};

export const handleInteractionCreate = async (interaction: Interaction<CacheType>) => {
    try {
        if (interaction.isButton()) {
            // It's critical to set the custom ID as follows <action>|<user id>|<role id>
            const [action, userId, roleId] = interaction.customId.split('|');

            // Validate that the user who clicked the approve/reject button is authorized
            if (await isApprover(interaction, interaction.user.id) && action && userId && roleId) {
                const member = await interaction.guild?.members.fetch(userId);
                const role = await interaction.guild?.roles.fetch(roleId);

                if (member && role && action === 'approve') {
                    // Remove existing roles associated to the elo
                    await cleanupRoles(member);

                    // Assign the new elo role
                    await member.roles.add(role);
                    console.log(`\x1b[32m[+] ${role.name}\x1b[0m`);

                    await interaction.reply(`${userMention(member.id)} now has the ${role.name} role`);
                } else if (action === 'reject') {
                    await interaction.reply(`${userMention(userId)} your role update request was rejected`);
                }

                await interaction.message.delete();
            }
        }
    } catch (error) {
        console.log(error);
    }
};
