const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { CronJob } = require('cron');

const operators = {
    NEX: 'Northern Express',
    NB: 'Nord Banen',
    GN: 'Go Nordic',
    PT: 'Polar Trains',
    CHS: 'CHS Cargo'
};

const STATION_CODES = {
    SK: 'Skogviken Station',
    KLH: 'Kirkenes Lufthavn Høybuktmoen Station',
    RUS: 'Rustfjelbma Station'
};

module.exports = async (client) => {
    const partnerChannel = client.channels.cache.get('1374808954840023051');
    let message;

    try {
        message = await partnerChannel.messages.fetch('1374844979033407488');
    } catch (e) {
        console.warn(`Could not fetch ad message: ${e}`);
    }

    if (!message) {
        message = await partnerChannel.send({ content: 'Loading Skogviken ad message...' });
        partnerChannel.send('<@&1304849124528754729> Had to create a new Skogviken ad message!');
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Join the Skogviken Discord Server')
            .setURL('https://discord.gg/9RbDbtq3uV')
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setLabel('Join the Skogviken game')
            .setURL('https://www.roblox.com/games/15870441474/Skogviken-Kommune')
            .setStyle(ButtonStyle.Link)
    );

    async function fetchNextTrainMessage(stationCode) {
        const url = `${process.env.TIOS_API_URL}/locations/${stationCode}/departures`;
        let trains;

        try {
            const res = await fetch(url);
            trains = await res.json();
        } catch (e) {
            console.warn(`Failed to fetch data for ${stationCode}: ${e}`);
            return 'Error retrieving train data.';
        }

        if (!trains || trains.error) {
            console.warn(`Train data error for ${stationCode}: ${trains?.error}`);
            return 'No train data available.';
        }

        const now = new Date();
        const upcoming = trains.filter(train => {
            const dep = new Date(train.departure);
            return (
                dep > now &&
                !train.hasPassed &&
                train.stopType === 'passenger' &&
                train.fullRoute[train.fullRoute.length - 1]?.code !== stationCode
            );
        });

        const next = upcoming[0];
        if (!next) return 'No trains are scheduled for today.';

        const departureTime = new Date(next.departure);
        const defaultDepartureTime = new Date(next.defaultDeparture);
        const departureUnix = Math.floor(departureTime.getTime() / 1000);
        const defaultUnix = Math.floor(defaultDepartureTime.getTime() / 1000);

        let timeString = departureTime.getTime() !== defaultDepartureTime.getTime()
            ? `~~<t:${defaultUnix}:t>~~ <t:${departureUnix}:t>`
            : `<t:${departureUnix}:t>`;

        if (next.isCancelledAtStation) {
            timeString = `~~<t:${defaultUnix}:t>~~ **Cancelled**`;
        }

        const operator = operators[next.operator] || next.operator;
        const route = next.routeNumber || operator;
        const destination = next.fullRoute[next.fullRoute.length - 1]?.name || 'Unknown';

        return `*${route} train to ${destination} departs at ${timeString}.*\n*Train Number:* ${next.trainNumber}\n*Operator:* ${operator}`;
    }

    async function updateMessage() {
        const embed = new EmbedBuilder()
            .setColor('#295abf')
            .setTitle('Play Skogviken Kommune!')
            .setDescription('Create your story in a dynamic Arctic town with endless possibilities. Shape the world around you and be part of an evolving community.')
            .setTimestamp()
            .setFooter({ text: 'Skogviken Kommune • Updates every 10 minutes' });

        for (const [code, name] of Object.entries(STATION_CODES)) {
            const message = await fetchNextTrainMessage(code);
            embed.addFields({ name: `Next train from ${name}`, value: message, inline: false });
        }

        try {
            await message.edit({
                content: '# Skogviken Kommune',
                embeds: [embed],
                components: [row],
            });
        } catch (e) {
            console.warn(`Error updating Skogviken message: ${e}`);
        }
    }

    // Run every 10 minutes
    new CronJob('0 */10 * * * *', updateMessage, null, true, 'Europe/Oslo');
    updateMessage()
};
