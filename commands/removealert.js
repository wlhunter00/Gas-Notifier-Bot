const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removealert')
        .setDescription('Remove gas tracking alert at a certain GWEI')
        .addIntegerOption(option =>
            option.setName('gas')
                .setDescription('GWEI level to remove tracker')
                .setRequired(true)),
    async execute(interaction, db) {
        const gasLevel = interaction.options.getInteger('gas');
        const query = { gasLevel: gasLevel };
        const gasObj = await db.findOne(query);

        // If the object hasn't been created 
        if (!gasObj) {
            await interaction.reply(`You don't have any alerts set at ${gasLevel} GWEI!`);
            return;
        }

        // If the object has been created but user isn't in the list
        const userRemoved = gasObj.userLists.find(user => user.userID === interaction.user.id);
        if (!userRemoved) {
            await interaction.reply(`You don't have any alerts set at ${gasLevel} GWEI!`);
            return;
        }

        // Created new filtered list
        const newUserList = gasObj.userLists.filter(user => user.userID !== interaction.user.id);
        const updateDoc = {
            $set: {
                userLists: newUserList
            },
        };

        // Update the list
        const result = await db.updateOne(query, updateDoc);
        console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        );

        await interaction.reply(`Removed alert at ${gasLevel} GWEI!`);
    },
};