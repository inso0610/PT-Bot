const { SlashCommandBuilder } = require('discord.js')
const deadChat = require('../../utils/deadChat.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dead-chat')
    .setDescription('Pings dead chat ping if the last dead chat ping was more than 24 hours ago.'),

    run: async ({ interaction, client, handler }) => {
        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                ephemeral: true
            });
            return;
        };

        function ping() {
            interaction.reply('<@&1308429122975957132>')
            deadChatSchema.save()
        };

        let deadChatSchema = await deadChat.findOne().exec();

            if (!deadChatSchema) {
                deadChatSchema = new deadChat({
                    lastPing: Date.now()
                });

                ping()
            } else {
                const difference = Math.round(Date.now() - deadChatSchema.lastPing) / 1000;

                deadChatSchema.lastPing = Date.now();

                console.log(difference);

                if (difference >= 86_400) {
                    ping();
                } else {
                    interaction.reply('The last ping was less than 24 hours ago');
                };
            };
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};