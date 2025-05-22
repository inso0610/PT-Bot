const { EmbedBuilder } = require('discord.js');
const activity = require('../../utils/activity.js');
const activityRequirements = require('../../utils/activityRequirement.js');
const storedDates = require('../../utils/storedDates.js');

module.exports = (client) => {
    const guild = client.guilds.cache.get('1089282844657987587');

    const activityChannel = client.channels.cache.get('1302679726795657328');

    async function resetAllActivity() {
        const resetDate = Date.now();

        const dateFromNew = new Date(resetDate);

        let lastReset = await storedDates.findOne({ type: 'Last Reset' }).exec();

        if (!lastReset) {
            lastReset = new storedDates({
                type: 'Last Reset',
                date: resetDate
            });
        } else if (lastReset.date.getMonth() === dateFromNew.getMonth()) {
            return;
        };

        lastReset.date = resetDate;

        lastReset.save();

        const allActivity = await activity.find().exec();

        const timestamp = Math.floor(resetDate / 1000);

        activityChannel.send(`**Activity reset <t:${timestamp}:F> automatically.**`)

        console.log('Will reset')

        for (const [key, value] of Object.entries(allActivity)) {
            if (!guild) {
                return;
            }
            
            const member = await guild.members.fetch(value.discordId);
    
            if (!member) {   
                return;
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

                pings = '<@&1375113831025479710>';
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
                    { name: 'Trainings:', value: value.trainings.toString() },
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
    };

    setInterval(resetAllActivity, 60_000)
};
