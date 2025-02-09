const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const modlogs = require('../../utils/moderation/modlogs');
const timebans = require('../../utils/moderation/timebans');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban someone in the Discord server')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('Who do you want to ban?')
            .setRequired(true))
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Why are you banning this user?')
            .setRequired(true))
    .addBooleanOption((option) =>
        option
            .setName('delete-messages')
            .setDescription('Do you want to delete the user\'s messages?')
            .setRequired(false))
    .addNumberOption((option) =>
        option
            .setName('duration')
            .setDescription('How long do you want to ban this user? (in days)')
            .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({ ephemeral: true });
        
        const commandUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const deleteMessages = interaction.options.getBoolean('delete-messages') || false;
        const duration = interaction.options.getNumber('duration');

        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const user = interaction.guild.members.cache.get(commandUser.id);

        if (!moderator || !user) {
            return interaction.editReply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: 'You can\'t ban yourself!', ephemeral: true });
        }

        if (user.id === client.user.id) {
            return interaction.editReply({ content: 'You can\'t ban me!', ephemeral: true });
        }

        if (!user.bannable) {
            return interaction.editReply({ content: 'I can\'t ban this user!', ephemeral: true });
        }

        // Compare the highest roles
        if (moderator.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
            return interaction.editReply({ 
                content: 'You can\'t ban this user because they have a higher or equal role than you!', 
                ephemeral: true 
            });
        }

        let expiration;

        if (duration) {
            expiration = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        };

        // Message the user
        const message = await user.send(`You have been banned from the Polar Tracks Discord server for the following reason: ${reason}.\n${duration ? `This ban will last until <t:${Math.floor(expiration.getTime() / 1000)}:F>.` : 'This ban is permanent.'}\nYou can appeal the ban here: https://appeals.polartracks.no/`).catch(() => {
            return false;
        });

        // Ban the user
        if (deleteMessages) {
            await user.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: reason }).catch(() => {
                interaction.editReply({ content: 'I couldn\'t ban this user! You can ban manually.', ephemeral: true });
            });
        } else {
            await user.ban({ reason: reason }).catch(() => {
                interaction.editReply({ content: 'I couldn\'t ban this user! You can ban manually.', ephemeral: true });
            });
        };

        // Log the action
        const banLog = new modlogs({
            discordId: user.id,
            action: `ban${duration ? ` (temp, ${duration} days)` : ''}`,
            reason,
            moderatorId: interaction.user.id,
            moderatorUsername: interaction.user.username
        });

        banLog.save();

        if (duration) {
            const timeBan = new timebans({
                discordId: user.id,
                modlogId: banLog._id.toString(),
                expiration
            });

            await timeBan.save();
        };

        interaction.editReply({
            content: `User <@${user.id}> has been banned for reason: ${reason}. ${message ? '' : 'Failed to message this user.'}`,
            ephemeral: true
        });
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