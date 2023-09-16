const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! Gives you the bot\'s ping'),

    run: async ({ interaction, client }) => {
        await interaction.deferReply({
            content: 'Wait...',
            ephemeral: true
        });

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong! Client: ${ping}ms | Websocket: ${client.ws.ping} ms`)
    }
}