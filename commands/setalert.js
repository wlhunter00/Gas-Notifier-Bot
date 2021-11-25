const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setalert')
        .setDescription('Set gas tracking alert at a certain GWEI')
        .addIntegerOption(option =>
            option.setName('gas')
                .setDescription('Minimum GWEI level to be notified about')
                .setRequired(true)),
    async execute(interaction) {
        const gasLevel = interaction.options.getInteger('gas');
        console.log(gasLevel);

        if (gasLevel < 0 || gasLevel > 10000) {
            await interaction.reply(`${gasLevel} is out of reasonable range for GWEI!`);
            return;
        }

        await interaction.reply(`Set alert at ${gasLevel} GWEI!`);
    },
};