import {CacheType, Interaction, MessageFlags} from 'discord.js';
import {pendingApprovals} from '..';
import {reviewResult} from '../commands/elo';
import roles from '../configs/roles.json';

export const handleInteractionCreate = async (interactionCreate: Interaction<CacheType>) => {
    if (!interactionCreate.isButton()) {
        return;
    }

    const userId = interactionCreate.member?.user.id;

    if (userId) {
        const member = await interactionCreate.guild?.members.fetch(userId);

        if (member) {
            // Only members with the approver role can approve or reject requests
            if (!member?.roles.cache.some(({name}) => name === 'lol-elo-bot-approver')) {
                return await interactionCreate.reply({
                    content: '❌ You are not authorized',
                    flags: [MessageFlags.Ephemeral],
                });
            }

            const pendingApprovalIndex = pendingApprovals.findIndex((pendingApproval) =>
                pendingApproval.member.id === member.id);

            if (pendingApprovalIndex !== -1) {
                const pendingApproval = pendingApprovals.at(pendingApprovalIndex);

                if (!pendingApproval) {
                    return;
                }

                if (interactionCreate.customId === reviewResult.approved) {

                    const rolesToRemove = member.roles.cache.filter((role) =>
                        role.name in roles).filter((role) => role.name !== 'lol-elo-bot-approver');

                    // eslint-disable-next-line max-len
                    console.log(`Updating ${member.displayName} roles:\n\x1b[31m[-] ${rolesToRemove.map((role) => role.name).join(', ')}\x1b[0m\n\x1b[32m[+] ${pendingApproval.role.name}\x1b[0m`);

                    for (const role of rolesToRemove) {
                        await member.roles.remove(role);
                        await member.roles.add(pendingApproval.role);
                    }

                    await interactionCreate.reply({
                        content: '✅ Request approved',
                        flags: [MessageFlags.Ephemeral],
                    });
                } else if (interactionCreate.customId === reviewResult.rejected) {
                    return await interactionCreate.reply({
                        content: '❌ Request rejected',
                        flags: [MessageFlags.Ephemeral],
                    });
                }

                await pendingApproval.message.delete();
                pendingApprovals.splice(pendingApprovalIndex, 1);
            }
        }
    }
};
