const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    console.log('TicketCreator Event')

    if (message.author.bot || message.guild !== null) {
        return;
    };

    console.log(message.mentions.first())

    if (message.mentions.has(client.user)) {
        console.log('3')
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        client.users.send(message.author.id, {
            embeds: [WelcomeEmbed]
        });
    };
};
