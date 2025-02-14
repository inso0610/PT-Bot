const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warnings = require('../../utils/moderation/warnings');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Commands related to deleting multiple messages at once.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
        subcommand
            .setName('any')
            .setDescription('Deletes all types of messages.')
            .addIntegerOption(option =>
                option
                    .setName('amount')
                    .setDescription('The amount of messages to delete. (limit 1000)')
                    .setRequired(true))),

    run: async ({ interaction, client, handler }) => {
        const amount = interaction.options.getInteger('amount');
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.channel;

        if (subcommand === 'any') {
            if (amount > 1000) return interaction.reply({ content: 'You can only delete up to 1000 messages at once.', ephemeral: true });
            if (amount < 1) return interaction.reply({ content: 'You need to delete at least 1 message.', ephemeral: true });

            const messages = await channel.messages.fetch({ limit: amount });
            await channel.bulkDelete(messages, true).catch(() => {});
            return interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
        }
    },
    modOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}