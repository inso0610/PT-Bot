const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');

const tickets = require('../../utils/tickets.js');

const { ticketChannels, closeTicket } = require( '../../utils/ticketChannels.js');
const ticketBlacklist = require('../../utils/ticketBlacklist.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Commands for tickets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('reply')
                .setDescription('Reply to a ticket')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true))
                .addStringOption(option => option.setName('message').setDescription('What is the message you want to send?').setRequired(true))
                .addBooleanOption(option => option.setName('close-prompt').setDescription('Do you want to prompt the closure of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('note')
                .setDescription('Add a note to a ticket')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true))
                .addStringOption(option => option.setName('message').setDescription('What is the note you want to add?').setRequired(true))
                .addBooleanOption(option => option.setName('important').setDescription('Do you want to set this as the important note?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('questions')
                .setDescription('Get the questions of a ticket')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unassign')
                .setDescription('Unassigns you and makes the ticket claimable for someone else.')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('transfer')
                .setDescription('Transfer a ticket.')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true))
                .addStringOption(option => 
                    option
                        .setName('new-category')
                        .setDescription('What is the new category?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Community Team (COMMUNITY-ALL)', value: 'COMMUNITY-ALL' },
                            { name: 'Training Tickets (COMMUNITY-TRAINING)', value: 'COMMUNITY-TRAINING' },
                            { name: 'Operations Team (OPS-ALL)', value: 'OPS-ALL' },
                            { name: 'Driver Managers (OPS-DM)', value: 'OPS-DM' },
                            { name: 'Conductor Managers (OPS-CM)', value: 'OPS-CM' },
                            { name: 'Platform Managers (OPS-PM)', value: 'OPS-PM' },
                            { name: 'Signaller Managers (OPS-SM)', value: 'OPS-SM' },
                            { name: 'Marketing Team (MARKETING-ALL)', value: 'MARKETING-ALL' },
                            { name: 'Social Media Team (MARKETING-SOCIAL)', value: 'MARKETING-SOCIAL' },
                            { name: 'Development Team (DEV-ALL)', value: 'DEV-ALL' },
                            { name: 'Audio Recorders (DEV-AR)', value: 'DEV-AR' },
                            { name: 'Game Developers (DEV-DEV)', value: 'DEV-DEV' },
                            { name: 'Bot Developers (DEV-BOT)', value: 'DEV-BOT' },
                            { name: 'Web Developers (DEV-WEB)', value: 'DEV-WEB' },
                            { name: 'Senior Management (SENIOR-ALL)', value: 'SENIOR-ALL' },
                            { name: 'Social Media Admins (SENIOR-SA)', value: 'SENIOR-SA' },
                            { name: 'Operations Managers (SENIOR-OM)', value: 'SENIOR-OM' },
                            { name: 'Railway Advisors (SPECIAL-RA)', value: 'SPECIAL-RA' },
                            { name: 'Directors (DIRECTOR-ALL)', value: 'DIRECTOR-ALL' },
                            { name: 'Marketing Director (DIRECTOR-MD)', value: 'DIRECTOR-MD' },
                            { name: 'Operations Director (DIRECTOR-OD)', value: 'DIRECTOR-OD' },
                            { name: 'Engineering and Technology Director (DIRECTOR-ED)', value: 'DIRECTOR-ED' },
                            { name: 'Advisors Team (ADVISOR-ALL)', value: 'ADVISOR-ALL' },
                            { name: 'Community Administrator (ADVISOR-CA)', value: 'ADVISOR-CA' },
                            { name: 'Group Holder (ADVISOR-GH)', value: 'ADVISOR-GH' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('Get the logs of a ticket')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Sends the information message')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('notes')
                .setDescription('Get the notes of a ticket.')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Closes a ticket.')
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('blacklist')
                .setDescription('Blacklist someone from creating tickets.')
                .addUserOption(option => option.setName('user').setDescription('Who do you want to blacklist from the ticket system?').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('What is the reason for blacklisting this user?').setRequired(true))
                .addIntegerOption(option => option.setName('hours').setDescription("How long should this blacklist last?").setRequired(false)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('blacklist-remove')
                        .setDescription('Remove someones blacklist from creating tickets.')
                        .addUserOption(option => option.setName('user').setDescription('Whos blacklist do you want to remove?').setRequired(true))),
    run: async ({ interaction, client, handler }) => {
        const sendDM = async (messageContent, edit) => {
            if (!edit) {
                return interaction.user.send(messageContent).catch(e => {    
                    interaction.reply({
                        content: "I can't DM you, please check your DM settings!"
                    }).catch(e2 => {
                        console.warn(e2);
                    });
                    console.warn(e);
        
                    return [e]
                });
            } else {
                return interaction.user.send(messageContent).catch(e => {    
                    interaction.editReply({
                        content: "I can't DM you, please check your DM settings!"
                    }).catch(e2 => {
                        console.warn(e2);
                    });
                    console.warn(e);
        
                    return [e]
                });
            };
        };

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "reply") {
            try {
                const ticketIdString = interaction.options.getString('id');
                const replyMessage = interaction.options.getString('message');
                const sendPrompt = interaction.options.getBoolean('close-prompt');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.reply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
    
                if (!ticket) {
                    return interaction.reply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                const ticketCreator = await client.users.fetch(ticket.creatorId);
    
                if (!ticketCreator) {
                    return interaction.reply({
                        content: 'Could not find the ticket creator.',
                        ephemeral: true
                    });
                };
    
                await ticketCreator.send(`Reply from <@${interaction.user.id}> for the ticket with the id \`${String(ticket._id)}\`:\n\`\`\`${replyMessage}\`\`\`\nIf you want to reply to this ticket you can reply to this message or add this to the response: \`[${ticket._id.toString()}]\`.`).catch(e => {
                    console.warn(e);
                    return interaction.reply({
                        content: 'Something went wrong. Contact Emilsen.',
                        ephemeral: true
                    });
                });

                let logMessage= `<@${interaction.user.id}> - ${new Date(Date.now()).toUTCString()}: ${replyMessage}`;
    
                if (sendPrompt) {
                    const promptEmbed = new EmbedBuilder()
                        .setTitle('Close prompt')
                        .setDescription('Do you want to close this ticket?')
                        .setFooter({
                            text: String(ticket._id)
                        });
    
                    const yesButton = new ButtonBuilder()
                        .setCustomId('closeTicket-Yes')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success);
    
                    const noButton = new ButtonBuilder()
                        .setCustomId('closeTicket-No')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger);
    
                    const row = new ActionRowBuilder().addComponents(yesButton, noButton);
    
                    await ticketCreator.send({
                        embeds: [promptEmbed],
                        components: [row]
                    }).catch(e => {
                        console.warn(e);
                        return interaction.reply({
                            content: 'Something went wrong. Contact Emilsen.',
                            ephemeral: true
                        });
                    });

                    logMessage += ' - Together with a closure prompt.';
                };

                ticket.log.push(logMessage);
                
                ticket.save();
    
                const confirmDM = await sendDM(`You replied to <@${ticketCreator.id}> on the ticket with the id \`${String(ticket._id)}\`:\n\`\`\`${replyMessage}\`\`\``, false)
    
                if (Array.isArray(confirmDM)) {
                    return;
                };
    
                interaction.reply({
                    content: 'Reply sent.',
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        } else if (subcommand === "note") {
            try {
                const ticketIdString = interaction.options.getString('id');
                const noteMessage = interaction.options.getString('message');
                const isImportant = interaction.options.getBoolean('important');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.reply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
    
                if (!ticket) {
                    return interaction.reply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                ticket.notes.push(noteMessage);

                let logMessage = `<@${interaction.user.id}> - ${new Date(Date.now()).toUTCString()} added a note: ${noteMessage}`;
    
                if (isImportant) {
                    ticket.importantNote = noteMessage;
    
                    const departmentSplit = ticket.department.split('-')
    
                    const category = ticketChannels[departmentSplit[0]]
    
                    const channel = client.channels.cache.get(category.channel);
    
                    const ticketMessage = await channel.messages.fetch(ticket.ticketMessageId);
    
                    if (!ticketMessage) {
                        interaction.reply({
                            content: 'Could not get the ticket message.',
                            ephemeral: true
                        });
                        return;
                    };
    
                    const ticketEmbed = new EmbedBuilder()
                    .setTitle('🎫 Ticket')
                    .setDescription(`Claimed by: ${interaction.user.username}`)
                    .addFields(
                        {name: 'ID', value: String(ticket._id)},
                        {name: 'Topic', value: ticket.topic},
                        {name: 'Important note', value: ticket.importantNote},
                        {name: 'Creator', value: ticket.creatorUsername},
                        {name: 'Department', value: ticket.department},
                        {name: 'Language', value: ticket.language}
                    );
        
                    ticketMessage.edit({
                        embeds: [ticketEmbed],
                    });

                    logMessage += ' and set it as the important note.';
                };
                
                ticket.log.push(logMessage);

                ticket.save();
    
                interaction.reply({
                    content: 'Succesfully added this note',
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        
        } else if (subcommand === "questions") {
            try {
                const ticketIdString = interaction.options.getString('id');
    
                const ticket = await tickets.findById(ticketIdString).exec();
    
                if (!ticket) {
                    return interaction.reply({
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                const DM = await sendDM({
                    content: `> **🎫 | Questions:**\n\n**What is the topic of your ticket?**\n\`\`\`${ticket.topic}\`\`\`\n**Please reply with a more detailed description of your ticket.**\n\`\`\`${ticket.description}\`\`\`\n**Do you have any additional comments?**\n\`\`\`${ticket.comments}\`\`\``
                }, false);
    
                if (Array.isArray(DM)) {
                    return;
                };
    
                interaction.reply({
                    content: 'The question responses have been sent to you in DMs.',
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
            
        } else if (subcommand === "unassign") {
            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.reply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
    
                if (!ticket) {
                    return interaction.reply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                ticket.claimedUser = '0';
    
                ticket.log.push(`<@${interaction.user.id}> - ${new Date(Date.now()).toUTCString()} unclaimed this ticket.`);
    
                ticket.save();
    
                const departmentSplit = ticket.department.split('-')
    
                const category = ticketChannels[departmentSplit[0]]
    
                const pings = category.pings;
    
                const channel = client.channels.cache.get(category.channel);
    
                const ticketMessage = await channel.messages.fetch(ticket.ticketMessageId);
    
                if (!ticketMessage) {
                    return interaction.reply({
                        content: 'Could not get the ticket message.',
                        ephemeral: true
                    });
                };
    
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
    
                ticketMessage.edit({
                    content: `<@&${pings[departmentSplit[1]]}>`,
                    embeds: [ticketEmbed],
                    components: [row]
                });
    
                const creator = await client.users.fetch(ticket.creatorId);
    
                if (!creator) {
                    return interaction.reply({
                        content: 'Could not find the user.',
                        ephemeral: true
                    });
                };
    
                creator.send(`<@${interaction.user.id}> unclaimed your ticket.`).catch(e => {
                    console.warn(e);
                    return interaction.reply({
                        content: 'The creator could not recieve the unclaim message.',
                        ephemeral: true
                    })
                });
    
                interaction.reply({
                    content: 'You unclaimed the ticket',
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
            
        } else if (subcommand === "transfer") {
            await interaction.deferReply({
                ephemeral: true
            });

            try {
                const ticketIdString = interaction.options.getString('id');
                const newCategory = interaction.options.getString('new-category');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
    
                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                ticket.claimedId = '0';
    
                const oldDepartmentSplit = ticket.department.split('-');
    
                const oldCategory = ticketChannels[oldDepartmentSplit[0]];
    
                const oldChannel = await client.channels.cache.get(oldCategory.channel);
    
                const oldTicketMessage = await oldChannel.messages.fetch(ticket.ticketMessageId);
    
                oldTicketMessage.delete();
    
                const oldDepartment = ticket.department;
    
                ticket.department = newCategory;
    
                const departmentSplit = ticket.department.split('-');
    
                const category = ticketChannels[departmentSplit[0]];
    
                const pings = category.pings;
    
                const channel = await client.channels.cache.get(category.channel);
    
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
    
                const ticketMessage = await channel.send({
                    content: `<@&${pings[departmentSplit[1]]}> Transfered from: ${oldDepartment}`,
                    embeds: [ticketEmbed],
                    components: [row]
                });
    
                ticket.ticketMessageId = ticketMessage.id;
    
                ticket.log.push(`<@${interaction.user.id}> - ${new Date(Date.now()).toUTCString()} transfered this ticket: ${oldDepartment} -> ${newCategory}`);
    
                ticket.save();
    
                const creator = await client.users.fetch(ticket.creatorId);
    
                if (!creator) {
                    return interaction.editReply({
                        content: 'Could not find the user.',
                        ephemeral: true
                    });
                };
    
                creator.send(`<@${interaction.user.id}> unclaimed your ticket and transfered it to another department.`).catch(e => {
                    console.warn(e);
                    return;
                });
                
                interaction.editReply({
                    content: 'The ticket has been transfered',
                    ephemeral: true
                });
            } catch (error) {
                interaction.editReply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        } else if (subcommand === "logs") {
            await interaction.deferReply({ ephemeral: true });

            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                   ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket ID is not valid.',
                        ephemeral: true
                   });
                };

                const guild = interaction.client.guilds.cache.get('1089282844657987587');

                if (!guild) {
                    return interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                };

                const member = await guild.members.fetch(interaction.user.id);

                if (!member) {
                    return interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
                };

                let ticket;
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString);
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                };

                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };

                const logs = ticket.log;
                if (!logs || Object.keys(logs).length === 0) {
                    return interaction.editReply({
                        content: 'No logs found for this ticket.',
                        ephemeral: true
                    });
                };

                let logMessage = `**Logs for ticket \`${String(ticket._id)}\`:**\n\n`;
                const messages = [];

                for (const property in logs) {
                    const logEntry = logs[property] + '\n';

                    if ((logMessage + logEntry).length > 2000) {
                        messages.push(logMessage);
                        logMessage = '';
                    };
                    logMessage += logEntry;
                };

                if (logMessage.length > 0) {
                    messages.push(logMessage);
                }

                for (const msg of messages) {
                    const DM = await sendDM(msg, true);
                    if (Array.isArray(DM)) break;
                }

                interaction.editReply({
                    content: 'The logs have been sent in your DMs.',
                    ephemeral: true
                });
            } catch (error) {
                interaction.editReply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        } else if (subcommand === 'info') {
            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                   ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket ID is not valid.',
                        ephemeral: true
                   });
                };

                const guild = interaction.client.guilds.cache.get('1089282844657987587');

                if (!guild) {
                    return interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                };

                const member = await guild.members.fetch(interaction.user.id);

                if (!member) {
                    return interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
                };

                let ticket;
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString);
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                };

                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                const claimedTicketMessage = new EmbedBuilder()
                .setTitle('Claimed ticket')
                .setDescription(`Ticket id: ${String(ticket._id)}`)
                .addFields(
                    { name: 'ID', value: String(ticket._id) },
                    { name: 'Department', value: ticket.department },
                    { name: 'Topic', value: ticket.topic },
                    { name: 'Created by', value: ticket.creatorUsername },
                    { name: 'Language', value: ticket.language }
                );
    
                const ticketCommands = new EmbedBuilder()
                    .setTitle('Ticket commands')
                    .addFields(
                        { name: `\`/ticket reply id:${String(ticket._id)}\``, value: 'Send a reply to the creator of the ticket. If you want to prompt the person to close the ticket set prompt to true.'},
                        { name: `\`/ticket note id:${String(ticket._id)}\``, value: 'Add a note to the ticket. If you set important to true it will be set as the important note.'},
                        { name: `\`/ticket questions id:${String(ticket._id)}\``, value: 'Sends the questions sent by the ticket creator.'},
                        { name: `\`/ticket unassign id:${String(ticket._id)}\``, value: 'Unassigns you and makes the ticket claimable for someone else.'},
                        { name: `\`/ticket transfer id:${String(ticket._id)}\``, value: 'Transfers the ticket to a new department.'},
                        { name: `\`/ticket logs id:${String(ticket._id)}\``, value: 'Sends the ticket logs.'},
                        { name: `\`/ticket info id:${String(ticket._id)}\``, value: 'Send the ticket information.'},
                        { name: `\`/ticket notes id:${String(ticket._id)}\``, value: 'Sends all ticket notes.'},
                        { name: `\`/ticket close id:${String(ticket._id)}\``, value: 'Closes the ticket.'}
                    );
    
                interaction.user.send({
                    embeds: [claimedTicketMessage, ticketCommands]
                }).catch(e => {
                    interaction.reply({
                        content: `I could not send you the ticket information.`,
                        ephemeral: true
                    });
    
                    console.warn(e);
    
                    return;
                });
    
                interaction.reply({
                    content: 'The ticket information has been sent.',
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        } else if (subcommand === "notes") {
            interaction.deferReply({ ephemeral: true });

            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket ID is not valid.',
                        ephemeral: true
                    });
                }

                const guild = interaction.client.guilds.cache.get('1089282844657987587');

                if (!guild) {
                    return interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                }

                const member = await guild.members.fetch(interaction.user.id);

                if (!member) {
                    return interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
                }

                let ticket;
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString);
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                }

                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                }

                const notes = ticket.notes;
                if (!notes || Object.keys(notes).length === 0) {
                    return interaction.editReply({
                        content: 'No notes found for this ticket.',
                        ephemeral: true
                    });
                }

                let notesMessage = `**Notes for ticket \`${String(ticket._id)}\`:**\n\n`;
                const messages = [];

                for (const property in notes) {
                    const noteEntry = notes[property] + '\n';
        
                if ((notesMessage + noteEntry).length > 2000) {
                        messages.push(notesMessage);
                        notesMessage = '';
                    }
                    notesMessage += noteEntry;
                }

                if (notesMessage.length > 0) {
                    messages.push(notesMessage);
                }

                for (const msg of messages) {
                    const DM = await sendDM(msg, true);
                    if (Array.isArray(DM)) break;
                }
            
                interaction.editReply({
                    content: 'The notes have been sent in your DMs.',
                    ephemeral: true
                });
            } catch (error) {
                interaction.editReply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch(fe => {
                    console.warn(fe);
                });
                console.warn(error);
            }
        } else if (subcommand === 'close') {
            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                   ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket ID is not valid.',
                        ephemeral: true
                   });
                };

                const guild = interaction.client.guilds.cache.get('1089282844657987587');

                if (!guild) {
                    return interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                };

                const member = await guild.members.fetch(interaction.user.id);

                if (!member) {
                    return interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
                };

                let ticket;
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString);
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                };

                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist or you don\'t have access to it with this command.',
                        ephemeral: true
                    });
                };
    
                closeTicket(ticketId, interaction, client)
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            }
        } else if (subcommand === 'blacklist') {
            try {
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason');
                const hours = interaction.options.getInteger('hours');
    
                const blacklisted = await ticketBlacklist.findOne({ discordId: user.id }).exec();
    
                if (blacklisted) {
                    return interaction.reply({
                        content: 'This user is already blacklisted.',
                        ephemeral: true
                    });
                };

                let expiration;
                let permanent = false;

                if (hours) {
                    expiration = new Date(Date.now() + hours * 60 * 60 * 1000);
                } else {
                    permanent = true;
                    expiration = new Date(Date.now());
                }
    
                const newBlacklist = new ticketBlacklist({
                    discordId: user.id,
                    reason: reason,
                    addedBy: interaction.user.id,
                    expiration: expiration,
                    permanent: permanent
                });
    
                await newBlacklist.save();
    
                interaction.reply({
                    content: `User <@${user.id}> has been blacklisted for reason: ${reason}.`,
                    ephemeral: true
                });
    
                if (permanent) {
                    user.send(`You have been blacklisted from the ticket system for the following reason: ${reason}. This is permanent, contact a member of staff if you want to appeal this.`).catch(e => {
                        console.warn(e);
                        interaction.followUp({
                            content: 'User has been blacklisted, but I was unable to send them a DM.',
                            ephemeral: true
                        });
                    });
                } else {
                    user.send(`You have been blacklisted from the ticket system for the following reason: ${reason}. This will expire at <t:${Math.floor(expiration.getTime() / 1000)}:F>. You can contact a member of staff if you want to appeal this.`).catch(e => {
                        console.warn(e);
                        interaction.followUp({
                            content: 'User has been blacklisted, but I was unable to send them a DM.',
                            ephemeral: true
                        });
                    });
                };            
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        } else if (subcommand === 'blacklist-remove') {
            try {
                const user = interaction.options.getUser('user');
    
                const blacklisted = await ticketBlacklist.findOneAndDelete({ discordId: user.id }).exec();
    
                if (!blacklisted) {
                    return interaction.reply({
                        content: `User <@${user.id}> is not blacklisted.`,
                        ephemeral: true
                    });
                };
    
                interaction.reply({
                    content: `User <@${user.id}> has been removed from the blacklist.`,
                    ephemeral: true
                });

                user.send(`You have been removed from the ticket blacklist.`).catch(e => {
                    console.warn(e);
                    interaction.followUp({
                        content: 'User has been removed from the blacklist, but I was unable to send them a DM.',
                        ephemeral: true
                    });
                });
            } catch (error) {
                interaction.reply({
                    content: 'An unexpected error occurred.',
                    ephemeral: true
                }).catch( fe => {
                    console.warn(fe);
                });
                console.warn(error);
            };
        };
    },
    ticketModOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
