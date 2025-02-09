const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warnings = require('../../utils/moderation/warnings');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout someone in the Discord server')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('Who do you want to timeout?')
            .setRequired(true))
    .addNumberOption((option) =>
        option
            .setName('duration')
            .setDescription('How long do you want to timeout this user? (in minutes)')
            .setRequired(true))
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Why are you timeouting this user?')
            .setRequired(true))
    .addBooleanOption((option) =>
        option
            .setName('warn')
            .setDescription('Do you want to log a warning together with the timeout?')
            .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });
        
        const commandUser = interaction.options.getUser('user');
        const duration = interaction.options.getNumber('duration');
        const reason = interaction.options.getString('reason');
        const warn = interaction.options.getBoolean('warn') || false;

        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const user = interaction.guild.members.cache.get(commandUser.id);

        if (!moderator || !user) {
            return interaction.editReply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: 'You can\'t timeout yourself!', ephemeral: true });
        }

        if (user.id === client.user.id) {
            return interaction.editReply({ content: 'You can\'t timeout me!', ephemeral: true });
        }

        if (!user.kickable) {
            return interaction.editReply({ content: 'I can\'t timeout this user!', ephemeral: true });
        }
        
        // Compare the highest roles
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
            return interaction.editReply({ 
                content: 'You can\'t timeout this user because they have a higher or equal role than you!', 
                ephemeral: true 
            });
        }

        // Timout the user
        await user.timeout(duration * 60 * 1000, reason).catch(() => {
            return interaction.editReply({ content: 'I couldn\'t timeout this user!', ephemeral: true });
        });

        const message = await user.send(`You have been given a timeout in the Polar Tracks Discord server for the following reason: ${reason}.${warn ? '\n**⚠️ A warning was also applied.**' : ''}`).catch(() => {
            return false;
        });

        // Log the action
        const timeoutLog = new modlogs({
            discordId: user.id,
            action: 'timeout',
            reason,
            moderatorId: interaction.user.id,
            moderatorUsername: interaction.user.username
        });

        timeoutLog.save();

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
                reason: 'This warning was applied together with a timeout: ' + reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username
            });

            warnLog.save();
        };

        return interaction.editReply({ content: `User <@${user.id}> has been given a timeout. ${message ? '' : 'Failed to message this user.'}`, ephemeral: true });
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