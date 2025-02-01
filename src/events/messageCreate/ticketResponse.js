const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');
const tickets = require('../../utils/tickets.js');

const { ticketChannels } = require( '../../utils/ticketChannels.js');

module.exports = async (message, client) => {
    try {
        const sendDM = async (messageContent) => {
            //return message.author.dmChannel.send({ content: messageContent }).catch(e => {
            return message.author.send(messageContent).catch(e => {    
                message.reply({
                    content: "I can't DM you, please check your DM settings!"
                }).catch(e2 => {
                    console.warn(e2);
                });
                console.warn(e);
    
                return [e]
            });
        };
    
        if (message.author.bot) {
            return;
        };
    
        if (message.guild) {
            return;
        };
    
        const ticketIdString = message.content.match(/\[(.*?)\]/)?.[1];
    
        /*if (!mongoose.isValidObjectId(ticketIdString)) {
            return;
        };*/
    
        let ticketId;
        if (Types.ObjectId.isValid(ticketIdString)) {
            ticketId = new Types.ObjectId(ticketIdString);
        } else {
            return;
        };
    
        if (!ticketId) {
            return;
        }
    
        const ticket = await tickets.findOne({creatorId: message.author.id, _id: ticketId}).exec()
    
        if (!ticket) {
            return;
        };
    
        const content = message.content.replace(/\[.*?\]/, '');

        if (content.length > 500) {
            sendDM('This response goes over our 500 character limit. Please shorten down your response or send it as multiple messages.')
            return;
        }
    
        if (ticket.claimedId === '0') {
            sendDM('This ticket isn\'t claimed currently. Please wait to respond before it has been claimed.')
            return;
        };
    
        ticket.log.push(`<@${message.author.id}>: ${content}`);
    
        ticket.save();
    
        const claimedUser = await client.users.fetch(ticket.claimedId);
    
        if (!claimedUser) {
            return interaction.editReply({
                content: 'Could not find the user.',
                ephemeral: true
            });
        };
    
        claimedUser.send(`Reply from <@${message.author.id}> for the ticket with the id \`${String(ticket._id)}\`:\n\`\`\`${content}\`\`\``).catch(e => {    
            message.reply({
                content: "Something went wrong when replying to the ticket. It will be set to unclaimed to avoid further issues."
            }).catch(e2 => {
                console.warn(e2);
            });
            console.warn(e);
    
            ticket.claimedUser = '0';
    
            ticket.save();
    
            const departmentSplit = ticket.department.split('-')
    
            const category = ticketChannels[departmentSplit[0]]
    
            const pings = category.pings;
    
            const channel = client.channels.cache.get(category.channel);
    
            const ticketMessage = channel.messages.fetch(ticket.ticketMessageId);
    
            const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket')
            .setDescription('Awaiting to be claimed')
            .addFields(
                {name: 'ID', value: String(ticket._id)},
                {name: 'Topic', value: ticket.topic},
                {name: 'Important note', value: ticket.importantNote},
                {name: 'Creator', value: ticket.creatorUsername},
                {name: 'Department', value: ticket.department}
            );
        
            const claimButton = new ButtonBuilder()
                .setCustomId('claimTicket')
                .setLabel('Claim')
                .setStyle(ButtonStyle.Success)
                .setDisabled(false);
    
            const row = new ActionRowBuilder()
                .addComponents(claimButton);
    
            ticketMessage.edit({
                content: `<@&${pings[departmentSplit[1]]}>`,
                embeds: [ticketEmbed],
                components: [row]
            });
        });
    } catch (error) {
        message.reply({
            content: 'An unexpected error occurred.',
            ephemeral: true
        }).catch( e3 => {
            console.warn(e3);
        });
        console.warn(error);
    };
};
