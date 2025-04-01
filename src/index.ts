import dotenv from 'dotenv';
dotenv.config();

import {
    CacheType,
    Client,
    Events,
    GatewayIntentBits,
    GuildMember,
    Interaction,
    Message,
    OmitPartialGroupDMChannel,
    Role,
} from 'discord.js';

import {handleMessageCreate} from './events/messageCreate';
import {handleInteractionCreate} from './events/interactionCreate';
// import {run} from './services/mongoDbService';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Temporal database mockup
export const pendingApprovals: {
    member: GuildMember;
    role: Role;
    message: OmitPartialGroupDMChannel<Message<boolean>>;
}[] = [];

client.once(Events.ClientReady, async (clientReady) => {
    // Connect with the MongoDB database
    // await run().catch(console.dir);
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
