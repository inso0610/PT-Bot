const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reset-all-activity')
    .setDescription('Reset all activity for every manager'),

    run: async ({ interaction, client, handler }) => {
        interaction.reply({
            content: 'Reset started',
            ephemeral: true
        });

        const allActivity = await activity.find();

        const activityChannel = client.channels.cache.get('1302679726795657328');

        const timestamp = Math.floor(Date.now() / 1000);

        activityChannel.send(`**Activity reset <t:${timestamp}:F> by <@${interaction.user.id}>**`)

        for (const [key, value] of Object.entries(allActivity)) {
            const embed = new EmbedBuilder()
                .setTitle('Activity')
                .setDescription(`Activity for <@${value.discordId}>`)
                .addFields(
                    { name: 'Shifts:', value: value.shifts.toString() },
                    { name: 'Trainings:', value: value.trainings.toString().toString() },
                    { name: 'Events:', value: value.events.toString() }
                );
            
            activityChannel.send({
                embeds: [embed]
            });

            value.shifts = 0;
            value.trainings = 0;
            value.events = 0;

            value.save();
        };
    },
    cdOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
}