const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');
const CronJob = require('cron').CronJob;

function nearestDate(dates) {
    if (!dates.length) return [null, 0];
    const data = dates.sort((a, b) => a - b);
    return [data[0], data.length];
}

module.exports = async (client) => {
    const trainingChannel = client.channels.cache.get('1246904420495523925');

    let message;
    message = await trainingChannel.messages.fetch('1310001147574227046').catch(e => console.warn(e));

    if (!message) {
        message = await trainingChannel.send({ content: 'Loading training message...' });
        trainingChannel.send('<@&1304849124528754729> Had to make a new training message!');
    }

    const linkButton = new ButtonBuilder()
        .setLabel('Read the training guides before attending')
        .setURL("https://guides.polartracks.no/start")
        .setStyle(ButtonStyle.Link);

    const calendarButton = new ButtonBuilder()
        .setLabel('View all trainings here')
        .setURL("https://teamup.com/ksopth82jo3q9yrj4i")
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(linkButton, calendarButton);

    let cachedData = {};

    async function updateMessage() {
        let update = true;
        const d = new Date();
        d.setSeconds(0, 0); // nearest full minute
        const dTimestamp = d.getTime();

        const allTrainings = await trainings.find({}).exec();
        const OMChannel = client.channels.cache.get('1246904420495523925');

        for (const training of allTrainings) {
            const difference = training.date.getTime() - dTimestamp;
            const differenceInMinutes = Math.floor(difference / 60000);

            if ((differenceInMinutes <= 0 && differenceInMinutes > -120) && training.status !== 'Server locked') {
                if (training.status !== 'Server unlocked') {
                    const host = await client.users.fetch(training.hostDiscordId).catch(e => console.warn(e));
                    if (host) {
                        host.send(`You missed the training you were hosting. It has been deleted.`).catch(e => console.warn(e));
                    }

                    OMChannel.send(
                        `<@$1089284408042848377> <@&1089284399830409337>\n\n<@${training.hostDiscordId}> missed their training. Start time: <t:${training.timestamp}:R>`
                    ).catch(e => console.warn(e));

                    await training.deleteOne();
                    continue; // don't stop, check others too
                }

                training.status = 'Server locked';
                await training.save();
            } else if (differenceInMinutes <= -120) {
                await training.deleteOne();
            }
        }

        // Compare with cache
        allTrainings.forEach(training => {
            const cachedTraining = cachedData[training._id];
            if (!cachedTraining) {
                update = true;
                cachedData[training._id] = training;
            } else if (
                cachedTraining.timestamp !== training.timestamp ||
                training.hostRobloxUsername !== cachedTraining.hostRobloxUsername ||
                training.additionalInfo !== cachedTraining.additionalInfo ||
                training.status !== cachedTraining.status
            ) {
                update = true;
                cachedData[training._id] = training;
            }
        });

        // Handle deletions
        Object.values(cachedData).forEach(training => {
            const stillExists = allTrainings.find(t => t._id.equals(training._id));
            if (!stillExists) {
                update = true;
                delete cachedData[training._id];
            }
        });

        if (!update) return;

        // Helper to format messages
        function formatNextMessage(session) {
            return `**Next: <t:${session.timestamp}:F> (<t:${session.timestamp}:R>).** Hosted by: ${session.hostRobloxUsername}.${session.status === 'Scheduled' && session.additionalInfo !== 'No additional information.' ? `\n> 🗒️ Note: ${session.additionalInfo}` : ''}${session.status === 'Server unlocked' ? '\n > 🟢 Training server is unlocked.' : ''}${session.status === 'Server locked' ? '\n > ⏲️ Training has started, the server is locked.' : ''}`;
        }

        // Generalized function for one training type
        async function getNextTrainingBlock(type) {
            const typeTrainings = await trainings.find({ trainingType: type });
            const times = typeTrainings.map(t => t.timestamp);

            const [nextStamp, count] = nearestDate(times);
            if (count === 0) {
                return {
                    name: `${type} Trainings (0 scheduled):`,
                    value: `No ${type} trainings scheduled.`
                };
            }

            const nextTraining = await trainings.findOne({ trainingType: type, timestamp: nextStamp }).exec();
            return {
                name: `${type} Trainings (${count} scheduled):`,
                value: formatNextMessage(nextTraining)
            };
        }

        // Build fields dynamically
        const fields = [];
        for (const type of ["Driver", "Conductor", "Dispatcher", "Signaller"]) {
            fields.push(await getNextTrainingBlock(type));
        }

        // Message
        const messageEmbed = new EmbedBuilder()
            .setTitle('Trainings')
            .setDescription(`**Information about the next trainings will be sent here.**`)
            .addFields(fields)
            .setFooter({ text: 'This message updates when changes are registered. Last update' })
            .setTimestamp();

        message.edit({
            content: '',
            embeds: [messageEmbed],
            components: [row]
        });
    }

    // run every minute
    new CronJob('0 * * * * *', updateMessage, null, true, 'Europe/Oslo', null, false);
};
