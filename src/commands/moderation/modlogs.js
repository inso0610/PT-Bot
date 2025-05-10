const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlogs')
        .setDescription('Sends a list of moderation logs for a user')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addUserOption(option =>
            option.setName('user').setDescription("Whose logs do you want to list?").setRequired(true)
        ),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser('user');
        const logs = await modlogs.find({ discordId: user.id }).exec();

        if (!logs.length) {
            return interaction.editReply({ content: 'No moderation logs found for this user.', flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Moderation Logs for ${user.tag}`)
            .setDescription(logs.map((log, index) => `**Log ${log._id.toString()}**\n**Action:** ${log.action}\n**Reason:** ${log.reason}\n**Moderator:** ${log.moderatorUsername}\n**Date:** ${log.doneAt}`).join('\n\n'));

        interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
    modOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
