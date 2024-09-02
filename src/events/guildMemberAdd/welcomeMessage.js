const { EmbedBuilder } = require('discord.js');

module.exports = (member, client) => {
    const welcomeChannel = client.channels.cache.get('1142108062086344895');

    const memberId = member.id
    const memberUsername = member.user.username

    const embed = new EmbedBuilder()
        .setTitle(`Welcome ${memberUsername}!`)
        .setDescription(`Welcome to the Polar Tracks Discord server <@${memberId}>!\nHave any questions? Don't be afraid to ask anyone in our staff team.`)
        .addFields(
            { name: 'Looking to work here?', value: 'Check out <#1156993148732583957>' },
            { name: 'Looking to get trained?', value: 'Check out <#1246904420495523925> and https://teamup.com/ksopth82jo3q9yrj4i.' },
            { name: 'Want to see what\'s next for Polar Tracks?', value: 'Check out <#1133076158674636951>' }
        );
    
    welcomeChannel.send({
        content: `Welcome <@${memberId}>!`,
        embeds: [ embed ]
    });

    client.users.send(memberId, {
          embeds: [ embed ]
    }).catch(e=>{console.warn(`Failed to send welcome DM:\n\n${e}`)});
};