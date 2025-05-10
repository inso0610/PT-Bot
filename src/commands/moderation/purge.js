const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, WebhookClient, MessageFlags } = require('discord.js');
const webhookClient = new WebhookClient({ id: '1338191419709591682', token: '_bGgIHOt6m5VFFqhahwKNj8b_9M8fkbMueVEfRWz9fY2GEwAMybKYjuKcEsXkEoJ_YJ0' }); 

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
            if (amount > 1000) return interaction.reply({ content: 'You can only delete up to 1000 messages at once.', flags: MessageFlags.Ephemeral });
            if (amount < 2) return interaction.reply({ content: 'You need to delete at least 2 messages.', flags: MessageFlags.Ephemeral });

            const messages = await channel.messages.fetch({ limit: amount });
            await channel.bulkDelete(messages, true).catch(() => {});

            // Log deletion
            const deletedMessage = new EmbedBuilder()
            .setTitle(`Bulk delete by: ${interaction.user.username}`)
            .setDescription(`Deleted ${amount} messages in <#${channel.id}>`);

            webhookClient.send({
                username: (`${interaction.user.username} (${interaction.user.id})`),
                avatarURL: interaction.user.avatarURL(),
                embeds: [ deletedMessage ]
            }).catch(e => {
                console.warn(`Error in purge: ${e}`)
                return;
            }); 

            return interaction.reply({ content: `Deleted ${amount} messages.`, flags: MessageFlags.Ephemeral });
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