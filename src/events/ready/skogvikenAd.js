const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;

const operators = {
    NEX: 'Northern Express',
    NB: 'Nord Banen',
    GN: 'Go Nordic',
    PT: 'Polar Trains',
    CHS: 'CHS Cargo'
}

module.exports = async (client) => {
    const partnerChannel = client.channels.cache.get('1374808954840023051');

    let message;

    message = await partnerChannel.messages.fetch('1374844979033407488').catch(e => {  // Replace with your actual message ID
        console.warn(e);
    });

    if (!message) {
        message = await partnerChannel.send({
            content: 'Loading skogviken ad message...'
        });
        trainingChannel.send('<@&1304849124528754729> Had to make a new skogviken ad message!');
    };

    const joinDiscordButton = new ButtonBuilder()
        .setLabel('Join the Skogviken Discord Server')
        .setURL("https://discord.gg/9RbDbtq3uV")
        .setStyle(ButtonStyle.Link);

    const joinGameButton = new ButtonBuilder()
        .setLabel('Join the Skogviken game')
        .setURL("https://www.roblox.com/games/15870441474/Skogviken-Kommune")
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(joinDiscordButton, joinGameButton);

    async function updateMessage() {
        const SKTrains = await fetch(`${process.env.TIOS_API_URL}/locations/SK/departures`).then(res => res.json()).catch(e => {
            console.warn(`Error fetching SKTrains: ${e}`);
        });

        if (!SKTrains) {
            console.warn(`SKTrains is undefined. Fetch might have failed. Tried to fetch: ${process.env.TIOS_API_URL}/locations/SK/departures`);
            return;
        }

        if (SKTrains.error !== undefined) {
            console.warn(`SKTrains error: ${SKTrains.error}`);
            return;
        }

        const nextTrainsSK = SKTrains.filter(train => {
            const trainTime = new Date(train.departure);
            const now = new Date();
            return trainTime > now && train.hasPassed === false && train.isCancelledAtStation === false && train.stopType === 'passenger' && train.fullRoute[train.fullRoute.length - 1].code !== 'SK';
        });

        const nextTrainSK = nextTrainsSK[0];

        let nextTrainMessageSK = 'No trains are scheduled for today.';
        if (nextTrainSK) {
            const departureTime = new Date(nextTrain.departure);
            const defaultDepartureTime = new Date(nextTrain.defaultDeparture);

            const operatorString = operators[nextTrain.operator] || nextTrain.operator;
            const routeString = nextTrain.routeNumber || operatorString

            let departureTimeString = `<t:${Math.floor(departureTime.getTime() / 1000)}:t>`;
            if (departureTime.getTime() !== defaultDepartureTime.getTime())
                departureTimeString = `~~<t:${Math.floor(defaultDepartureTime.getTime() / 1000)}:t>~~ <t:${Math.floor(departureTime.getTime() / 1000)}:t>`;

            nextTrainMessageSK = `*${routeString} train to ${nextTrain.fullRoute[nextTrain.fullRoute.length - 1].name} departs at ${departureTimeString}.*\n*Train Number:* ${nextTrain.trainNumber}\n*Operator:* ${operatorString}`;
        };

        const KLHTrains = await fetch(`${process.env.TIOS_API_URL}/locations/KLH/departures`).then(res => res.json()).catch(e => {
            console.warn(`Error fetching KLHTrains: ${e}`);
        });

        if (!KLHTrains) {
            console.warn(`KLHTrains is undefined. Fetch might have failed. Tried to fetch: ${process.env.TIOS_API_URL}/locations/KLH/departures`);
            return;
        }

        if (KLHTrains.error !== undefined) {
            console.warn(`KLHTrains error: ${KLHTrains.error}`);
            return;
        }

        const nextTrainsKLH = KLHTrains.filter(train => {
            const trainTime = new Date(train.departure);
            const now = new Date();
            return trainTime > now && train.hasPassed === false && train.isCancelledAtStation === false && train.stopType === 'passenger' && train.fullRoute[train.fullRoute.length - 1].code !== 'KLH';
        });

        const nextTrainKLH = nextTrainsKLH[0];
        let nextTrainMessageKLH = 'No trains are scheduled for today.';
        if (nextTrainKLH) {
            const departureTime = new Date(nextTrainKLH.departure);
            const defaultDepartureTime = new Date(nextTrainKLH.defaultDeparture);

            const operatorString = operators[nextTrainKLH.operator] || nextTrainKLH.operator;
            const routeString = nextTrainKLH.routeNumber || operatorString;

            let departureTimeString = `<t:${Math.floor(departureTime.getTime() / 1000)}:t>`;
            if (departureTime.getTime() !== defaultDepartureTime.getTime())
                departureTimeString = `~~<t:${Math.floor(defaultDepartureTime.getTime() / 1000)}:t>~~ <t:${Math.floor(departureTime.getTime() / 1000)}:t>`;

            nextTrainMessageKLH = `*${routeString} train to ${nextTrainKLH.fullRoute[nextTrainKLH.fullRoute.length - 1].name} departs at ${departureTimeString}.*\n*Train Number:* ${nextTrainKLH.trainNumber}\n*Operator:* ${operatorString}`;
        };

        const RUSTrains = await fetch(`${process.env.TIOS_API_URL}/locations/RUS/departures`).then(res => res.json()).catch(e => {
            console.warn(`Error fetching RUSTrains: ${e}`);
        });

        if (!RUSTrains) {
            console.warn(`RUSTrains is undefined. Fetch might have failed. Tried to fetch: ${process.env.TIOS_API_URL}/locations/RUS/departures`);
            return;
        }

        if (RUSTrains.error !== undefined) {
            console.warn(`RUSTrains error: ${RUSTrains.error}`);
            return;
        }

        const nextTrainsRUS = RUSTrains.filter(train => {
            const trainTime = new Date(train.departure);
            const now = new Date();
            return trainTime > now && train.hasPassed === false && train.isCancelledAtStation === false && train.stopType === 'passenger' && train.fullRoute[train.fullRoute.length - 1].code !== 'RUS';
        });

        const nextTrainRUS = nextTrainsRUS[0];

        let nextTrainMessageRUS = 'No trains are scheduled for today.';
        if (nextTrainRUS) {
            const departureTime = new Date(nextTrainRUS.departure);
            const defaultDepartureTime = new Date(nextTrainRUS.defaultDeparture);

            const operatorString = operators[nextTrainRUS.operator] || nextTrainRUS.operator;
            const routeString = nextTrainRUS.routeNumber || operatorString;

            let departureTimeString = `<t:${Math.floor(departureTime.getTime() / 1000)}:t>`;
            if (departureTime.getTime() !== defaultDepartureTime.getTime())
                departureTimeString = `~~<t:${Math.floor(defaultDepartureTime.getTime() / 1000)}:t>~~ <t:${Math.floor(departureTime.getTime() / 1000)}:t>`;

            nextTrainMessageRUS = `*${routeString} train to ${nextTrainRUS.fullRoute[nextTrainRUS.fullRoute.length - 1].name} departs at ${departureTimeString}.*\n*Train Number:* ${nextTrainRUS.trainNumber}\n*Operator:* ${operatorString}`;
        };

        const embed = new EmbedBuilder()
            .setColor('#295abf')
            .setTitle('Play Skogviken Kommune!')
            .setDescription('Create your story in a dynamic Arctic town with endless possibilities. Shape the world around you and be part of an evolving community.')
            .addFields(
                { name: 'Next train from Skogviken Station', value: nextTrainMessageSK, inline: false },
                { name: 'Next train from Kirkenes Lufthavn Høybuktmoen Station', value: nextTrainMessageKLH, inline: false },
                { name: 'Next train from Rustfjelbma Station', value: nextTrainMessageRUS, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Skogviken Kommune' });

        message.edit({
            content: '# Skogviken Kommune',
            embeds: [embed],
            components: [row],
        }).catch(e => {
            console.warn(`Error updating message: ${e}`);
        });
    };
    
    new CronJob('0 * * * * *', updateMessage, null, true, 'Europe/Oslo', null, false); // Run every 10 minutes
}

