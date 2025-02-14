const { SlashCommandBuilder, WebhookClient } = require('discord.js');
const countingBlacklist = require('../../utils/countingBlacklist.js');
const webhookClient = new WebhookClient({ id: '1338191419709591682', token: '_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0' });

module.exports = {
    data: new SlashCommandBuilder()
    .setName('counting-blacklist')
    .setDescription('Commands related to the counting blacklist')
    .setDMPermission(false)
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a user to the counting blacklist')
            .addUserOption(option => option.setName('user').setDescription('Who do you want to blacklist?').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('What is the reason for blacklisting this user?').setRequired(true))
            .addIntegerOption(option => option.setName('hours').setDescription("How long should this blacklist last?").setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove a user from the counting blacklist')
            .addUserOption(option => option.setName('user').setDescription("Whos blacklist do you want to remove?").setRequired(true))),

    run: async ({ interaction, client, handler }) => {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const hours = interaction.options.getInteger('hours');

            let expiration;
            let permanent = false;

            if (hours) {
                expiration = new Date(Date.now() + hours * 60 * 60 * 1000);
            } else {
                permanent = true;
                expiration = new Date(Date.now());
            }

            const newBlacklist = new countingBlacklist({
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
                user.send(`You have been blacklisted from the counting channel for the following reason: ${reason}. This is permanent, you can create a ticket to appeal it.`).catch(e => {
                    console.warn(e);
                    interaction.followUp({
                        content: 'User has been blacklisted, but I was unable to send them a DM.',
                        ephemeral: true
                    });
                });
            } else {
                user.send(`You have been blacklisted from the counting channel for the following reason: ${reason}. This will expire at <t:${Math.floor(expiration.getTime() / 1000)}:F>. You can appeal this blacklist by creating a ticket.`).catch(e => {
                    console.warn(e);
                    interaction.followUp({
                        content: 'User has been blacklisted, but I was unable to send them a DM.',
                        ephemeral: true
                    });
                });
            };
        } else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user');

            const blacklisted = await countingBlacklist.findOneAndDelete({ discordId: user.id }).exec();

            if (!blacklisted) {
                interaction.reply({
                    content: `User <@${user.id}> is not blacklisted.`,
                    ephemeral: true
                });
                return;
            };

            interaction.reply({
                content: `User <@${user.id}> has been removed from the blacklist.`,
                ephemeral: true
            });

            user.send(`You have been removed from the counting blacklist.`).catch(e => {
                console.warn(e);
                interaction.followUp({
                    content: 'User has been removed from the blacklist, but I was unable to send them a DM.',
                    ephemeral: true
                });
            });
        }
    },
    communityOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};