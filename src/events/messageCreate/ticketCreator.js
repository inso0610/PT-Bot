const { EmbedBuilder } = require('discord.js');

const sendDM = async (message) => {
    return message.author.send({ content: message }).catch(e => {
        message.reply({
            content: "Oooof (Insert train crash noises) I can't DM you, please check your DM settings!"
        }).catch(e => {
            console.warn(e);
        });
        console.warn(e);
        throw e; // Stop further execution if DM fails
    });
};

const collectResponse = async (prompt) => {
    await sendDM(prompt);

    return new Promise((resolve, reject) => {
        const collector = message.user.dmChannel.createMessageCollector({
            filter: i => i.author.id === message.author.id,
            time: 60000,
            max: 1
        });

        collector.on('collect', i => resolve(i.content));
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                message.author.send("You took too long to respond. Please try again.");
                reject(new Error("Timeout"));
            }
        });
    });
};

module.exports = async (message, client) => {
    if (message.author.bot) {
        return;
    }

    if (message.mentions.has(client.user)) {
        const WelcomeEmbed = new EmbedBuilder()
            .setTitle('Welcome to our ticket system!')
            .setDescription('Let\'s start creating your ticket.');

        try {
            // If the user already has a ticket ask if the person wants to create a new one

            await message.author.send({ embeds: [WelcomeEmbed] }).catch();

            const ticketTopic = await collectResponse('Please reply with the topic of your ticket.');

            const ticketDescription = await collectResponse('Please reply with a more detailed description of your ticket.')

            const additionalComments = await collectResponse('Please reply with any additional comments.')

            // Ask if everything is correct

            // Create ticket in MongoDB

            // Respond that the ticket was created

            // Send message in tickets channel
        } catch (error) {
            await message.author.send('Something failed in the ticket creation system.').catch();

            console.warn(`Ticket creator error: ${error}`);
        };
    };
};
