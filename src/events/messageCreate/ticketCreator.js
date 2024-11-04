const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    if (message.author.bot || message.guild !== null) {
        console.log('1')
        return;
    };
    console.log('2')

    console.log(message.mentions.first())

    if (message.mentions.has(client.user)) {
        console.log('3')
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');

        message.reply({
            embeds: [WelcomeEmbed]
        });
    };
};
