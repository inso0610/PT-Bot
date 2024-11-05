const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    console.log('TicketCreator Event')

    if (message.author.bot || message.guild !== null || message.content !== '<@1152626581022445599>') {
        return;
    };

    if (message.mentions.has(client.user)) {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        await client.users.send(message.author.id, {
            embeds: [WelcomeEmbed]
        });

        const messageFilter = (m) => m.author === message.author;

        const response1 = await message.channel.awaitMessages(messageFilter, {max: 1, time: 60_000});

        if (!response1) {
            client.users.send(message.author.id, 'The ticket creator timed out. You can ping me if you need more help.');
            return;
        };

        console.log(response1.content);
    };
};
