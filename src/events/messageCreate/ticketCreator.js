const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    console.log('TicketCreator Event')

    if (message.author.bot || message.guild !== null || message.content) {
        return;
    };

    if (message.mentions.has(client.user)) {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        await client.users.send(interaction.user.id, {
            embeds: [WelcomeEmbed]
        });

        const response1 = await message.channel.awaitMessages(filter, {max: 1, time: 60_000});

        if (!response1) {
            client.users.send(message.user.id, 'The ticket creator timed out. You can ping me if you need more help.');
            return;
        };

        console.log(response1.content);
    };
};
