const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong! Gir deg botten sin ping.'),

    run: async ({ interaction, client }) => {
        await interaction.deferReply({
            content: 'Vent...',
            ephemeral:true
        });

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Pong! Client: ${ping}ms | Websocket: ${client.ws.ping} ms`)
    }
}