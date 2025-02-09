const { SlashCommandBuilder } = require('discord.js')

const { createTicket } = require( '../../utils/ticketChannels.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-ticket')
    .setDescription('Create\'s a ticket for the support team to help you with your issue'),

    run: async ({ interaction, client, handler }) => {
        createTicket(interaction, client);
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};