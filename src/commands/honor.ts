/* eslint-disable max-len */
import {bold, EmbedBuilder, Message, OmitPartialGroupDMChannel, spoiler, userMention} from 'discord.js';
import {createBotUser, getBotUserByUserId, giveHonor} from '../services/mongoDbService';
import {BotUser} from '../models/BotUser';
import {getHonorLevel, getNextFreeHonorPendingHours} from '../utils/utils';
import honor from '../configs/honor.json';
import {commands} from '../events/messageCreate';

const getTopFan = (honorReceived: {userId: string; date: Date;}[]) => {
    if (honorReceived.length > 0) {
        const fans: {[userId: string]: number;} = {};
        honorReceived.forEach(({userId}) => {
            if (userId in fans) {
                fans[userId]++;
            } else {
                fans[userId] = 1;
            }
        });
        const topFan = Object.entries(fans).sort(([, countA], [, countB]) => countB - countA)?.at(0);
        if (topFan && topFan[0] && topFan[1]) {
            return {userId: topFan[0], count: topFan[1]};
        }
    }
    return null;
};

export const handleHonor = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content === commands.honor) {
            const botUser = await getBotUserByUserId(message.author.id);

            if (botUser) {
                const freeHonorPendingHours = getNextFreeHonorPendingHours(botUser.honor.lastFreeHonorDate);
                const honorReceivedCount = botUser.honor.honorReceived.length;
                const honorLevel = getHonorLevel(honorReceivedCount);
                const level = honor[honorLevel];
                const topFan = getTopFan(botUser.honor.honorReceived);
                const topFanMessage = topFan?.userId && topFan?.count > 0 ? `:medal: ${spoiler(userMention(topFan.userId))} es tu mayor admirador, te ha dado ${topFan.count} honores.\n\n` : '';
                const embed = new EmbedBuilder()
                    .setTitle(`⭐ ${botUser.displayName} es honor nivel ${honorLevel}!`)
                    .setDescription(`🎉 ¡Felicidades! Has recibido ${bold(honorReceivedCount.toString())} honores.\n\n
                    ${topFanMessage}
                    :ticket: ${bold('Honor para dar:')} ${botUser.honor.honorBudgetCount.toString()}\n
                    :hourglass: ${bold('Honor gratis:')} ${freeHonorPendingHours === 0 ? 'Disponible :white_check_mark:' : `En ${freeHonorPendingHours} horas`}\n
                    :arrow_up: ${bold('Subir de nivel:')} ${`Recibe ${level.nextLevel - honorReceivedCount} honores más`}`)
                    .setFooter({text: `🤖 ${botUser.userId}`})
                    .setImage(level.image).setThumbnail('https://media.giphy.com/media/L4CXaa44hVofLv9gEU/giphy.gif')
                    .setColor('#463714');

                await message.reply({embeds: [embed]});
            } else {
                const newBotUser: BotUser = {
                    userId: message.author.id,
                    displayName: message.author.displayName,
                    honor: {
                        honorBudgetCount: 10,
                        honorReceived: [],
                        lastFreeHonorDate: new Date(),
                    }
                };

                await createBotUser(newBotUser);
                await message.reply(`${userMention(message.author.id)} creaste tu perfil de honor exitosamente, ahora puedes utilizar el comando !honor`);
            }
        } else if (message.content.length > commands.honor.length) {
            const user = message.mentions.users.first();
            if (!user) {
                await message.reply('No se encontró al usuario, ¿si existe?');
                return;
            }
            const userToGive = await getBotUserByUserId(message.author.id);
            const userToReceive = await getBotUserByUserId(user.id);

            if (userToGive && userToReceive) {
                if (userToGive.userId === userToReceive.userId) {
                    const embed = new EmbedBuilder()
                        .setTitle('Lo siento...')
                        .setDescription('¡No te puedes dar honor a ti mismo!')
                        .setImage('https://media.giphy.com/media/tEeukg7K995mflsIbn/giphy.gif');

                    return await message.reply({embeds: [embed]});
                }

                const freeHonorAvailable = getNextFreeHonorPendingHours(userToGive.honor.lastFreeHonorDate) === 0;
                if (userToGive.honor.honorBudgetCount > 0 || freeHonorAvailable) {
                    giveHonor(userToGive.userId, userToGive.honor.honorBudgetCount, userToReceive.userId, userToReceive.honor.honorBudgetCount, freeHonorAvailable);
                    // await message.reply(`<@${message.author.id}> le dio honor a <@${user.id}>!`);
                    // const img = `${process.env.ASSETS_IMAGE_SOURCE}/Teach_a_Friend.png`;

                    const embed = new EmbedBuilder()
                        .setTitle('🎉 ¡Honores! 🎉')
                        .setDescription(`¡<@${message.author.id}> le dio honor a <@${user.id}>!`)
                        .setImage('https://media.giphy.com/media/Anhzlimjf62oNKM9mt/giphy.gif');

                    await message.reply({embeds: [embed]});

                } else {
                    const embed = new EmbedBuilder()
                        .setTitle('Lo siento...')
                        .setDescription('No tienes honores para dar, recuerda que tienes un honor gratis cada 24 horas.')
                        .setImage('https://media.giphy.com/media/6vjrlLxW0fJlSD2Xvy/giphy.gif');

                    await message.reply({embeds: [embed]});
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};
