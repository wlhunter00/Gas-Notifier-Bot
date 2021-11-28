const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listalerts')
        .setDescription('List all gas tracking alerts'),
    async execute(interaction, db) {
        const uID = interaction.user.id;
        console.log(uID);
        const query = { 'userLists.userID': uID };
        const trackerList = await db.find(query).toArray();

        let finalString = "You have trackers set at the following GWEI amounts: ";

        trackerList.forEach(level => {
            console.log(level);
            finalString = finalString + "**" + level.gasLevel + "**, ";
        });

        finalString = finalString.substring(0, finalString.length - 2);

        await interaction.reply(finalString + ".");
    },
};