const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const tickets = require('../../utils/tickets.js');

const { ticketChannels, allowedTransfers } = require( '../../utils/ticketChannels.js');

module.exports = async (message, client) => {
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
    
    const collectResponse = async (prompt) => {
        const DM = await sendDM(prompt);

        if (Array.isArray(DM)) {
            return DM
        };
    
        return new Promise((resolve, reject) => {
            const collector = message.author.dmChannel.createMessageCollector({
                filter: i => i.author.id === message.author.id,
                time: 120_000,
                max: 1
            });
    
            collector.on('collect', i => resolve(i.content));
            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    message.author.send("You took too long to respond. Please try again.");
                    reject(new Error("Timeout"));
                }
            });
        });
    };

    const collectResponseYesNo = async (prompt) => {
        const DM = await sendDM(prompt);

        if (Array.isArray(DM)) {
            return DM
        };
    
        return new Promise((resolve, reject) => {
            const collector = message.author.dmChannel.createMessageCollector({
                filter: i => i.content.toLowerCase() === 'yes' || i.content.toLowerCase() === 'no',
                time: 60000,
                max: 1
            });
    
            collector.on('collect', i => resolve(i.content));
            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    message.author.send("You took too long to respond. Please try again.");
                    reject(new Error("Timeout"));
                }
            });
        });
    };

    if (message.author.bot) {
        return;
    };

    if (message.mentions.has(client.user) && message.content === '<@1152626581022445599>') {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Let\'s start creating your ticket.');

        try {
            const DM1 = await sendDM({ embeds: [WelcomeEmbed] });

            if (Array.isArray(DM1)) {
                return;
            };

            // If the user already has a ticket ask if the person wants to create a new one
            const exitingTicket = await tickets.findOne({creatorId: message.author.id}).exec();

            if (exitingTicket) {
                const exitstingEmbed = new EmbedBuilder()
                    .setTitle('You already have a ticket created')
                    .setDescription('Do you want to create a new one? Your old one will NOT be closed.\n\nPlease reply with Yes/No')
                    .addFields(
                        {name: 'Id', value: String(exitingTicket._id)},
                        {name: 'Topic', value: exitingTicket.topic},
                        {name: 'Description', value: exitingTicket.description},
                        {name: 'Comments', value: exitingTicket.comments}
                    );
                
                const existingResponse = await collectResponseYesNo({embeds: [exitstingEmbed]})

                if (Array.isArray(existingResponse)) {
                    return;
                };

                if (existingResponse.toLowerCase() === 'no') {
                    sendDM('The ticket creation process has been stopped.');
                    return;
                };
            };

            // Ask important questions

            const ticketTopic = await collectResponse('What is the topic of your ticket? (Images or videos need to be added as a link)');

            if (Array.isArray(ticketTopic)) {
                return;
            };

            const ticketDescription = await collectResponse('Please reply with a more detailed description of your ticket. (Images or videos need to be added as a link)');

            if (Array.isArray(ticketDescription)) {
                return;
            };

            const additionalComments = await collectResponse('Do you have any additional comments? (Images or videos need to be added as a link)');

            if (Array.isArray(additionalComments)) {
                return;
            };

            // Ask if everything is correct

            const confirmationEmbed = new EmbedBuilder()
                    .setTitle('Is this correct?')
                    .setDescription('Please reply with Yes/No')
                    .addFields(
                        {name: 'Topic', value: ticketTopic},
                        {name: 'Description', value: ticketDescription},
                        {name: 'Comments', value: additionalComments}
                    );

            const confimationResponse = await collectResponseYesNo({embeds: [confirmationEmbed]});

            if (Array.isArray(confimationResponse)) {
                return;
            };

            if (confimationResponse.toLowerCase() === 'no') {
                sendDM('The ticket creation process has been stopped.')
                return;
            };

            // Respond that the ticket was created

            const DM2 = await sendDM('The ticket has been created.')

            if (Array.isArray(DM2)) {
                return;
            };

            // Send message in EM ticket channel

            const ticket = new tickets ({
                creatorId: message.author.id,
                creatorUsername: message.author.username,
                topic: ticketTopic,
                description: ticketDescription,
                comments: additionalComments,
                ticketMessageId: ''
            });

            const departmentSplit = ticket.department.split('-')

            const category = ticketChannels[departmentSplit[0]]

            const pings = category.pings;

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

            const channel = client.channels.cache.get(category.channel);

            const ticketMessage = await channel.send({
                content: `<@&${pings[departmentSplit[1]]}>`,
                embeds: [ticketEmbed],
                components: [row]
            });

            ticket.ticketMessageId = ticketMessage.id;

            ticket.save();
            
        } catch (error) {
            await message.author.send('Something failed in the ticket creation system.').catch();

            console.warn(`Ticket creator error: ${error}`);
        };
    };
};
