const { ActivityType } = require('discord.js');

const status = [
    {
        name: 'Polar Tracks',
        type: ActivityType.Playing,
    },
    {
        name: 'Tickets',
        type: ActivityType.Watching,
    },
    {
        name: 'Members',
        type: ActivityType.Watching,
    },
    {
        name: 'signalling with the signaller',
        type: ActivityType.Competing,
    },
    {
        name: 'RailCowGirl',
        type: ActivityType.Watching
    },
    {
        name: 'Railroading with JM',
        type: ActivityType.Watching,
    },
    {
        name: 'the trains go by',
        type: ActivityType.Watching,
    }
];

module.exports = (client) => {
    console.log(`${client.user.tag} is online.`);

    const channel = client.channels.cache.get('1333159918278021190');

    channel.send('<@339379137947107328> Bot restarted!');

    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
};
