const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Sends a list of all commmands and their function.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('commands')
            .setDescription('Sends a list of all commmands and their function.')),

    run: async ({ interaction, client, handler }) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "commands") {
            const helpEmbed = new EmbedBuilder()
            .setTitle('Commands:')
            .addFields(
                { name: '/help:', value: 'Sends a list of all commmands and their function.' },
                { name: '/ping:', value: 'Gives you the bot\'s ping.' },
                { name: '/suggest:', value: 'Sends a suggestion.' }
            )
            
            interaction.reply({
                embeds: [ helpEmbed ],
                ephemeral: true
            });
        } else {
            interaction.reply({
                content: 'Command failure. Try again.',
                ephemeral: true
            })
        }
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};