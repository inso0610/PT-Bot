const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-my-activity')
    .setDescription('Get your activity'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const managerActivity = await activity.findOne( {discordId: interaction.user.id} ).exec()

        if (managerActivity) {
            const activityEmbed = new EmbedBuilder()
                .setTitle('Activity')
                .addFields(
                    { name: 'Shifts:', value: managerActivity.shifts.toString() },
                    { name: 'Trainings:', value: managerActivity.trainings.toString().toString() },
                    { name: 'Events:', value: managerActivity.events.toString() }
                );  

                interaction.editReply({
                    content: 'Got activity.',
                    embeds: [activityEmbed],
                    ephemeral: true
                });
        } else {
            interaction.editReply({
                content: 'You are not in the activity system',
                ephemeral: true
            });
        };

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