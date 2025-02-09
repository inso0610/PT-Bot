const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (message, client) => {
    const createTicketButton = new ButtonBuilder()
    .setCustomId('createTicket')
    .setLabel('Create a ticket')
    .setStyle(ButtonStyle.Success);

    const ticketRow = new ActionRowBuilder()
        .addComponents(createTicketButton);

    if (message.mentions.has(client.user) && message.content === '<@1152626581022445599>') {
        message.reply({
            content: 'If you want to create a ticket use the /create-ticket command or the button below.',
            components: [ticketRow]
        });
    };
};
