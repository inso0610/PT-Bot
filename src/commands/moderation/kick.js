const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warnings = require('../../utils/moderation/warnings');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick someone from the Discord server')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('Who do you want to kick?')
            .setRequired(true))
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Why are you kicking this user?')
            .setRequired(true))
    .addBooleanOption((option) =>
        option
            .setName('warn')
            .setDescription('Do you want to log a warning together with the kick?')
            .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });

        const commandUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const warn = interaction.options.getBoolean('warn') || false;

        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const user = interaction.guild.members.cache.get(commandUser.id);

        if (!moderator || !user) {
            return interaction.editReply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: 'You can\'t kick yourself!', ephemeral: true });
        }

        if (user.id === client.user.id) {
            return interaction.editReply({ content: 'You can\'t kick me!', ephemeral: true });
        }

        if (!user.kickable) {
            return interaction.editReply({ content: 'I can\'t kick this user!', ephemeral: true });
        }
        
        // Compare the highest roles
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
            return interaction.editReply({ 
                content: 'You can\'t kick this user because they have a higher or equal role than you!', 
                ephemeral: true 
            });
        }

        // Message the user
        const message = await user.send(`**⚠️You have been kicked from the Polar Tracks Discord server.\nReason: ${reason}.\nYou can rejoin the server here: https://discord.gg/m7gxUKm2z6.${warn ? '\n**A warning was also applied.**' : ''}`).catch(() => {
            return false;
        });

        // Kick the user
        await user.kick(reason).catch(() => {
            return interaction.editReply({ content: 'I couldn\'t kick this user!', ephemeral: true });
        });

        // Log the action
        const kickLog = new modlogs({
            discordId: user.id,
            action: 'kick',
            reason,
            moderatorId: interaction.user.id,
            moderatorUsername: interaction.user.username
        });

        kickLog.save();

        // Warn the user

        if (warn) {
            const warning = new warnings({
                discordId: user.id,
                reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username
            });

            warning.save();

            const warnLog = new modlogs({
                discordId: user.id,
                action: 'warn',
                reason: 'This warning was applied together with a kick: ' + reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username
            });

            warnLog.save();
        };

        return interaction.editReply({ content: `User <@${user.id}> has been kicked. ${message ? '' : 'Failed to message this user.'}`, ephemeral: true });
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