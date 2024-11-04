const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    if (message.author.bot || message.guild !== null) {
        console.log('1')
        return;
    };

    if (message.mentions.has(client.user.id)) {

        console.log('2')
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        message.reply({
            embeds: [WelcomeEmbed]
        });
    };
};
