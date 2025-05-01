import {bold, EmbedBuilder, Message, OmitPartialGroupDMChannel, quote} from 'discord.js';
import {honorUser} from '../services/mongoDbService';

export const handleNox = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        const frames = ['🌑', '🌒', '🌓', '🌔', '🌕'];
        let index = 0;

        const _message = await message.reply(frames[index]);

        const interval = setInterval(async () => {
            index++;

            if (index >= frames.length) {
                return clearInterval(interval);
            }

            await _message.edit(frames[index]);

            if (index === frames.length - 1) {
                await honorUser(message.author.id, 10);

                await _message.edit({
                    content: '',
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('¡Comando secreto!')
                            .setDescription(`Parece que encontraste mi comando secreto.
                                Toma ${bold('10')} honores como regalo 🤓💙 - te quiere (o no) ${quote('Nox')}`)
                            .setImage('https://media.giphy.com/media/TuzTiPbTX5FSATdFYx/giphy.gif')
                            .setColor('DarkVividPink')
                    ]
                });
            }
        }, 500);
    } catch (error) {
        console.error(error);
    }
};
