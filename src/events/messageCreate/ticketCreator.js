const { EmbedBuilder } = require('discord.js');

module.exports = async (message, client) => {
    if (message.author.bot || message.guild !== null) {
        return;
    };

    if (message.isMemberMentioned(client.user)) {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Please reply with the topic of your ticket.');
        message.reply({
            embeds: [WelcomeEmbed]
        });
    };
};
