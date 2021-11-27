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
        console.log(gasLevel);
        await interaction.reply(`Removed alert at ${gasLevel} GWEI!`);
    },
};