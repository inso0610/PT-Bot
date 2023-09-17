const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Sends a list of all commmands and their function.'),

    run: async ({ interaction, client }) => {
        const helpEmbed = new EmbedBuilder()
            .setTitle('Commands:')
            .addFields(
                { name: '/help:', value: 'Sends a list of all commmands and their function.' },
                { name: '/ping:', value: 'Gives you the bot\'s ping.' },
                { name: '/help:', value: 'Sends a training announcement to training announcements. (Operations M team only.)' }
            )
            
            interaction.reply({
                embeds: [ helpEmbed ],
                ephemeral: true
            })
    }
}