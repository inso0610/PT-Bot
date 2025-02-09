const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Sends a list of moderation logs for a user')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('Who do you want to kick?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const user = interaction.options.getUser('user');

        const logs = await modlogs.find({ discordId: user.id }).exec();

        if (!logs || logs.length === 0) {
            return interaction.reply({ content: 'No moderation logs found for this user.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Moderation logs for ${user.tag}`)

        logs.forEach((log, index) => {
            embed.addField(`Log #${index + 1}`, `**Action:** ${log.action}\n**Reason:** ${log.reason}\n**Moderator:** ${log.moderatorUsername}\n**Date:** ${log.doneAt}`);
        });

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
}