const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick\'s a user from the Discord server.')
    .addUserOption((option) => 
        option
            .setName('user')
            .setDescription('Who do you want to kick?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('What is the reason for kicking the user?')
            .setRequired(true)),

    run: async ({ interaction, client }) => {
        const kickUser = interaction.options.getUser('user');
        const kickUserId = kickUser.id;
        const reason = interaction.options.getString('reason');
        
        interaction.reply(kickUserId)
    },

    options: {
        devOnly: false,
        userPermissions: ['Administrator', 'ManageMessages'],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}