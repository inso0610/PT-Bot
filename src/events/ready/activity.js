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
        name: 'with the signaller',
        type: ActivityType.Competing,
    }
];

module.exports = (client) => {
    console.log(`${client.user.tag} is online.`)

    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
};