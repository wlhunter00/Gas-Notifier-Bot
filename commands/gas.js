const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gas')
        .setDescription('Get current gas prices'),
    async execute(interaction, db) {
        const response = await axios.get(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`);
        const gasPrice = parseInt(response.data.result.ProposeGasPrice);

        console.log(`${interaction.user.id} requested gas at:`, gasPrice);
        await interaction.reply({ content: `Current average gas fee: **${gasPrice}** GWEI`, ephemeral: true });
    },
};