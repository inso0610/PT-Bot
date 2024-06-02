const { EmbedBuilder } = require('discord.js');

function nearestDate (dates, target) {
    if (!target) {
      let targetMilli = Date.now()
      target = Math.floor(targetMilli / 1000);
    } else if (target instanceof Date) {
      target = target.getTime()
    }
  
    let nearest = Infinity
    let winner = -1
    let scheduled = 0
  
    dates.forEach(function (date, index) {
      if (date instanceof Date) {
        date = date.getTime()
      }
      let distance = Math.abs(date - target)
      scheduled += 1

      if (distance < nearest) {
        nearest = distance
        winner = index
      }
    })
  
    const data = [winner, scheduled]

    return data
};

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
};

module.exports = async (client) => {
    const trainings = require('../../utils/trainings.js');

    const trainingChannel = client.channels.cache.get('1218883814491820134');

    let d = new Date();

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
        nextDriverTrainingText = `Next: <t:${nextDriverTraining.timestamp}:F> (<t:${nextDriverTraining.timestamp}:R>). Hosted by: ${nextDriverTraining.hostRobloxUsername}. \nAdditional Info: ${nextDriverTraining.additionalInfo}`
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
        nextConductorTrainingText = `Next: <t:${nextConductorTraining.timestamp}:F> (<t:${nextConductorTraining.timestamp}:R>). Hosted by: ${nextConductorTraining.hostRobloxUsername}. \nAdditional Info: ${nextConductorTraining.additionalInfo}`
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
        nextDispatcherTrainingText = `Next: <t:${nextDispatcherTraining.timestamp}:F> (<t:${nextDispatcherTraining.timestamp}:R>). Hosted by: ${nextDispatcherTraining.hostRobloxUsername}. \nAdditional Info: ${nextDispatcherTraining.additionalInfo}`
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
        nextSignallerTrainingText = `Next: <t:${nextSignallerTraining.timestamp}:F> (<t:${nextSignallerTraining.timestamp}:R>). Hosted by: ${nextSignallerTraining.hostRobloxUsername}. \nAdditional Info: ${nextSignallerTraining.additionalInfo}`
    };

    const linkButton = new ButtonBuilder()
			.setLabel('Read the training guides before attending!')
            .setURL("https://drive.google.com/drive/folders/1ASzcju1gkXTq1PX7qCYhv6Ly1vCze7tf?usp=drive_link")
			.setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder()
			.addComponents(linkButton);
    
    // Message
    let messageEmbed = new EmbedBuilder()
        .setTitle('Trainings')
        .setDescription("**Information about the next training's will be sent here.**")
        .addFields(
            { name: `Driver Trainings (${scheduledDriverTrainings.toString()} scheduled.):`, value: nextDriverTrainingText },
            { name: `Conductor Trainings (${scheduledConductorTrainings.toString()} scheduled.):`, value: nextConductorTrainingText },
            { name: `Dispatcher Trainings (${scheduledDispatcherTrainings.toString()} scheduled.):`, value: nextDispatcherTrainingText },
            { name: `Signaller Trainings (${scheduledSignallerTrainings.toString()} scheduled.):`, value: nextSignallerTrainingText }
        )
        .setFooter({ text: `This message updates every 5 minutes. Last update: ${hour}:${minute} UTC` });

    const message = await trainingChannel.send({
        embeds: [ messageEmbed ],
        components: [row],
    });


    messageEmbed = null;


    // Message Updater

    while (true) {
        await sleep(300000); 

        d = new Date();

        hour = d.getUTCHours().toString();

        if (hour.length == 1) {
            const old = hour;
            hour = `0${old}`
        };

        minute = d.getUTCMinutes().toString();

        if (minute.length == 1) {
        const old = minute;
        minute = `0${old}`
        };
        //Driver Trainings

        driverTrainings = await trainings.find({ 
            trainingType: 'Driver'
        });

        driverTimes = [];
        
        for (const [key, value] of Object.entries(driverTrainings)) {
            driverTimes.push(value.timestamp);
        };

        nextDriverTrainingData = nearestDate(driverTimes);
        nextDriverTrainingIndex = nextDriverTrainingData[0];
        scheduledDriverTrainings = nextDriverTrainingData[1];
        
        nextDriverTraining = {};
        nextDriverTrainingText = 'No Driver training\'s scheduled.';

        if (nextDriverTrainingIndex != -1) {
            nextDriverTraining = await trainings.findOne({ 
                trainingType: 'Driver',
                timestamp: driverTimes[nextDriverTrainingIndex]
            });
            nextDriverTrainingText = `Next: <t:${nextDriverTraining.timestamp}:F> (<t:${nextDriverTraining.timestamp}:R>). Hosted by: ${nextDriverTraining.hostRobloxUsername}. \nAdditional Info: ${nextDriverTraining.additionalInfo}`
        };


        //Conductor Trainings
        conductorTrainings = await trainings.find({ 
            trainingType: 'Conductor'
        });

        conductorTimes = [];
        
        for (const [key, value] of Object.entries(conductorTrainings)) {
            conductorTimes.push(value.timestamp);
        };

        nextConductorTrainingData = nearestDate(conductorTimes);
        nextConductorTrainingIndex = nextConductorTrainingData[0];
        scheduledConductorTrainings = nextConductorTrainingData[1];
        
        nextConductorTraining = {};
        nextConductorTrainingText = 'No Conductor training\'s scheduled.';

        if (nextConductorTrainingIndex != -1) {
            nextConductorTraining = await trainings.findOne({ 
                trainingType: 'Conductor',
                timestamp: conductorTimes[nextConductorTrainingIndex]
            });
            nextConductorTrainingText = `Next: <t:${nextConductorTraining.timestamp}:F> (<t:${nextConductorTraining.timestamp}:R>). Hosted by: ${nextConductorTraining.hostRobloxUsername}. \nAdditional Info: ${nextConductorTraining.additionalInfo}`
        };


        //Dispatcher Trainings
        dispatcherTrainings = await trainings.find({ 
            trainingType: 'Dispatcher'
        });
        
        dispatcherTimes = [];

        for (const [key, value] of Object.entries(dispatcherTrainings)) {
            dispatcherTimes.push(value.timestamp);
        };

        nextDispatcherTrainingData = nearestDate(dispatcherTimes);
        nextDispatcherTrainingIndex = nextDispatcherTrainingData[0];
        scheduledDispatcherTrainings = nextDispatcherTrainingData[1];
        
        nextDispatcherTraining = {};
        nextDispatcherTrainingText = 'No Dispatcher training\'s scheduled.';

        if (nextDispatcherTrainingIndex != -1) {
            nextDispatcherTraining = await trainings.findOne({ 
                trainingType: 'Dispatcher',
                timestamp: dispatcherTimes[nextDispatcherTrainingIndex]
            });
            nextDispatcherTrainingText = `Next: <t:${nextDispatcherTraining.timestamp}:F> (<t:${nextDispatcherTraining.timestamp}:R>). Hosted by: ${nextDispatcherTraining.hostRobloxUsername}. \nAdditional Info: ${nextDispatcherTraining.additionalInfo}`
        };

        
        //Signaller Trainings
        signallerTrainings = await trainings.find({ 
            trainingType: 'Signaller'
        });

        signallerTimes = [];
        
        for (const [key, value] of Object.entries(signallerTrainings)) {
            signallerTimes.push(value.timestamp);
        };

        nextSignallerTrainingData = nearestDate(signallerTimes);
        nextSignallerTrainingIndex = nextSignallerTrainingData[0];
        scheduledSignallerTrainings = nextSignallerTrainingData[1];
        
        nextSignallerTraining = {};
        nextSignallerTrainingText = 'No Signaller training\'s scheduled.';

        if (nextSignallerTrainingIndex != -1) {
            nextSignallerTraining = await trainings.findOne({ 
                trainingType: 'Signaller',
                timestamp: signallerTimes[nextSignallerTrainingIndex]
            });
            nextSignallerTrainingText = `Next: <t:${nextSignallerTraining.timestamp}:F> (<t:${nextSignallerTraining.timestamp}:R>). Hosted by: ${nextSignallerTraining.hostRobloxUsername}. \nAdditional Info: ${nextSignallerTraining.additionalInfo}`
        };

        
        // Message
        messageEmbed = new EmbedBuilder()
            .setTitle('Trainings')
            .setDescription(`**Information about the next training's will be sent here.**`)
            .addFields(
                { name: `Driver Trainings (${scheduledDriverTrainings.toString()} scheduled.):`, value: nextDriverTrainingText },
                { name: `Conductor Trainings (${scheduledConductorTrainings.toString()} scheduled.):`, value: nextConductorTrainingText },
                { name: `Dispatcher Trainings (${scheduledDispatcherTrainings.toString()} scheduled.):`, value: nextDispatcherTrainingText },
                { name: `Signaller Trainings (${scheduledSignallerTrainings.toString()} scheduled.):`, value: nextSignallerTrainingText }
            )
            .setFooter({ text: `This message updates every 5 minutes. Last update: ${hour}:${minute} UTC` });

        
        message.edit({
            embeds: [ messageEmbed ]
         });
    };
};