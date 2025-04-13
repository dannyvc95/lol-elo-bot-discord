import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {commands} from '../events/messageCreate';
import roles from '../configs/roles.json';
import insults from '../resources/insults.json';
import {getRandomInteger} from '../utils/utils';
import {Tier} from '../types/LeagueEntryDTO';

const {
    ASSETS_IMAGE_SOURCE,
} = process.env;

export const handleFlame = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        // Avoid use of @channel or @here
        if (message.content.length > commands.flame.length) {
            if (!message.mentions.users.size) {
                await message.reply('¡Menciona a alguien para flamear, inútil!');
                return;
            }

            // Get the tagged user
            const user = message.mentions.users.first();
            if (!user) {
                await message.reply('No se encontró al usuario, ¿qué tan estúpido eres?');
                return;
            }

            // Get the guild member
            const guildMember = message.guild?.members.cache.get(user.id);
            if (!guildMember) {
                await message.reply('No puedo encontrar a ese usuario en el servidor, ¿qué mierda hiciste?');
                return;
            }

            // Get the list of roles of the guild member in the server
            const guildMemberRoles = guildMember.roles.cache
                .filter((role) => role.name !== '@everyone')
                .map((role) => role.name);

            const roleInsult = (guildMemberRoles.filter((role) =>
                role in roles && role !== 'lol-elo-bot-approver').at(0) ?? 'UNRANKED') as Tier | 'UNRANKED';

            const randomNumber = getRandomInteger(insults[roleInsult].length);
            let insultMessage = 'Eres una puta.\n';
            insultMessage += insults[roleInsult][randomNumber].es;

            await message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`${guildMember.nickname || guildMember.displayName} dice:`)
                    .setDescription(`<@${user.id}>, \n\n${insultMessage}\n\n Saludos!`)
                    .setThumbnail(`${ASSETS_IMAGE_SOURCE}/gato_3.png`)
                    .setColor('#FF0000')]
            });
        }
    } catch (error) {
        console.error(error);
        await message.reply('Algo salió mal, probablemente porque eres un desastre.');
    }
};
