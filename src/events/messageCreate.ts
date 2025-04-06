import {ActionRowBuilder, Collection, EmbedBuilder, Message, OmitPartialGroupDMChannel, quote, subtext, userMention} from 'discord.js';
import {handlePing} from '../commands/ping';
import {handleElo} from '../commands/elo';
import {handleHonor} from '../commands/honor';
import {handleStats} from '../commands/stats';
import {handleFlame} from '../commands/flame';
import {handleFle} from '../commands/fle';
import {createBotUser, getBotUserByUserId} from '../services/mongoDbService';

export const commands = {
    ping: '!ping',
    elo: '!elo ',
    honor: '!honor',
    stats: '!stats ',
    flame: '!flame ',
    fle: '!fle',
};

export const handleMessageCreate = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content === commands.ping) {
            await handlePing(message);
        } else if (message.content.startsWith(commands.elo)) {
            await handleElo(message);
        } else if (message.content.startsWith(commands.honor)) {
            await handleHonor(message);
        } else if (message.content.startsWith(commands.stats)) {
            await handleStats(message);
        } else if (message.content.startsWith(commands.flame)) {
            await handleFlame(message);
        } else if (message.content === commands.fle) {
            await handleFle(message);
        } else if (message.content === '!init-honor') {
            try {
                let count = 0;
                if (!message.guild) return;

                const members = await message.guild.members.fetch();

                if (!members) return;

                for (const member of members) {
                    const user = await getBotUserByUserId(member[1].id);
                    if (!user) {
                        await createBotUser({
                            userId: member[1].id,
                            displayName: member[1].displayName,
                            honor: {
                                honorBudgetCount: 5,
                                honorReceived: [],
                                lastFreeHonorDate: new Date(),
                            }
                        });
                        count++;
                    }
                }

                await message.reply(`Server members: ${members.size} \n${count} honor profiles created automatically.`);
            } catch (error) {
                console.error(error);
            }
        } else if (message.content === '!x') {
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🎉 ¡Honor! 🎉')
                        // eslint-disable-next-line max-len
                        .setDescription(quote(`${userMention(message.author.id)} le dio honor a ${userMention(message.author.id)}.`))
                        .setImage('https://media.giphy.com/media/Anhzlimjf62oNKM9mt/giphy.gif')
                        .setColor('#C89B3C')
                ]
            });
        }
    } catch (error) {
        console.error(error);
    }
};
