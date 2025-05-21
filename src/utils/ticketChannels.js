const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');

const tickets = require('./tickets.js');
const ticketBlacklist = require('./ticketBlacklist.js');

const ticketChannels = {
    OPS: {
        channel: '1304844118190456964',
        pings: {
            ALL: '1133749323344125992',
            DM: '1089284413684199474',
            CM: '1089284414976049272',
            PM: '1089284411763204197',
            SM: '1089284410332942366'
        }
    },
    COMMUNITY: {
        channel: '1304843841810993214',
        pings: {
            ALL: '1302284945451913308',
            TRAINING: '1142479698635526304'
        }
    },
    DEV: {
        channel: '1304847708841836564',
        pings: {
            ALL: '1304848035435646986',
            AR: '1314328161449676900',
            DEV: '1089284405379465256',
            BOT: '1304849124528754729',
            WEB: '1281956551178981566'
        }
    },
    MARKETING: {
        channel: '1304845302963896462',
        pings: {
            ALL: '1304845486922006529',
            SOCIAL: '1281956316293763142'
        }
    },
    SENIOR: {
        channel: '1304846910137434182',
        pings: {
            ALL: '1326233866083762277',
            SA: '1089284402791588070',
            OM: '1089284408042848377',
        }
    },
    SPECIAL: {
        channel: '1304849594659635310',
        pings: {
            RA: '1256533116856565802'
        }
    },
    DIRECTOR: {
        channel: '1304850457390354512',
        pings: {
            ALL: '1140260309915938866',
            MD: '1089284398760874104',
            OD: '1089284399830409337',
            ED: '1089284397519347762'
        }
    },
    ADVISOR: {
        channel: '1304850860387602482',
        pings: {
            ALL: '1089284396282032178',
            CA: '1294321619149262942',
            GH: '1089284394952441948'
        }
    }
};

const creatingATicket = [];

async function createTicket(interaction, client) {
    await interaction.reply({
        content: 'The ticket creation process is starting. Please check your DMs.',
        flags: MessageFlags.Ephemeral
    });

    const createTicketButton = new ButtonBuilder()
        .setCustomId('createTicket')
        .setLabel('Create a new ticket')
        .setStyle(ButtonStyle.Success);

    const ticketRow = new ActionRowBuilder()
        .addComponents(createTicketButton);


    const sendDM = async (messageContent) => {
        //return interaction.user.dmChannel.send({ content: messageContent }).catch(e => {
        return interaction.user.send(messageContent).catch(e => {
            interaction.followUp({
                content: "I can't DM you, please check your DM settings!",
                flags: MessageFlags.Ephemeral
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
            const collector = interaction.user.dmChannel.createMessageCollector({
                filter: i => i.author.id === interaction.user.id,
                time: 120_000,
                max: 1
            });

            collector.on('collect', i => resolve(i.content));
            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.user.send({
                        content:"You took too long to respond. Please try again.",
                        components: [ticketRow]
                    }).catch();

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
            const collector = interaction.user.dmChannel.createMessageCollector({
                filter: i => i.content.toLowerCase() === 'yes' && i.author.id === interaction.user.id || i.content.toLowerCase() === 'no' && i.author.id === interaction.user.id,
                time: 60000,
                max: 1
            });

            collector.on('collect', i => resolve(i.content));
            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.user.send({
                        content:"You took too long to respond. Please try again.",
                        components: [ticketRow]
                    }).catch();

                    reject(new Error("Timeout"));
                };
            });
        });
    };

    const collectResponseLang = async (prompt) => {
        const DM = await sendDM(prompt);

        if (Array.isArray(DM)) {
            return DM
        };

        return new Promise((resolve, reject) => {
            const collector = interaction.user.dmChannel.createMessageCollector({
                filter: i => i.content.toLowerCase() === 'english' && i.author.id === interaction.user.id || i.content.toLowerCase() === 'norwegian' && i.author.id === interaction.user.id,
                time: 60000,
                max: 1
            });

            collector.on('collect', i => resolve(i.content));
            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.user.send({
                        content:"You took too long to respond. Please try again.",
                        components: [ticketRow]
                    }).catch();

                    reject(new Error("Timeout"));
                };
            });
        });
    };

    if (interaction.user.bot) {
        return;
    };

    // Check if blacklisted
    const blacklisted = await ticketBlacklist.findOne({ discordId: interaction.user.id }).exec();
    if (blacklisted) {
        const blacklistDM = await sendDM(`You are blacklisted from creating tickets for the following reason: ${blacklisted.reason}. This is ${blacklisted.permanent ? 'permanent' : `until <t:${Math.floor(blacklisted.expiration.getTime() / 1000)}:F>. Contact a member of staff if you believe this is a mistake`}.`);
        if (Array.isArray(blacklistDM)) {
            return;
        };
        return;
    };

    const WelcomeEmbed = new EmbedBuilder()
        .setTitle('Welcome to our ticket system!')
        .setDescription('Let\'s start creating your ticket.');

    try {
        if (creatingATicket.includes(interaction.user.id)) {
            interaction.followUp({
                content: 'You are already creating a ticket.',
                flags: MessageFlags.Ephemeral
            });

            return;
        };

        const DM1 = await sendDM({ embeds: [WelcomeEmbed] });

        if (Array.isArray(DM1)) {
            return;
        };

        // If the user already has a ticket ask if the person wants to create a new one
        const exitingTicket = await tickets.findOne({ 
            creatorId: interaction.user.id, 
            claimedId: { $ne: '-1' } 
        }).exec();
        
        const allExisting = await tickets.find({ 
            creatorId: interaction.user.id, 
            claimedId: { $ne: '-1' } 
        }).exec();

        if (exitingTicket) {
            if (allExisting.length >= 2) {
                sendDM('You already have two tickets. Please request for one of them to be closed before creating a new one.');

                return;
            };

            const exitstingEmbed = new EmbedBuilder()
                .setTitle('You already have a ticket created')
                .setDescription('Do you want to create a new one? Your old one will NOT be closed.\n\nPlease reply with Yes/No')
                .addFields(
                    { name: 'Id', value: String(exitingTicket._id) },
                    { name: 'Topic', value: exitingTicket.topic },
                    { name: 'Description', value: exitingTicket.description },
                    { name: 'Comments', value: exitingTicket.comments },
                    { name: 'Language', value: exitingTicket.language }
                );

            const existingResponse = await collectResponseYesNo({ embeds: [exitstingEmbed] })

            if (Array.isArray(existingResponse)) {
                const index = creatingATicket.indexOf(interaction.user.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };

            if (existingResponse.toLowerCase() === 'no') {
                sendDM('The ticket creation process has been stopped.');
                const index = creatingATicket.indexOf(interaction.user.id);

                if (index !== -1) {
                    creatingATicket.splice(index, 1);
                };

                return;
            };
        };

        // Ask important questions

        creatingATicket.push(interaction.user.id);

        const ticketTopic = await collectResponse('What is the topic of your ticket? (Images or videos need to be added as a link) (Maximum 100 characters)');

        if (Array.isArray(ticketTopic)) {
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        if (ticketTopic.length > 100) {
            sendDM({
                content: 'We have a max limit of 100 characters in the topic. Please create a new ticket and shorten down your response.',
                components: [ticketRow]
            });
            const index = creatingATicket.indexOf(interaction.user.id);

            console.log(creatingATicket)

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            console.log(creatingATicket)


            return;

        };

        const ticketDescription = await collectResponse('Please reply with a more detailed description of your ticket. (Images or videos need to be added as a link) (Maximum 500 characters)');

        if (Array.isArray(ticketDescription)) {
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        if (ticketDescription.length > 500) {
            sendDM({
                content: 'We have a max limit of 500 characters in the topic. Please create a new ticket and shorten down your response.',
                components: [ticketRow]
            });
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        const additionalComments = await collectResponse('Do you have any additional comments? (Images or videos need to be added as a link) (Maximum 500 characters)');

        if (Array.isArray(additionalComments)) {
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        if (additionalComments.length > 500) {
            sendDM({
                content: 'We have a max limit of 500 characters in the topic. Please create a new ticket and shorten down your response.',
                components: [ticketRow]
            });
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        const languageSelectionPrompt = await collectResponseLang('What language do you want support in? We only support English and Norwegian.');

        const languageSelection = languageSelectionPrompt.toUpperCase();

        if (Array.isArray(languageSelection)) {
            const index = creatingATicket.indexOf(interaction.user.id);

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
                { name: 'Topic', value: ticketTopic },
                { name: 'Description', value: ticketDescription },
                { name: 'Comments', value: additionalComments },
                { name: 'Language', value: languageSelection }
            );

        const confimationResponse = await collectResponseYesNo({ embeds: [confirmationEmbed] });

        if (Array.isArray(confimationResponse)) {
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        if (confimationResponse.toLowerCase() === 'no') {
            sendDM('The ticket creation process has been stopped.')
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        const ticket = new tickets({
            creatorId: interaction.user.id,
            creatorUsername: interaction.user.username,
            topic: ticketTopic,
            description: ticketDescription,
            comments: additionalComments,
            ticketMessageId: '',
            language: languageSelection
        });

        const guild = interaction.client.guilds.cache.get('1089282844657987587');

        if (guild) {
            const member = await guild.members.fetch(interaction.user.id);

            if (member) {
                if (member.roles.cache.has('1304849124528754729')) { // Bot Developer
                    const testTicket = await collectResponseYesNo('Hello bot dev! Is this a test ticket? Yes/No');
        
                    if (Array.isArray(testTicket)) {
                        const index = creatingATicket.indexOf(interaction.user.id);
        
                        if (index !== -1) {
                            creatingATicket.splice(index, 1);
                        };
        
                        return;
                    };
        
                    if (testTicket.toLowerCase() === 'yes') {
                        ticket.department = 'DEV-BOT';
                    };
                };
        
                if (member.roles.cache.has('1294321619149262942')) { // Community Administator
                    const testTicket = await collectResponseYesNo('Hello Community Admin! Is this a training ticket? Yes/No');
        
                    if (Array.isArray(testTicket)) {
                        const index = creatingATicket.indexOf(interaction.user.id);
        
                        if (index !== -1) {
                            creatingATicket.splice(index, 1);
                        };
        
                        return;
                    };
        
                    if (testTicket.toLowerCase() === 'yes') {
                        ticket.department = 'COMMUNITY-TRAINING';
                    };
                };
            };
        };

        const departmentSplit = ticket.department.split('-')

        const category = ticketChannels[departmentSplit[0]]

        const pings = category.pings;

        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket')
            .setDescription('Awaiting to be claimed')
            .addFields(
                { name: 'ID', value: String(ticket._id) },
                { name: 'Topic', value: ticket.topic },
                { name: 'Important note', value: ticket.importantNote },
                { name: 'Creator', value: ticket.creatorUsername },
                { name: 'Department', value: ticket.department },
                { name: 'Language', value: ticket.language }
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
            const index = creatingATicket.indexOf(interaction.user.id);

            if (index !== -1) {
                creatingATicket.splice(index, 1);
            };

            return;
        };

        const index = creatingATicket.indexOf(interaction.user.id);

        if (index !== -1) {
            creatingATicket.splice(index, 1);
        };

    } catch (error) {
        const index = creatingATicket.indexOf(interaction.user.id);

        if (index !== -1) {
            creatingATicket.splice(index, 1);
        };

        if (error.message === "Timeout") return;

        await interaction.user.send({
            content: 'Something failed in the ticket creation system.',
            components: [ticketRow]
        }).catch();

        console.warn(`Ticket creator error: ${error}`);
    };
};

async function closeTicket(id, interaction, client) {
    const ticket = await tickets.findById(id).exec();

    if (!ticket) {
        interaction.reply({
            content: 'This ticket does not exist.',
            flags: MessageFlags.Ephemeral
        });
        return;
    };

    if (ticket.claimedId === '-1') {
        interaction.reply({
            content: 'This ticket is already closed.',
            flags: MessageFlags.Ephemeral
        });
        return;
    };

    const departmentSplit = ticket.department.split('-')

    const category = ticketChannels[departmentSplit[0]]

    const channel = client.channels.cache.get(category.channel);

    const ticketMessage = await channel.messages.fetch(ticket.ticketMessageId);

    ticketMessage.delete();

    const ticketCreator = await client.users.fetch(ticket.creatorId);

    if (!ticketCreator) {
        return interaction.reply({
            content: 'Could not find the user.',
            flags: MessageFlags.Ephemeral
        });
    };

    ticketCreator.send(`The ticket with the id \`${String(ticket._id)}\` was closed by <@${interaction.user.id}>`).catch(e => {
        console.warn(e);
        return interaction.reply({
            content: 'Something went wrong. Contact Emilsen.',
            flags: MessageFlags.Ephemeral
        });
    });

    const claimedUser = await client.users.fetch(ticket.claimedId);

    if (!claimedUser) {
        return interaction.reply({
            content: 'Could not find the user.',
            flags: MessageFlags.Ephemeral
        });
    };

    claimedUser.send(`The ticket with the id \`${String(ticket._id)}\` was closed by <@${interaction.user.id}>`).catch(e => {
        console.warn(e);
        return interaction.reply({
            content: 'Something went wrong. Contact Emilsen.',
            flags: MessageFlags.Ephemeral
        });
    });

    interaction.reply({
        content: 'The ticket was closed.',
        flags: MessageFlags.Ephemeral
    });

    ticket.claimedId = '-1';

    ticket.log.push(`<@${interaction.user.id}> - ${new Date(Date.now()).toUTCString()} closed this ticket.`);

    ticket.save();
};

module.exports = { ticketChannels, closeTicket, createTicket };
