const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-trainings')
    .setDescription('Get your trainings')
    .setDMPermission(false),
    run: async ({ interaction, client, handler }) => {

        interaction.reply({
            content: 'Please check your dms.',
            ephemeral: true
        });

        const assignedTrainings = trainings.find(hostDiscordId = interaction.user.id)


    },
    opTeamOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: true,
    },
};