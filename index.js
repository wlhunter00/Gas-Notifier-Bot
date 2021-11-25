require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

// Retrive commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Once logged in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// // Old Message Type
// client.on('messageCreate', msg => {
//     if (msg.content === '!ping') {
//         msg.reply('Pong!');
//     }
// let prefix = "!";
// if (message.content.startsWith("prefix")) {
//     const args = message.content.slice(prefix.length).trim().split(/ +/);
//     const commandName = args.shift().toLowerCase();
// }

// });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// ENV client token
client.login(process.env.CLIENT_TOKEN);