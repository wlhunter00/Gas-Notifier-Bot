const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setalert')
        .setDescription('Set gas tracking alert at a certain GWEI')
        .addIntegerOption(option =>
            option.setName('gas')
                .setDescription('Minimum GWEI level to be notified about')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('repeat')
                .setDescription('Have this be a repeat alert (once a day)')),
    async execute(interaction, db) {
        const gasLevel = interaction.options.getInteger('gas');

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
            const userInserted = gasObj.userLists.find(user => user.userID === interaction.user.id);
            console.log(userInserted);
        }
        else {
            const insertData = {
                gasLevel: gasLevel,
                timeInserted: new Date(),
                userLists: [
                    {
                        userID: interaction.user.id,
                        userObj: interaction.user,
                        guildID: interaction.guild.id,
                        guildName: interaction.guild.name,
                        repeat: false,
                    },
                ],
            }

            const result = await db.insertOne(insertData);
            console.log(`Created new tracking alert for ${gasLevel} GWEI, for user ${interaction.user.username}, with ID:${result.insertedId}`);
        }

        await interaction.reply(`Set alert at ${gasLevel} GWEI!`);
    },
};