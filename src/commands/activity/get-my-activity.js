const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');
const activityRequirements = require('../../utils/activityRequirement.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('get-my-activity')
    .setDescription('Get your activity'),

    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply({
            ephemeral: true
        });

        const managerActivity = await activity.findOne( {discordId: interaction.user.id} ).exec();

        let activityRequirement = {
            shifts: 0,
            trainings: 0,
            events: 0
        };

        if (interaction.member.roles.cache.has('1089284413684199474') || interaction.member.roles.cache.has('1089284414976049272') || interaction.member.roles.cache.has('1089284411763204197') || interaction.member.roles.cache.has('1089284410332942366')) {
            activityRequirement = activityRequirements['DM-SM'];
        } else if (interaction.member.roles.cache.has('1089284409250824264')) {
            activityRequirement = activityRequirements.EM;
        };

        const missingActivity = {
            shifts: activityRequirement.shifts - managerActivity.shifts,
            trainings: activityRequirement.trainings - managerActivity.trainings,
            events: activityRequirement.events - managerActivity.events
        };

        let activityMessage = '';
        
        if ((activityRequirement.shifts === 0 && activityRequirement.trainings === 0 && activityRequirement.events === 0)) {
            activityMessage = 'You don\'t have an activity requirement'
        } else if (missingActivity.shifts <= 0 && missingActivity.trainings <= 0 && missingActivity.events <= 0) {
            activityMessage = 'You have completed your activity requirement 🎉';
        };

        if (missingActivity.shifts > 0) {
            activityMessage += `You are missing ${missingActivity.shifts} shift(s)`;
        };

        if (missingActivity.trainings > 0) {
            if (activityMessage === '') {
                activityMessage += `You are missing ${missingActivity.trainings} shift(s)`;
            } else {
                activityMessage += ` and ${missingActivity.trainings} training(s)`;
            };
        };

        if (missingActivity.events > 0) {
            if (activityMessage === '') {
                activityMessage += `You are missing ${missingActivity.events} event(s)`;
            } else {
                activityMessage += ` and ${missingActivity.events} event(s)`;
            };
        };

        if (managerActivity) {
            const activityEmbed = new EmbedBuilder()
                .setTitle('Activity')
                .setDescription(activityMessage)
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