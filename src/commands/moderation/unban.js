const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const modlogs = require('../../utils/moderation/modlogs');
const timebans = require('../../utils/moderation/timebans');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban someone from the Discord server')
    .setContexts(['Guild'])
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
        option
            .setName('user-id')
            .setDescription('Who do you want to unban?')
            .setRequired(true))
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Why are you unbanning this user?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.options.getString('user-id');
        const reason = interaction.options.getString('reason');

        const moderator = interaction.guild.members.cache.get(interaction.user.id);

        if (!moderator) {
            return interaction.editReply({ content: 'An error occurred while fetching user data.', flags: MessageFlags.Ephemeral });
        }

        // Unban the user
        interaction.guild.members.unban(userId, reason)
        .then(async () => {
            await interaction.editReply({ content: `Successfully unbanned <@${userId}>!`, flags: MessageFlags.Ephemeral });

            // Delete timeban if exists
            const timeban = await timebans.findOne({ discordId: userId });
            if (timeban) {
                await timeban.deleteOne();
            }

            // Log the unban mongoose model
            const unbanLog = new modlogs({
                discordId: userId,
                action: 'unban',
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
            });
            
            await unbanLog.save();
        }).catch((error) => {
            interaction.editReply({ content: 'An error occurred while unbanning the user.', flags: MessageFlags.Ephemeral });
            console.warn(error);
        });
    },
    dirOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}