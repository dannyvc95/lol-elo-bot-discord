import dotenv from 'dotenv';
dotenv.config();

import {
    CacheType,
    Client,
    Events,
    GatewayIntentBits,
    Interaction,
    Message,
    OmitPartialGroupDMChannel,
} from 'discord.js';

import {handleMessageCreate} from './events/messageCreate';
import {handleInteractionCreate} from './events/interactionCreate';
import {connectDatabase} from './services/mongoDbService';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once(Events.ClientReady, async (clientReady) => {
    await connectDatabase().catch(console.dir);
    console.log(`Bot logged in as ${clientReady.user.tag}!`);
});

client.on(Events.MessageCreate, async (messageCreate: OmitPartialGroupDMChannel<Message<boolean>>) => {
    try {
        await handleMessageCreate(messageCreate);
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async (interactionCreate: Interaction<CacheType>) => {
    try {
        await handleInteractionCreate(interactionCreate);
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
