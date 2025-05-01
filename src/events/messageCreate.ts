import {bold, Message, OmitPartialGroupDMChannel} from 'discord.js';
import {handleElo} from '../commands/elo';
import {handleFlame} from '../commands/flame';
import {handleFle} from '../commands/fle';
import {handleHonor} from '../commands/honor';
import {handleNox} from '../commands/nox';
import {handlePing} from '../commands/ping';
import {handleStats} from '../commands/stats';
import {createBotUser, getBotUserByUserId} from '../services/mongoDbService';

export const commands = {
    ping: '!ping',
    elo: '!elo ',
    honor: '!honor',
    stats: '!stats ',
    flame: '!flame ',
    fle: '!fle',
    nox: '!nox',
};

export const handleMessageCreate = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        const noxUserId = '496463911604715541';
        if (!message.author.bot && !message.mentions.everyone &&
            !message.reference && message.mentions.users.has(noxUserId)) {
            // eslint-disable-next-line max-len
            const noxMessage = `Hola,\n\nlamentablemente ${bold('Nox')} está chambeando y no tiene tiempo para sus mamadas. Por favor intente más tarde.\n\nSi no eres Thonking, perdón ahorita te contesto xD.`;
            await message.reply(noxMessage);
        }

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
        } else if (message.content === commands.nox) {
            await handleNox(message);
        } else if (message.content === '!cookie') {
            await message.reply('Comando para Flor, pero no dijo que quiere que haga...');
        }
    } catch (error) {
        console.error(error);
    }
};
