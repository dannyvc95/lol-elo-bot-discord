import {Message, OmitPartialGroupDMChannel} from 'discord.js';

export const handleInit = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        message.reply('TODO: implement !init command');
    } catch (error) {
        console.error(error);
    }
};
