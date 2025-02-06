const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-trainings')
        .setDescription('Get your trainings')
        .setDMPermission(false),
    
    run: async ({ interaction, client, handler }) => {
        await interaction.reply({
            content: 'Please check your DMs.',
            ephemeral: true
        });

        try {
            const assignedTrainings = await trainings.find({ hostDiscordId: interaction.user.id });
            
            if (!assignedTrainings.length) {
                return interaction.user.send('You have no assigned trainings.').catch(() => {
                    interaction.followUp({ content: 'I was unable to send you a DM.', ephemeral: true });
                });
            }
            
            const embed = new EmbedBuilder()
                .setTitle('Your Trainings')
                .setDescription(assignedTrainings.map(t => `**ID:** ${t._id}
**Type:** ${t.trainingType}
**Date:** ${`<t:${t.timestamp}:F>`}
**Status:** ${t.status}`).join('\n\n'));

            interaction.user.send({ embeds: [embed] }).catch(() => {
                interaction.followUp({ content: 'I was unable to send you a DM.', ephemeral: true });
            });
        } catch (error) {
            console.error(error);
            interaction.followUp({ content: 'An error occurred while fetching your trainings.', ephemeral: true });
        }
    },
    
    opTeamOnly: true,
    
    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
