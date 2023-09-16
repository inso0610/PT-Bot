const { ActivityType } = require('discord.js');

let status = [
    {
        name: 'Polar Tracks',
        type: ActivityType.Playing,
    }
];

module.exports = (client) => {
    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 10000);
};