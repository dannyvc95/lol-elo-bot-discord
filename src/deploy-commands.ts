import {REST, Routes} from 'discord.js';
import {config} from 'dotenv';
import {initCommand as initCommand} from './commands/slash/init';
import {eloCommand as eloCommand} from './commands/slash/elo';
import {outCommand as outCommand} from './commands/slash/out';
import {pingCommand as pingCommand} from './commands/slash/ping';
import {friendsCommand as friendsCommand} from './commands/slash/friends';


config();

const commands = [
    initCommand.toJSON(),
    eloCommand.toJSON(),
    outCommand.toJSON(),
    pingCommand.toJSON(),
    friendsCommand.toJSON(),
];

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_BOT_TOKEN!);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        console.log(commands.map(({name}) => name));

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
            {body: commands},
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
