const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');

const tickets = require('../../utils/tickets.js');

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
                .addBooleanOption(option => option.setName('prompt').setDescription('Do you want to prompt the closure of the ticket?').setRequired(true))),
    run: async ({ interaction, client, handler }) => {
        const sendDM = async (messageContent) => {
            //return message.author.dmChannel.send({ content: messageContent }).catch(e => {
            return interaction.user.send(messageContent).catch(e => {    
                interaction.reply({
                    content: "I can't DM you, please check your DM settings!"
                }).catch(e2 => {
                    console.warn(e2);
                });
                console.warn(e);
    
                return [e]
            });
        };

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "reply") {
            const ticketIdString = interaction.options.getString('id');
            const replyMessage = interaction.options.getString('message');
            const sendPrompt = interaction.options.getBoolean('prompt');

            let ticketId;
            if (Types.ObjectId.isValid(ticketIdString)) {
                ticketId = new Types.ObjectId(ticketIdString);
            } else {
                return interaction.reply({
                    content: 'This ticket id is not valid.',
                    ephemeral: true
                });
            }

            const ticket = await tickets.findOne({ claimedId: interaction.user.id, _id: ticketId }).exec();

            if (!ticket) {
                return interaction.reply({
                    content: 'This ticket does not exist.',
                    ephemeral: true
                });
            };

            const ticketCreator = await client.users.fetch(ticket.creatorId);

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
                ticket.log.push(`<@${interaction.user.id}> sent a closure prompt was also sent.`);;
            };

            const confirmDM = await sendDM(`You replied to <@${ticketCreator.id}> on the ticket with the id \`${String(ticket._id)}\`:\n\`\`\`${replyMessage}\`\`\``)

            if (Array.isArray(confirmDM)) {
                return;
            };

            interaction.reply({
                content: 'Reply sent.',
                ephemeral: true
            });
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
