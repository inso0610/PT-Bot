const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const warnings = require('../../utils/moderation/warnings');
const modlogs = require('../../utils/moderation/modlogs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Commands related to warnings.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a warning to a user')
            .addUserOption(option => option.setName('user').setDescription('Who do you want to warn?').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('What is the reason for warning this user?').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Remove a warning from a user')
            .addStringOption(option => option.setName('warning').setDescription("Which warning do you want to remove?").setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List all warnings of a user')
            .addUserOption(option => option.setName('user').setDescription("Whos warnings do you want to list?").setRequired(true))),

    run: async ({ interaction, client, handler }) => {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');

            const moderator = interaction.guild.members.cache.get(interaction.user.id);
            const warnedUser = interaction.guild.members.cache.get(user.id);

            // Compare the highest roles
            if (moderator.roles.highest.comparePositionTo(warnedUser.roles.highest) <= 0) {
                return interaction.editReply({ 
                    content: 'You can\'t warn this user because they have a higher or equal role than you!', 
                    ephemeral: true 
                });
            }

            if (!moderator || !warnedUser) {
                return interaction.editReply({ content: 'An error occurred while fetching user data.', ephemeral: true });
            }

            if (warnedUser.id === interaction.user.id) {
                return interaction.editReply({ content: 'You can\'t warn yourself!', ephemeral: true });
            }

            if (warnedUser.id === client.user.id) {
                return interaction.editReply({ content: 'You can\'t warn me!', ephemeral: true });
            }

            const newWarning = new warnings({
                discordId: user.id,
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username
            });

            await newWarning.save();

            // log the warning
            const newModlog = new modlogs({
                discordId: user.id,
                action: 'warn',
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username
            });

            await newModlog.save();

            interaction.editReply({
                content: `User <@${user.id}> has been warned for reason: ${reason}.`,
                ephemeral: true
            });

            warnedUser.send(`**⚠️You have been warned in the Polar Tracks Discord server.**\nReason: \`${reason}.\``).catch(e => {
                console.warn(e);
                interaction.followUp({
                    content: 'User has been warned, but I was unable to send them a DM.',
                    ephemeral: true
                });
            });
        } else if (subcommand === 'remove') {
            const warning = interaction.options.getString('warning');

            const warningToRemove = await warnings.findByIdAndRemove(warning).exec();
            if (!warningToRemove) {
                return interaction.editReply({ content: 'This warning does not exist.', ephemeral: true });
            }

            interaction.editReply({
                content: `Warning ${warning} has been removed from user <@${warningToRemove.discordId}>.`,
                ephemeral: true
            });
        } else if (subcommand === 'list') {
            const user = interaction.options.getUser('user');

            const userWarnings = await warnings.find({ discordId: user.id }).exec();
            if (!userWarnings.length) {
                return interaction.editReply({ content: 'This user has no warnings.', ephemeral: true });
            };

            const embed = new EmbedBuilder()
                .setTitle(`Warnings for ${user.tag}`)
                .setDescription(userWarnings.map(warning => `**${warning._id.toString()}** - ${warning.reason} (Warned by: ${warning.moderatorUsername})`).join('\n'));

            interaction.editReply({ embeds: [embed], ephemeral: true });
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