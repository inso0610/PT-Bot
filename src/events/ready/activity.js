const { ActivityType } = require('discord.js');

const status = [
    {
        name: 'Polar Tracks',
        type: ActivityType.Playing,
    },
    {
        name: 'Rail Cow Girl',
        type: ActivityType.Watching,
    },
    {
        name: 'Members',
        type: ActivityType.Watching,
    },
    {
        name: 'Railroading with JM',
        type: ActivityType.Watching,
    }
];

module.exports = (client) => {
    console.log(`${client.user.tag} is online.`)

    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
};