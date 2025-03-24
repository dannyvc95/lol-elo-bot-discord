import dotenv from 'dotenv';
dotenv.config();

import {
    Client,
    Events,
    GatewayIntentBits,
    Message,
    OmitPartialGroupDMChannel,
} from 'discord.js';

import {handleMessageCreate} from './events/messageCreate';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once(Events.ClientReady, (clientReady) => {
    console.log(`Bot logged in as ${clientReady.user.tag}!`);
});

client.on(Events.MessageCreate, async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        await handleMessageCreate(message);
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
