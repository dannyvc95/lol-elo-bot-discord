import {SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable} from 'discord.js';
import {pingDatabase} from '../../services/mongoDbService';
import rolesJson from '../../configs/roles.json';

type Roles =
    | 'IRON'
    | 'BRONZE'
    | 'SILVER'
    | 'GOLD'
    | 'PLATINUM'
    | 'EMERALD'
    | 'DIAMOND'
    | 'MASTER'
    | 'GRANDMASTER'
    | 'CHALLENGER'
    | 'lol-elo-bot-approver';

export const initCommand = new SlashCommandBuilder()
    .setName('init')
    .setDescription('Initializes the bot setup.');

export async function executeInitCommand(interaction: ChatInputCommandInteraction) {

    console.log('Executing init command...');

    const description = `I'm setting things up behind the scenes to make sure the bot works smoothly.
        \nThis will only take a moment...\n`;
    let checkingRolesMessage = '\n ⚙️ Checking roles...';
    let checkingDatabaseMessage = '\n ⚙️ Checking database...';

    const embed = new EmbedBuilder()
        .setTitle('🛠️ Configuring the bot...')
        .setDescription(`${description}${checkingRolesMessage}${checkingDatabaseMessage}`)
        .setImage('https://media.giphy.com/media/M1piXuMMzEMi5ySXFK/giphy.gif')
        .setThumbnail('https://media.giphy.com/media/EqImTLTIzy9Pq5JZ1r/giphy.gif')
        .setColor('#A09B8C');

    const reply = await interaction.reply({embeds: [embed]});

    checkingRolesMessage = await areRolesCreated(interaction) ? '\n ✅ Roles created.' : '\n ❌ Missing roles.';
    checkingDatabaseMessage = pingDatabase() ? '\n ✅ Database connected.' : '\n ❌ Cannot connect with database.';

    embed.setDescription(`${description}${checkingRolesMessage}${checkingDatabaseMessage}`);
    await reply.edit({embeds: [embed]});
}

async function areRolesCreated(interaction: ChatInputCommandInteraction): Promise<boolean> {
    try {
        // Check if all required roles are available within the server
        const guildRoles = await interaction.guild?.roles.fetch();

        for (const role of Object.keys(rolesJson)) {

            // Create required role in case is not available
            if (!guildRoles?.find(({name}) => name === role)) {
                const {color} = rolesJson[role as Roles];

                await interaction.guild?.roles.create({
                    color: color as ColorResolvable,
                    name: role,
                });

                console.log(`\x1b[32m[+] ${role} role created\x1b[0m`);
            }
        }

        return Promise.resolve(true);
    } catch (error) {
        console.error(error);
    }

    return Promise.reject(false);
}
