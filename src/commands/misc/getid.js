const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('getid')
    .setDescription('Gives you your Discord User id.'),

    run: async ({ interaction, client, handler }) => {
        interaction.reply({
            content: `User id: ${interaction.user.id}`,
            ephemeral: true
        });
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}