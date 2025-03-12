const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const modlogs = require('../../utils/moderation/modlogs');
const timebans = require('../../utils/moderation/timebans');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban someone from the Discord server')
    .setDMPermission(false)
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
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString('user-id');
        const reason = interaction.options.getString('reason');

        const moderator = interaction.guild.members.cache.get(interaction.user.id);

        if (!moderator) {
            return interaction.editReply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }

        // Unban the user
        interaction.guild.members.unban(userId, reason)
        .then(async () => {
            await interaction.editReply({ content: `Successfully unbanned <@${userId}>!`, ephemeral: true });

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
            interaction.editReply({ content: 'An error occurred while unbanning the user.', ephemeral: true });
            console.warn(error);
        });
    },
    gaOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}