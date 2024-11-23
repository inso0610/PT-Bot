const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');

const tickets = require('../../utils/tickets.js');

const { ticketChannels, allowedTransfers, closeTicket } = require( '../../utils/ticketChannels.js');

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
                .addStringOption(option => option.setName('new-category').setDescription('What is the new category?').setRequired(true)))
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
                .addStringOption(option => option.setName('id').setDescription('What is the ID of the ticket?').setRequired(true))),
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
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                const ticketCreator = await client.users.fetch(ticket.creatorId);
    
                if (!ticketCreator) {
                    return interaction.reply({
                        content: 'Could not find the user.',
                        ephemeral: true
                    });
                };
    
                await ticketCreator.send(`Reply from <@${interaction.user.id}> for the ticket with the id \`${String(ticket._id)}\`:\n\`\`\`${replyMessage}\`\`\``).catch(e => {
                    console.warn(e);
                    return interaction.reply({
                        content: 'Something went wrong. Contact Emilsen.',
                        ephemeral: true
                    });
                });
    
                ticket.log.push(`<@${interaction.user.id}>: ${replyMessage}`);
    
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
                    ticket.log.push(`<@${interaction.user.id}> sent a closure prompt.`);;
                };
                
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
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                ticket.notes.push(noteMessage);
    
                ticket.log.push(`<@${interaction.user.id}> added a note: ${noteMessage}`);
    
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
    
                    ticket.log.push(`<@${interaction.user.id}> set the important note: ${noteMessage}`);
                };
    
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
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                ticket.claimedUser = '0';
    
                ticket.log.push(`<@${interaction.user.id}> unclaimed this ticket.`);
    
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
    
                if (!allowedTransfers.includes(newCategory)) {
                    return interaction.editReply({
                        content: 'The new category is not valid.',
                        ephemeral: true
                    });
                };
    
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
                        content: 'This ticket does not exist.',
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
                    content: `<@&${pings[departmentSplit[1]]} Transfered from: ${oldDepartment}>`,
                    embeds: [ticketEmbed],
                    components: [row]
                });
    
                ticket.ticketMessageId = ticketMessage.id;
    
                ticket.log.push(`<@${interaction.user.id}> transfered this ticket: ${oldDepartment} -> ${newCategory}`);
    
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
            interaction.deferReply({
                ephemeral: true
            });

            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const guild = interaction.client.guilds.cache.get('1089282844657987587');
    
                if (!guild) {
                    interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                    return;
                };
    
                const member = await guild.members.fetch(interaction.user.id);
    
                if (!member) {
                    interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
    
                    return;
                };
    
                let ticket;
    
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString)
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                };
    
                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                const DM1 = await sendDM(`**Logs for ticket \`${String(ticket._id)}\`:**`, true);
    
                if (Array.isArray(DM1)) {
                    return;
                };
    
                const logs = ticket.log;
    
                for (const property in logs) {
                    const DM2 = await sendDM(logs[property], true);
    
                    if (Array.isArray(DM2)) {
                        break;
                    };
                };
    
                interaction.editReply({
                    content: 'The logs have been sent in your DMs',
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
                    return interaction.reply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
    
                if (!ticket) {
                    return interaction.reply({
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                const claimedTicketMessage = new EmbedBuilder()
                .setTitle('Claimed ticket')
                .setDescription(`Ticket id: ${String(ticket._id)}`)
                .addFields(
                    { name: 'Department', value: ticket.department },
                    { name: 'Topic', value: ticket.topic },
                    { name: 'Created by', value: ticket.creatorUsername }
                );
    
                const ticketCommands = new EmbedBuilder()
                    .setTitle('Ticket commands')
                    .addFields(
                        { name: `\`/ticket reply ${String(ticket._id)} (message) (prompt)\``, value: 'Send a reply to the creator of the ticket. If you want to prompt the person to close the ticket set prompt to true.'},
                        { name: `\`/ticket note ${String(ticket._id)} (message) (important)\``, value: 'Add a note to the ticket. If you set important to true it will be set as the important note.'},
                        { name: `\`/ticket questions ${String(ticket._id)}\``, value: 'Sends the questions sent by the ticket creator.'},
                        { name: `\`/ticket unassign ${String(ticket._id)}\``, value: 'Unassigns you and makes the ticket claimable for someone else.'},
                        { name: `\`/ticket transfer ${String(ticket._id)} (new category)\``, value: 'Transfers the ticket to a new department.'},
                        { name: `\`/ticket logs ${String(ticket._id)}\``, value: 'Sends the ticket logs.'},
                        { name: `\`/ticket info ${String(ticket._id)}\``, value: 'Send the ticket information.'},
                        { name: `\`/ticket notes ${String(ticket._id)}\``, value: 'Sends all ticket notes.'},
                        { name: `\`/ticket close ${String(ticket._id)}\``, value: 'Closes the ticket.'}
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
            interaction.deferReply({
                ephemeral: true
            });

            try {
                const ticketIdString = interaction.options.getString('id');
    
                let ticketId;
                if (Types.ObjectId.isValid(ticketIdString)) {
                    ticketId = new Types.ObjectId(ticketIdString);
                } else {
                    return interaction.editReply({
                        content: 'This ticket id is not valid.',
                        ephemeral: true
                    });
                };
    
                const guild = interaction.client.guilds.cache.get('1089282844657987587');
    
                if (!guild) {
                    interaction.editReply({
                        content: 'Could not fetch guild.',
                        ephemeral: true
                    });
                    return;
                };
    
                const member = await guild.members.fetch(interaction.user.id);
    
                if (!member) {
                    interaction.editReply({
                        content: 'Could not fetch member.',
                        ephemeral: true
                    });
    
                    return;
                };
    
                let ticket;
    
                if (member.roles.cache.has('1089284396282032178')) {
                    ticket = await tickets.findById(ticketIdString)
                } else {
                    ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();
                };
    
                if (!ticket) {
                    return interaction.editReply({
                        content: 'This ticket does not exist.',
                        ephemeral: true
                    });
                };
    
                const DM1 = await sendDM(`**Notes for ticket \`${String(ticket._id)}\`:**`, true);
    
                if (Array.isArray(DM1)) {
                    return;
                };
    
                const notes = ticket.notes;
    
                for (const property in notes) {
                    const DM2 = await sendDM(notes[property], true);
    
                    if (Array.isArray(DM2)) {
                        break;
                    };
                };
    
                interaction.editReply({
                    content: 'The notes have been sent in your DMs',
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
        } else if (subcommand === 'close') {
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
                        content: 'This ticket does not exist.',
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
