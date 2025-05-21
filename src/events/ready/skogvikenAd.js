const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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

        const nextTrains = SKTrains.filter(train => {
            const trainTime = new Date(train.departure);
            const now = new Date();
            return trainTime > now && train.hasPassed === false && train.isCancelledAtStation === false && train.stopType === 'passenger' && train.fullRoute[train.fullRoute.length - 1].code !== 'SK';
        });

        const nextTrain = nextTrains[0];

        let nextTrainMessage = 'No trains are scheduled for today.';
        if (nextTrain) {
            const departureTime = new Date(nextTrain.departure);
            const defaultDepartureTime = new Date(nextTrain.defaultDeparture);

            const operatorString = operators[nextTrain.operator] || nextTrain.operator;
            const routeString = nextTrain.routeNumber || operatorString

            let departureTimeString = `<t:${Math.floor(departureTime.getTime() / 1000)}:t>`;
            if (departureTime.getTime() !== defaultDepartureTime.getTime())
                departureTimeString = `~~<t:${Math.floor(defaultDepartureTime.getTime() / 1000)}:t>~~ <t:${Math.floor(departureTime.getTime() / 1000)}:t>`;

            nextTrainMessage = `*${routeString} train  to ${nextTrain.fullRoute[nextTrain.fullRoute.length - 1].name} departs at ${departureTimeString}.*\n*Train Number:* ${nextTrain.trainNumber}\n*Operator:* ${operatorString}`;
        };

        const embed = new EmbedBuilder()
            .setColor('#295abf')
            .setTitle('Play Skogviken Kommune!')
            .setDescription('Create your story in a dynamic Arctic town with endless possibilities. Shape the world around you and be part of an evolving community.')
            .addFields(
                { name: 'Next train from Skogviken Station', value: nextTrainMessage, inline: false },
            )
            .setTimestamp()
            .setFooter({ text: 'Skogviken Kommune' });

        message.edit({
            embeds: [embed],
            components: [row],
        }).catch(e => {
            console.warn(`Error updating message: ${e}`);
        });
    };
    updateMessage();

    setInterval(updateMessage, 60000); // Update every minute
}

