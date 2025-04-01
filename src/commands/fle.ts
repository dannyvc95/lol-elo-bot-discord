import {EmbedBuilder, Message, OmitPartialGroupDMChannel} from 'discord.js';

const {
    ASSETS_IMAGE_SOURCE,
} = process.env;

export const handleFle = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        await message.reply({
            embeds: [new EmbedBuilder()
                .setTitle('Sale fle?')
                // eslint-disable-next-line max-len
                .setDescription(`@here, \n\n**${message.author.username}** está buscando cuatro manquitos que se dejen carrear`)
                .setThumbnail(`${ASSETS_IMAGE_SOURCE}/gato_2.png`)
                .setColor('#FFFFFF')]
        });
    } catch (error) {
        console.error(error);
    }
};
