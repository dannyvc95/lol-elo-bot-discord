import {Message, OmitPartialGroupDMChannel} from 'discord.js';

export const handlePing = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        message.reply('pong!');
    } catch (error) {
        console.error(error);
    }
};
