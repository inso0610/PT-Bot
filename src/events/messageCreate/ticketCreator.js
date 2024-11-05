const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    console.log('TicketCreator Event');

    if (message.author.bot) {
        return;
    }

    if (message.mentions.has(client.user)) {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        try {
            // Send welcome embed to user
            await message.author.send({ embeds: [WelcomeEmbed] }).catch();

            const messageFilter = (m) => m.author.id === message.author.id;

            const response1 = await message.channel.awaitMessages({
                filter: messageFilter,
                max: 1,
                time: 60_000,
                errors: ['time'],
            });

            // If a response is received, log the content
            if (response1.size > 0) {
                const userResponse = response1.first().content;
                console.log(userResponse);

                // Optional: Confirm receipt to user
                await message.author.send('Thank you! We received your topic.');
            }
        } catch (error) {
            // Handle cases where no message was received or there was a DM error
            if (error instanceof Error && error.message.includes('time')) {
                await message.author.send('The ticket creator timed out. You can ping me if you need more help.').catch();
            } else {
                console.error('Error sending DM:', error);
            };
        };
    };
};
