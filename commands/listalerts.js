const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listalerts')
        .setDescription('List all gas tracking alerts'),
    async execute(interaction) {
        await interaction.reply('Here are your active alerts:');
    },
};