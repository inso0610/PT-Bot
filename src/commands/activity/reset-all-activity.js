const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');
const activityRequirements = require('../../utils/activityRequirement.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reset-all-activity')
    .setDescription('Reset all activity for every manager')
    .setDMPermission(false),

    run: async ({ interaction, client, handler }) => {
        interaction.reply({
            content: 'Reset started',
            ephemeral: true
        });

        const guild = client.guilds.cache.get('1089282844657987587');

        const allActivity = await activity.find().exec();

        const activityChannel = client.channels.cache.get('1302679726795657328');

        const timestamp = Math.floor(Date.now() / 1000);

        activityChannel.send(`**Activity reset <t:${timestamp}:F> by <@${interaction.user.id}>**`)

        for (const [key, value] of Object.entries(allActivity)) {
            if (!guild) {
                interaction.reply({
                    content: 'Could not fetch guild.',
                    ephemeral: true
                });
                return true;
            }
            
            const member = await guild.members.fetch(value.discordId);
    
            if (!member) {
                interaction.reply({
                    content: 'Could not fetch member.',
                    ephemeral: true
                });
    
                return true;
            };

            let activityRequirement = {
                shifts: 0,
                trainings: 0,
                events: 0
            };

            let pings
    
            if (member.roles.cache.has('1089284413684199474') || member.roles.cache.has('1089284414976049272') || member.roles.cache.has('1089284411763204197') || member.roles.cache.has('1089284410332942366')) {
                activityRequirement = activityRequirements['DM-SM'];

                pings = '<@&1089284408042848377> <@&1089284399830409337>';
            } else if (member.roles.cache.has('1089284409250824264')) {
                activityRequirement = activityRequirements.EM;

                pings = '<@&1294321619149262942>';
            };
    
            const missingActivity = {
                shifts: activityRequirement.shifts - value.shifts,
                trainings: activityRequirement.trainings - value.trainings,
                events: activityRequirement.events - value.events
            };

            const embed = new EmbedBuilder()
                .setTitle('Activity')
                .setDescription(`Activity for <@${value.discordId}>`)
                .addFields(
                    { name: 'Shifts:', value: value.shifts.toString() },
                    { name: 'Trainings:', value: value.trainings.toString().toString() },
                    { name: 'Events:', value: value.events.toString() }
                );

            if (missingActivity.shifts > 0 || missingActivity.trainings > 0 || missingActivity.events > 0) {
                activityChannel.send({
                    content: `${pings} activity not completed! This does not include reduced quota because of LOA.`,
                    embeds: [embed]
                });
            } else {
                activityChannel.send({
                    embeds: [embed]
                });
            };

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