const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Sends a message to someone using the PT Bot')
    .setDMPermission(false)
    .addUserOption((option) =>
        option
            .setName('receiver')
            .setDescription('Who should receive this message?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('sender-team')
            .setDescription('What team is sending the message?')
            .setRequired(true)
            .addChoices(
                { name: 'Senior Management', value: 'Senior Management' },
                { name: 'Directors', value: 'Director' },
                { name: 'Group Advisors', value: 'Group Advisor' }
            ))
    .addStringOption((option) => 
        option
            .setName('text')
            .setDescription('What text should the person recieve?')
            .setRequired(true))
    .addBooleanOption((option) => 
        option
            .setName('show-sender')
            .setDescription('Do you want the recieved to know who sent the message?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const reciever = interaction.options.getUser('reciever');
        const team = interaction.options.getString('sender-team');
        const text = interaction.options.getString('text');
        const showSender = interaction.options.getBoolean('show-sender');

        const createTicketButton = new ButtonBuilder()
            .setCustomId('createTicket')
            .setLabel('Create a ticket')
            .setStyle(ButtonStyle.Success);

        const ticketRow = new ActionRowBuilder()
            .addComponents(createTicketButton);

        if (team === 'Director' && !interaction.member.roles.cache.has('1140260309915938866')) {
            interaction.reply({
                content: "You can't send a message as a Director.",
                ephemeral: true
            });
            return;
        } else if (team === 'Group Advisor' && !interaction.member.roles.cache.has('1089284396282032178')) {
            interaction.reply({
                content: "You can't send a message as a Group Advisor.",
                ephemeral: true
            });
            return;
        };

        if (showSender) {
            const teamRoles = {
                ['Senior Management']: 'Senior Manager',
                Director: 'Director',
                ['Group Advisor']: 'Group Advisor',
            }

            const role = teamRoles[team];

            const senderName = interaction.member.nickname ?? interaction.user.username;

            const message = await reciever.send({
                content: `Hello! You have recieved a message from ${role} ${senderName} in Polar Tracks.\n\`\`\`${text}\`\`\`\nIf you want to respond to this message please create a ticket by clicking the button below.`,
                components: [ticketRow]
            }).catch(e => {
                console.warn(e);
                interaction.reply({
                    content: 'I could not message the user.',
                    ephemeral: true
                });
                return false;
            });

            if (message !== false) {
                interaction.reply({
                    content: 'Sent the message.',
                    ephemeral: true
                });
            }
        } else {
            const message = await reciever.send({
                content: `Hello! You have recieved a message from the Polar Tracks ${team} team.\n\`\`\`${text}\`\`\`\nIf you want to respond to this message please create a ticket by clicking the button below.`,
                components: [ticketRow]
            }).catch(e => {
                console.warn(e);
                interaction.reply({
                    content: 'I could not message the user.',
                    ephemeral: true
                });
                return false;
            });

            if (message !== false) {
                interaction.reply({
                    content: 'Sent the message.',
                    ephemeral: true
                });
            }
        };
    },
    smOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};