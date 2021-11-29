const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setalert')
        .setDescription('Set gas tracking alert at a certain GWEI')
        .addIntegerOption(option =>
            option.setName('gas')
                .setDescription('Minimum GWEI level to be notified about')
                .setRequired(true)),
    // .addBooleanOption(option =>
    //     option.setName('repeat')
    //         .setDescription('Have this be a repeat alert (once a day)')),
    async execute(interaction, db) {
        const gasLevel = interaction.options.getInteger('gas');
        // const repeatValue = interaction.options.getBoolean('repeat') || false;

        // If not acceptable level, return
        if (gasLevel < 0 || gasLevel > 10000) {
            await interaction.reply(`${gasLevel} is out of reasonable range for GWEI!`);
            return;
        }

        // See if trackers for this level exist
        const query = { gasLevel: gasLevel };
        const gasObj = await db.findOne(query);

        // If object exists, append userList
        if (gasObj) {
            // Check if user already in list
            const userInserted = gasObj.userLists.find(user => user.userID === interaction.user.id);
            if (userInserted) {
                console.log(`Alert already set, user ${userInserted.userID}`);
                await interaction.reply(`You already have an alert set at ${gasLevel} GWEI!`);
                return;
            }
            // If not on the list
            else {
                // Create new user object
                const newUser = {
                    userID: interaction.user.id,
                    userObj: interaction.user,
                    guildID: interaction.guild.id,
                    guildName: interaction.guild.name,
                    timeInserted: new Date(),
                    // repeat: repeatValue,
                };

                // Extend the user list
                const extendedList = [
                    ...gasObj.userLists,
                    newUser
                ];

                // Update document
                const updateDoc = {
                    $set: {
                        userLists: extendedList
                    },
                };

                const result = await db.updateOne(query, updateDoc);
                console.log(
                    `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
                );
            }
        }
        // If object not already created
        else {
            // Format insert data
            const insertData = {
                gasLevel: gasLevel,
                timeCreated: new Date(),
                userLists: [
                    {
                        userID: interaction.user.id,
                        userObj: interaction.user,
                        guildID: interaction.guild.id,
                        guildName: interaction.guild.name,
                        timeInserted: new Date(),
                        // repeat: repeatValue,
                    },
                ],
            }

            // Insert data
            const result = await db.insertOne(insertData);
            console.log(`Created new tracking alert for ${gasLevel} GWEI, for user ${interaction.user.username}, with ID:${result.insertedId}`);
        }
        // Send confirmation message 
        await interaction.reply(`Set alert at ${gasLevel} GWEI!`);
    },
};