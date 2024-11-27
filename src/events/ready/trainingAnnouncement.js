const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

function nearestDate (dates, target) {
    if (!target) {
        let targetMilli = Date.now();
        target = Math.floor(targetMilli / 1000);
    } else if (target instanceof Date) {
        target = target.getTime();
    };
  
    let nearest = Infinity;
    let winner = -1;
    let scheduled = 0;
  
    dates.forEach(function (date, index) {
        if (date instanceof Date) {
            date = date.getTime();
        };
        let distance = Math.abs(date - target);
        scheduled += 1;

        if (distance < nearest) {
            nearest = distance;
            winner = index;
        };
    });
  
    const data = [winner, scheduled];

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
        trainingChannel.send('<@935889950547771512> Had to make a new training message!');
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

        let hour = d.getUTCHours().toString();

        if (hour.length == 1) {
            const old = hour;
            hour = `0${old}`
        };

        let minute = d.getUTCMinutes().toString();

        if (minute.length == 1) {
            const old = minute;
            minute = `0${old}`
        };
        //Driver Trainings

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
        let nextDriverTrainingText = 'No Driver training\'s scheduled.';

        if (nextDriverTrainingIndex != -1) {
            nextDriverTraining = await trainings.findOne({ 
                trainingType: 'Driver',
                timestamp: driverTimes[nextDriverTrainingIndex]
            });
            nextDriverTrainingText = `Next: <t:${nextDriverTraining.timestamp}:F> (<t:${nextDriverTraining.timestamp}:R>). Hosted by: ${nextDriverTraining.hostRobloxUsername}. \nAdditional Info: ${nextDriverTraining.additionalInfo}`;
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
        let nextConductorTrainingText = 'No Conductor training\'s scheduled.';

        if (nextConductorTrainingIndex != -1) {
            nextConductorTraining = await trainings.findOne({ 
                trainingType: 'Conductor',
                timestamp: conductorTimes[nextConductorTrainingIndex]
            });
            nextConductorTrainingText = `Next: <t:${nextConductorTraining.timestamp}:F> (<t:${nextConductorTraining.timestamp}:R>). Hosted by: ${nextConductorTraining.hostRobloxUsername}. \nAdditional Info: ${nextConductorTraining.additionalInfo}`;
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
        let nextDispatcherTrainingText = 'No Dispatcher training\'s scheduled.';

        if (nextDispatcherTrainingIndex != -1) {
            nextDispatcherTraining = await trainings.findOne({ 
                trainingType: 'Dispatcher',
                timestamp: dispatcherTimes[nextDispatcherTrainingIndex]
            });
            nextDispatcherTrainingText = `Next: <t:${nextDispatcherTraining.timestamp}:F> (<t:${nextDispatcherTraining.timestamp}:R>). Hosted by: ${nextDispatcherTraining.hostRobloxUsername}. \nAdditional Info: ${nextDispatcherTraining.additionalInfo}`;
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
        let nextSignallerTrainingText = 'No Signaller training\'s scheduled.';

        if (nextSignallerTrainingIndex != -1) {
            nextSignallerTraining = await trainings.findOne({ 
                trainingType: 'Signaller',
                timestamp: signallerTimes[nextSignallerTrainingIndex]
            });
            nextSignallerTrainingText = `Next: <t:${nextSignallerTraining.timestamp}:F> (<t:${nextSignallerTraining.timestamp}:R>). Hosted by: ${nextSignallerTraining.hostRobloxUsername}. \nAdditional Info: ${nextSignallerTraining.additionalInfo}`;
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
            .setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });

        message.edit({
            content: '',
            embeds: [ messageEmbed ],
            components: [row]
        });
    };

    /*let d = new Date();

    let hour = d.getUTCHours().toString();

    if (hour.length == 1) {
        const old = hour;
        hour = `0${old}`;
    };

    let minute = d.getUTCMinutes().toString();

    if (minute.length == 1) {
        const old = minute;
        minute = `0${old}`;
    };

    //Driver Trainings
    let driverTrainings = await trainings.find({ 
        trainingType: 'Driver'
    });

    let driverTimes = [];
    
    for (const [key, value] of Object.entries(driverTrainings)) {
        driverTimes.push(value.timestamp);
    };

    let nextDriverTrainingData = nearestDate(driverTimes);
    let nextDriverTrainingIndex = nextDriverTrainingData[0];
    let scheduledDriverTrainings = nextDriverTrainingData[1];
    
    let nextDriverTraining = {};
    let nextDriverTrainingText = 'No Driver training\'s scheduled.';

    if (nextDriverTrainingIndex != -1) {
        nextDriverTraining = await trainings.findOne({ 
            trainingType: 'Driver',
            timestamp: driverTimes[nextDriverTrainingIndex]
        });
        nextDriverTrainingText = `Next: <t:${nextDriverTraining.timestamp}:F> (<t:${nextDriverTraining.timestamp}:R>). Hosted by: ${nextDriverTraining.hostRobloxUsername}. \nAdditional Info: ${nextDriverTraining.additionalInfo}`;
    };


    //Conductor Trainings
    let conductorTrainings = await trainings.find({ 
        trainingType: 'Conductor'
    });

    let conductorTimes = [];
    
    for (const [key, value] of Object.entries(conductorTrainings)) {
        conductorTimes.push(value.timestamp);
    };

    let nextConductorTrainingData = nearestDate(conductorTimes);
    let nextConductorTrainingIndex = nextConductorTrainingData[0];
    let scheduledConductorTrainings = nextConductorTrainingData[1];
    
    let nextConductorTraining = {};
    let nextConductorTrainingText = 'No Conductor training\'s scheduled.';

    if (nextConductorTrainingIndex != -1) {
        nextConductorTraining = await trainings.findOne({ 
            trainingType: 'Conductor',
            timestamp: conductorTimes[nextConductorTrainingIndex]
        });
        nextConductorTrainingText = `Next: <t:${nextConductorTraining.timestamp}:F> (<t:${nextConductorTraining.timestamp}:R>). Hosted by: ${nextConductorTraining.hostRobloxUsername}. \nAdditional Info: ${nextConductorTraining.additionalInfo}`;
    };


    //Dispatcher Trainings
    let dispatcherTrainings = await trainings.find({ 
        trainingType: 'Dispatcher'
    });
    
    let dispatcherTimes = [];

    for (const [key, value] of Object.entries(dispatcherTrainings)) {
        dispatcherTimes.push(value.timestamp);
    };

    let nextDispatcherTrainingData = nearestDate(dispatcherTimes);
    let nextDispatcherTrainingIndex = nextDispatcherTrainingData[0];
    let scheduledDispatcherTrainings = nextDispatcherTrainingData[1];
    
    let nextDispatcherTraining = {};
    let nextDispatcherTrainingText = 'No Dispatcher training\'s scheduled.';

    if (nextDispatcherTrainingIndex != -1) {
        nextDispatcherTraining = await trainings.findOne({ 
            trainingType: 'Dispatcher',
            timestamp: dispatcherTimes[nextDispatcherTrainingIndex]
        });
        nextDispatcherTrainingText = `Next: <t:${nextDispatcherTraining.timestamp}:F> (<t:${nextDispatcherTraining.timestamp}:R>). Hosted by: ${nextDispatcherTraining.hostRobloxUsername}. \nAdditional Info: ${nextDispatcherTraining.additionalInfo}`;
    };

    
    //Signaller Trainings
    let signallerTrainings = await trainings.find({ 
        trainingType: 'Signaller'
    });

    let signallerTimes = []
    
    for (const [key, value] of Object.entries(signallerTrainings)) {
        signallerTimes.push(value.timestamp);
    };

    let nextSignallerTrainingData = nearestDate(signallerTimes);
    let nextSignallerTrainingIndex = nextSignallerTrainingData[0];
    let scheduledSignallerTrainings = nextSignallerTrainingData[1];
    
    let nextSignallerTraining = {};
    let nextSignallerTrainingText = 'No Signaller training\'s scheduled.';

    if (nextSignallerTrainingIndex != -1) {
        nextSignallerTraining = await trainings.findOne({ 
            trainingType: 'Signaller',
            timestamp: signallerTimes[nextSignallerTrainingIndex]
        });
        nextSignallerTrainingText = `Next: <t:${nextSignallerTraining.timestamp}:F> (<t:${nextSignallerTraining.timestamp}:R>). Hosted by: ${nextSignallerTraining.hostRobloxUsername}. \nAdditional Info: ${nextSignallerTraining.additionalInfo}`;
    };*/

    /*// Message
    let messageEmbed = new EmbedBuilder()
        .setTitle('Trainings')
        .setDescription("**Information about the next trainings will be sent here.**")
        .addFields(
            { name: `Driver Trainings (${scheduledDriverTrainings.toString()} scheduled):`, value: nextDriverTrainingText },
            { name: `Conductor Trainings (${scheduledConductorTrainings.toString()} scheduled):`, value: nextConductorTrainingText },
            { name: `Dispatcher Trainings (${scheduledDispatcherTrainings.toString()} scheduled):`, value: nextDispatcherTrainingText },
            { name: `Signaller Trainings (${scheduledSignallerTrainings.toString()} scheduled):`, value: nextSignallerTrainingText }
        )
        .setFooter({ text: `This message updates every minute. Last update: ${hour}:${minute} UTC` });*/


    //messageEmbed = null;

    updateMessage()


    // Message Updater

    setInterval(updateMessage, 60000);
};