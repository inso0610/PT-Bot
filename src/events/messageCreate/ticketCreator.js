const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const tickets = require('../../utils/tickets.js');
const ticketBlacklist = require('../../utils/ticketBlacklist.js');

const { ticketChannels } = require( '../../utils/ticketChannels.js');
const creatingATicket = []

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
                filter: i => i.content.toLowerCase() === 'yes' && i.author.id === message.author.id || i.content.toLowerCase() === 'no' && i.author.id === message.author.id,
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

    const collectResponseLang = async (prompt) => {
        const DM = await sendDM(prompt);

        if (Array.isArray(DM)) {
            return DM
        };
    
        return new Promise((resolve, reject) => {
            const collector = message.author.dmChannel.createMessageCollector({
                filter: i => i.content.toLowerCase() === 'english' && i.author.id === message.author.id || i.content.toLowerCase() === 'norwegian' && i.author.id === message.author.id,
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
        // Check if blacklisted
        const blacklisted = await ticketBlacklist.findOne({discordId: message.author.id}).exec();
        if (blacklisted) {
            const blacklistDM = await sendDM(`You are blacklisted from creating tickets for the following reason: ${blacklisted.reason}. This is ${blacklisted.permanent ? 'permanent' : `until <t:${Math.floor(blacklisted.expiration.getTime() / 1000)}:F>. Contact a member of staff if you believe this is a mistake.`}.`);
            if (Array.isArray(blacklistDM)) {
                return;
            };
        };

        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Let\'s start creating your ticket.');

        try {
            if (creatingATicket.includes(message.author.id)) {
                message.reply('You are already creating a ticket.');

                return;
            };

            const DM1 = await sendDM({ embeds: [WelcomeEmbed] });

            if (Array.isArray(DM1)) {
                return;
            };

            // If the user already has a ticket ask if the person wants to create a new one
            const exitingTicket = await tickets.findOne({creatorId: message.author.id}).exec();
            const allExisting = await tickets.find({creatorId: message.author.id}).exec();

            if (exitingTicket ) {
                if (allExisting.length > 1) {
                    sendDM('You already have two tickets. Please request for one of them to be closed before creating a new one.');

                    return;
                };

                const exitstingEmbed = new EmbedBuilder()
                    .setTitle('You already have a ticket created')
                    .setDescription('Do you want to create a new one? Your old one will NOT be closed.\n\nPlease reply with Yes/No')
                    .addFields(
                        {name: 'Id', value: String(exitingTicket._id)},
                        {name: 'Topic', value: exitingTicket.topic},
                        {name: 'Description', value: exitingTicket.description},
                        {name: 'Comments', value: exitingTicket.comments},
                        {name: 'Language', value: exitingTicket.language}  
                    );
                
                const existingResponse = await collectResponseYesNo({embeds: [exitstingEmbed]})

                if (Array.isArray(existingResponse)) {
                    const index = creatingATicket.indexOf(message.author.id);

                    if (index !== -1) {
                        creatingATicket.splice(index, 1);
                    };

                    return;
                };

                if (existingResponse.toLowerCase() === 'no') {
                    sendDM('The ticket creation process has been stopped.');
                    const index = creatingATicket.indexOf(message.author.id);

                    if (index !== -1) {
                        creatingATicket.splice(index, 1);
                    };

                    return;
                };
            };

            // Ask important questions

            creatingATicket.push(message.author.id);

            const ticketTopic = await collectResponse('What is the topic of your ticket? (Images or videos need to be added as a link) (Maximum 100 characters)');

            if (Array.isArray(ticketTopic)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            if (ticketTopic.length > 100) {
                sendDM('We have a max limit of 100 characters in the topic. Please create a new ticket and shorten down your response.')
                const index = creatingATicket.indexOf(message.author.id);

                console.log(creatingATicket)

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                console.log(creatingATicket)


                return;
                
            };

            const ticketDescription = await collectResponse('Please reply with a more detailed description of your ticket. (Images or videos need to be added as a link) (Maximum 500 characters)');

            if (Array.isArray(ticketDescription)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            if (ticketDescription.length > 500) {
                sendDM('We have a max limit of 500 characters in the description. Please create a new ticket and shorten down your response.')
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            const additionalComments = await collectResponse('Do you have any additional comments? (Images or videos need to be added as a link) (Maximum 500 characters)');

            if (Array.isArray(additionalComments)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            if (additionalComments.length > 500) {
                sendDM('We have a max limit of 500 characters in the additional comments. Please create a new ticket and shorten down your response.')
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            const languageSelectionPrompt = await collectResponseLang('What language do you want support in? We only support English and Norwegian.');

            const languageSelection = languageSelectionPrompt.toUpperCase();

            if (Array.isArray(languageSelection)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            // Ask if everything is correct

            const confirmationEmbed = new EmbedBuilder()
                    .setTitle('Is this correct?')
                    .setDescription('Please reply with Yes/No\nReply with No if you don\'t want to create the ticket.')
                    .addFields(
                        {name: 'Topic', value: ticketTopic},
                        {name: 'Description', value: ticketDescription},
                        {name: 'Comments', value: additionalComments},
                        {name: 'Language', value: languageSelection}
                    );

            const confimationResponse = await collectResponseYesNo({embeds: [confirmationEmbed]});

            if (Array.isArray(confimationResponse)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            if (confimationResponse.toLowerCase() === 'no') {
                sendDM('The ticket creation process has been stopped.')
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            // Send message in EM ticket channel

            const ticket = new tickets ({
                creatorId: message.author.id,
                creatorUsername: message.author.username,
                topic: ticketTopic,
                description: ticketDescription,
                comments: additionalComments,
                ticketMessageId: '',
                language: languageSelection 
            });

            if (message.author.id === '935889950547771512') { // Emil Bot Developer
                const testTicket = await collectResponseYesNo('Hei Emil! Er dette en test ticket? Yes/No');

                if (Array.isArray(testTicket)) {
                    const index = creatingATicket.indexOf(message.author.id);
    
                    if (index !== -1) {
                        creatingATicket.splice(index, 1);
                    };
    
                    return;
                };

                if (testTicket.toLowerCase() === 'yes') {
                    ticket.department = 'DEV-BOT';
                };
            };

            if (message.author.id === '312986921804759051') { // Erlend Community Administator
                const testTicket = await collectResponseYesNo('Hei Erlend! Er dette en trening ticket? Yes/No');

                if (Array.isArray(testTicket)) {
                    const index = creatingATicket.indexOf(message.author.id);
    
                    if (index !== -1) {
                        creatingATicket.splice(index, 1);
                    };
    
                    return;
                };

                if (testTicket.toLowerCase() === 'yes') {
                    ticket.department = 'COMMUNITY-TRAINING';
                };
            };

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
                    {name: 'Department', value: ticket.department},
                    {name: 'Language', value: ticket.language}
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

            const DM2 = await sendDM('The ticket has been created.')

            if (Array.isArray(DM2)) {
                const index = creatingATicket.indexOf(message.author.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            const index = creatingATicket.indexOf(message.author.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };
            
        } catch (error) {
            const index = creatingATicket.indexOf(message.author.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            if (error.message === "Timeout") return;

            await message.author.send('Something failed in the ticket creation system.').catch();

            console.warn(`Ticket creator error: ${error}`);
        };
    };
};
