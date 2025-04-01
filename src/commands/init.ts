import {Message, OmitPartialGroupDMChannel} from 'discord.js';

export const handleInit = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        message.reply('Hoy no fio, mañana si');
    } catch (error) {
        console.error(error);
    }
};
