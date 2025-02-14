const { SlashCommandBuilder } = require('discord.js');
const tickets = require('../../utils/tickets.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('closed-tickets')
    .setDescription('Sends a list of all closed tickets.')
    .setDMPermission(false),

    run: async ({ interaction, client, handler }) => {
        const closedTickets = tickets.find({ claimedId: -1}).exec();
        if (!closedTickets.length) return interaction.reply('There are no closed tickets.');

        //Split into multiple if too long message
        const messages = [];
        let message = '';
        closedTickets.forEach(ticket => {
            if (message.length + ticket.toString().length > 2000) {
                messages.push(message);
                message = '';
            }
            message += ticket.toString() + '\n';
        });
        messages.push(message);

        interaction.reply({
            content: '**Here is a list of all closed tickets:**',
            ephemeral: true,
        });

        messages.forEach(msg => interaction.followUp({
            content: msg,
            ephemeral: true,
        }));
    },
    gaOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};