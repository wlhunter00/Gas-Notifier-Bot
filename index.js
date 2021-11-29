// Import ENV
require('dotenv').config();

// Mongo imports
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PW}@cluster0.wqfvl.mongodb.net/GasBot?retryWrites=true&w=majority`;
const dbClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let GasList;

// Discord imports
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

// Setup API Call
let clientLogin = false;
const axios = require('axios');

// Retrive commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Once logged in
client.once('ready', async () => {
    await dbClient.connect();
    const database = dbClient.db('GasBot');
    GasList = database.collection('TrackingList');
    console.log("Database connected:", GasList.namespace);
    console.log(`Logged in as ${client.user.tag}!`);
    clientLogin = true;
});

client.on('interactionCreate', async interaction => {
    console.log(clientLogin);
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, GasList);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }


});

// ENV client token
client.login(process.env.CLIENT_TOKEN);

// Now setup a 5 minute running timer, and inside call axios fetch to etherscan.
setInterval(async function () {
    // If logged in to a discord server
    if (clientLogin) {
        try {
            // Retrieve gas data from etherscan
            const response = await axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`);
            const gasPrice = parseInt(response.data.result.ProposeGasPrice);
            const currentTime = new Date();
            console.log(currentTime.toISOString(), "gas price", gasPrice);

            // Retrieve all gas objects from api lower than value with a non-empty userlist
            const query = { gasLevel: { $gt: gasPrice + 1 }, userLists: { $exists: true, $type: 'array', $ne: [] } };
            const gasObjects = await GasList.find(query).toArray();
            // If array isn't empty
            if (gasObjects.length !== 0) {
                // List of users already pinged
                let notifiedUserIDs = [];

                // For each gas object
                for await (const gasObject of gasObjects) {
                    // Get user list
                    const userList = gasObject.userLists;
                    // For each user
                    for await (const user of userList) {
                        // If we haven't messaged the user already
                        if (!notifiedUserIDs.includes(user.userID)) {
                            const sendUser = await client.users.fetch(user.userID);
                            sendUser.send(`Hey <@${user.userID}>, gas is at ${gasPrice} GWEI! (You wanted to be notified once gas was lower than ${gasObject.gasLevel} GWEI)`);
                            // Add user to the list
                            notifiedUserIDs.push(user.userID);
                        }
                    }
                }
                console.log(`Notified ${notifiedUserIDs.length} users`);
                // Set updated list (reuse query from before)
                // TODO: Refine this so that we can have repeat objects (requires cooldowns). Basically clear the userlist array, unless repeat is true (and if repeat is true, then set the cooldown). Going to want to check for cooldown in original query.
                const updatedUserList = {
                    $set: {
                        userLists: []
                    },
                };
                // Update any applicable alert levels
                const result = await GasList.updateMany(query, updatedUserList);
                console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
            }

        } catch (error) {
            console.error(error);
        }
    }
}, 20000);