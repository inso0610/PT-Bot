const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

function nearestDate(dates) {
    const data = dates.sort((a, b) => a - b);

    return data;
};

/* function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
};*/

module.exports = async (client) => {
    const trainingChannel = client.channels.cache.get('1246904420495523925');

    let message;

    message = await trainingChannel.messages.fetch('1310001147574227046').catch( e => {  // Replace with your actual message ID
        console.warn(e);
    });

    if (!message) {
        message = await trainingChannel.send({
            content: 'Loading training message...'
        });
        trainingChannel.send('<@&1304849124528754729> Had to make a new training message!');
    };

    const linkButton = new ButtonBuilder()
	    .setLabel('Read the training guides before attending')
        .setURL("https://guides.polartracks.no/start")
	    .setStyle(ButtonStyle.Link);

    const calendarButton = new ButtonBuilder()
        .setLabel('View all trainings here')
        .setURL("https://teamup.com/ksopth82jo3q9yrj4i")
	    .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
	    .addComponents(linkButton, calendarButton);

    async function updateMessage() {
        const d = new Date();

        const nearestFullMinute = Math.ceil(d.getTime() / 60000) * 60000;

        const allTrainings = await trainings.find({}).exec();

        const OMChannel = client.channels.cache.get('1246904420495523925');

        for (const training of allTrainings) {
            const difference = training.date.getTime() - nearestFullMinute; // Positive if training date is in the future, negative if it's in the past
            const differenceInMinutes = Math.floor(difference / 60000);

            if ((differenceInMinutes <= 0 && differenceInMinutes > -120) && training.status !== 'Server locked') {
                if (training.status !== 'Server unlocked') {
                    const host = await client.users.fetch(training.hostDiscordId).catch(e => {
                        console.warn(e);
                    });
                    if (host) {
                        host.send(`You missed the training you were hosting. It has been deleted.`).catch(e => {
                            console.warn(e);
                        });
                    };

                    OMChannel.send(`<@$1089284408042848377> <@&1089284399830409337>\n\n<@${training.hostDiscordId}> missed their training. Start time: <t:${training.timestamp}:R>`).catch(e => {
                        console.warn(e);
                    });

                    training.deleteOne();
                }

                training.status = 'Server locked';
                training.save();
            } else if (differenceInMinutes <= -120) {
                training.deleteOne();
            };
        };

        function formatNextMessage(session) {
            return `Next: <t:${session.timestamp}:F> (<t:${session.timestamp}:R>). Hosted by: ${session.hostRobloxUsername}. \nAdditional Info: ${session.additionalInfo}${session.status == 'Server unlocked' ? '\n >**🟢 Training server is unlocked.' : ''}${session.status == 'Server locked' ? '\n >**⏲️ Training has started, the server is locked.' : ''}`;
        };

        const driverTrainings = await trainings.find({ 
            trainingType: 'Driver'
        });

        const driverTimes = [];
        
        for (const [key, value] of Object.entries(driverTrainings)) {
            driverTimes.push(value.timestamp);
        };

        const nextDriverTrainingData = nearestDate(driverTimes);
        const nextDriverTrainingIndex = nextDriverTrainingData[0];
        const scheduledDriverTrainings = nextDriverTrainingData[1];
        
        let nextDriverTraining = {};
        let nextDriverTrainingText = 'No Driver trainings scheduled.';

        if (nextDriverTrainingIndex != -1) {
            nextDriverTraining = await trainings.findOne({ 
                trainingType: 'Driver',
                timestamp: driverTimes[nextDriverTrainingIndex]
            });
            nextDriverTrainingText = formatNextMessage(nextDriverTraining);
        };


        //Conductor Trainings
        const conductorTrainings = await trainings.find({ 
            trainingType: 'Conductor'
        });

        const conductorTimes = [];
        
        for (const [key, value] of Object.entries(conductorTrainings)) {
            conductorTimes.push(value.timestamp);
        };

        const nextConductorTrainingData = nearestDate(conductorTimes);
        const nextConductorTrainingIndex = nextConductorTrainingData[0];
        const scheduledConductorTrainings = nextConductorTrainingData[1];
        
        let nextConductorTraining = {};
        let nextConductorTrainingText = 'No Conductor trainings scheduled.';

        if (nextConductorTrainingIndex != -1) {
            nextConductorTraining = await trainings.findOne({ 
                trainingType: 'Conductor',
                timestamp: conductorTimes[nextConductorTrainingIndex]
            });
            nextConductorTrainingText = formatNextMessage(nextConductorTraining);
        };


        //Dispatcher Trainings
        const dispatcherTrainings = await trainings.find({ 
            trainingType: 'Dispatcher'
        });
        
        const dispatcherTimes = [];

        for (const [key, value] of Object.entries(dispatcherTrainings)) {
            dispatcherTimes.push(value.timestamp);
        };

        const nextDispatcherTrainingData = nearestDate(dispatcherTimes);
        const nextDispatcherTrainingIndex = nextDispatcherTrainingData[0];
        const scheduledDispatcherTrainings = nextDispatcherTrainingData[1];
        
        let nextDispatcherTraining = {};
        let nextDispatcherTrainingText = 'No Dispatcher trainings scheduled.';

        if (nextDispatcherTrainingIndex != -1) {
            nextDispatcherTraining = await trainings.findOne({ 
                trainingType: 'Dispatcher',
                timestamp: dispatcherTimes[nextDispatcherTrainingIndex]
            });
            nextDispatcherTrainingText = formatNextMessage(nextDispatcherTraining);
        };

        
        //Signaller Trainings
        const signallerTrainings = await trainings.find({ 
            trainingType: 'Signaller'
        });

        signallerTimes = [];
        
        for (const [key, value] of Object.entries(signallerTrainings)) {
            signallerTimes.push(value.timestamp);
        };

        const nextSignallerTrainingData = nearestDate(signallerTimes);
        const nextSignallerTrainingIndex = nextSignallerTrainingData[0];
        const scheduledSignallerTrainings = nextSignallerTrainingData[1];
        
        let nextSignallerTraining = {};
        let nextSignallerTrainingText = 'No Signaller trainings scheduled.';

        if (nextSignallerTrainingIndex != -1) {
            nextSignallerTraining = await trainings.findOne({ 
                trainingType: 'Signaller',
                timestamp: signallerTimes[nextSignallerTrainingIndex]
            });
            nextSignallerTrainingText = formatNextMessage(nextSignallerTraining);
        };

        
        // Message
        const messageEmbed = new EmbedBuilder()
            .setTitle('Trainings')
            .setDescription(`**Information about the next trainings will be sent here.**`)
            .addFields(
                { name: `Driver Trainings (${scheduledDriverTrainings.toString()} scheduled):`, value: nextDriverTrainingText },
                { name: `Conductor Trainings (${scheduledConductorTrainings.toString()} scheduled):`, value: nextConductorTrainingText },
                { name: `Dispatcher Trainings (${scheduledDispatcherTrainings.toString()} scheduled):`, value: nextDispatcherTrainingText },
                { name: `Signaller Trainings (${scheduledSignallerTrainings.toString()} scheduled):`, value: nextSignallerTrainingText }
            )
            //.setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });
            .setFooter({ text: 'This message updates every minute. Last update' })
            .setTimestamp(d)

        message.edit({
            content: '',
            embeds: [ messageEmbed ],
            components: [row]
        });
    };

    updateMessage()

    setInterval(updateMessage, 60000);


};