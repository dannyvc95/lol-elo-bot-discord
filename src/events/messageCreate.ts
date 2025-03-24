import {Message, OmitPartialGroupDMChannel} from 'discord.js';
import {handlePing} from '../commands/ping';
import {handleElo} from '../commands/elo';
import {handleInit} from '../commands/init';
import {handleStats} from '../commands/stats';

export const commands = {
    ping: '!ping',
    elo: '!elo ',
    init: '!init',
    stats: '!stats '
};

export const handleMessageCreate = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        if (message.content === commands.ping) {
            await handlePing(message);
        } else if (message.content.startsWith(commands.elo)) {
            await handleElo(message);
        } else if (message.content === commands.init) {
            await handleInit(message);
        } else if (message.content.startsWith(commands.stats)) {
            await handleStats(message);
        }
    } catch (error) {
        console.error(error);
    }
};
