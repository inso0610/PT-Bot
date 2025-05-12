const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const tickets = require('../../utils/tickets.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closed-tickets')
        .setDescription('Lists all closed ticket IDs.')
        .setContexts(['Guild']),

    run: async ({ interaction }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const closedTickets = await tickets.find({ claimedId: '-1' }).exec();
        if (!closedTickets.length) {
            return interaction.editReply({
                content: 'There are no closed tickets.',
            });
        }

        // Prepare message chunks
        const messages = [];
        let message = 'Closed Ticket IDs:\n';
        closedTickets.forEach(ticket => {
            const ticketStr = `- ${ticket._id.toString()} - <@${ticket.creatorId}> - ${ticket.topic}\n`; // Formatting as a list
            if (message.length + ticketStr.length > 2000) {
                messages.push(message);
                message = 'Closed Ticket IDs (cont.):\n';
            }
            message += ticketStr;
        });
        messages.push(message);

        await interaction.editReply({
            content: messages.shift(),
        });

        for (const msg of messages) {
            await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral });
        }
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
