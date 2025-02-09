const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
        const user = interaction.options.getUser('user');
        const logs = await modlogs.find({ discordId: user.id }).exec();

        if (!logs.length) {
            return interaction.reply({ content: 'No moderation logs found for this user.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Moderation Logs for ${user.tag}`)
            .setDescription(logs.map((log, index) => `**Log ${toString(log._id)}**\n**Action:** ${log.action}\n**Reason:** ${log.reason}\n**Moderator:** ${log.moderatorUsername}\n**Date:** ${log.doneAt}`).join('\n\n'));

        interaction.reply({ embeds: [embed], ephemeral: true });
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
