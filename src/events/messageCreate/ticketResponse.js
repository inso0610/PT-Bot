const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');
const tickets = require('../../utils/tickets.js');
const { ticketChannels } = require('../../utils/ticketChannels.js');

module.exports = async (message, client) => {
    try {
        const sendDM = async (messageContent) => {
            return message.author.send(messageContent).catch(e => {
                message.reply({
                    content: "I can't DM you, please check your DM settings!"
                }).catch(console.warn);
                console.warn(e);
            });
        };

        if (message.author.bot || message.guild) return;

        const ticketIdString = message.content.match(/\[(.*?)\]/)?.[1];
        if (!Types.ObjectId.isValid(ticketIdString)) return;
        
        const ticketId = new Types.ObjectId(ticketIdString);
        const ticket = await tickets.findOne({ creatorId: message.author.id, _id: ticketId }).exec();
        if (!ticket) return;

        const content = message.content.replace(/\[.*?\]/, '').trim();
        if (content.length > 500) {
            sendDM('This response exceeds the 500 character limit. Please shorten your response or send multiple messages.');
            return;
        }

        if (ticket.claimedId === '0') {
            sendDM("This ticket isn't claimed currently. Please wait until it has been claimed before responding.");
            return;
        }

        if (ticket.claimedId === '-1') {
            sendDM("This ticket has been closed. You can't respond to a closed ticket.");
            return;
        };

        let logEntry = `<@${message.author.id}>: ${content}`;
        if (message.attachments.size > 0) {
            const attachmentLinks = message.attachments.map(attachment => attachment.url).join('\n');
            logEntry += `\n**Attachments:**\n${attachmentLinks}`;
        }
        ticket.log.push(logEntry);
        await ticket.save();

        const claimedUser = await client.users.fetch(ticket.claimedId);
        if (!claimedUser) {
            message.reply({ content: 'Could not find the user.' }).catch(console.warn);
            return;
        }

        const replyMessage = `Reply from <@${message.author.id}> for ticket ID \`${String(ticket._id)}\`:\n\`\`\`${content}\`\`\``;
        claimedUser.send({ content: replyMessage, files: message.attachments.map(attachment => attachment.url) })
            .catch(e => {
                console.warn(e);
                message.reply({
                    content: "Something went wrong when replying to the ticket. It will be set to unclaimed to avoid further issues."
                }).catch(console.warn);
                ticket.claimedId = '0';
                ticket.save();

                const departmentSplit = ticket.department.split('-');
                const category = ticketChannels[departmentSplit[0]];
                const channel = client.channels.cache.get(category.channel);
                channel.messages.fetch(ticket.ticketMessageId).then(ticketMessage => {
                    const ticketEmbed = new EmbedBuilder()
                        .setTitle('🎫 Ticket')
                        .setDescription('Awaiting to be claimed')
                        .addFields(
                            { name: 'ID', value: String(ticket._id) },
                            { name: 'Topic', value: ticket.topic },
                            { name: 'Important note', value: ticket.importantNote },
                            { name: 'Creator', value: ticket.creatorUsername },
                            { name: 'Department', value: ticket.department }
                        );

                    const claimButton = new ButtonBuilder()
                        .setCustomId('claimTicket')
                        .setLabel('Claim')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(false);

                    const row = new ActionRowBuilder().addComponents(claimButton);
                    ticketMessage.edit({ content: `<@&${category.pings[departmentSplit[1]]}>`, embeds: [ticketEmbed], components: [row] })
                        .catch(console.warn);
                }).catch(console.warn);
            });

        message.reply({ content: 'Your response has been sent.' }).catch(console.warn);
    } catch (error) {
        console.warn(error);
        message.reply({ content: 'An unexpected error occurred.' }).catch(console.warn);
    }
};
