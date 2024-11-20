const { SlashCommandBuilder } = require('discord.js')
const deadChat = require('../../utils/storedDates.js');

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

        const englishChat = client.channels.cache.get('1101035696334057483');

        function ping() {
            englishChat.send(`<@&1308429122975957132> requested by <@${interaction.user.id}>`);

            interaction.reply({
                content: 'Finished',
                ephemeral: true
            });

            deadChatSchema.save();
        };

        let deadChatSchema = await deadChat.findOne( {type: 'Dead Chat'} ).exec();

            if (!deadChatSchema) {
                deadChatSchema = new deadChat({
                    type: 'Dead Chat',
                    date: Date.now()
                });

                ping()
            } else {
                const difference = Math.round(Date.now() - deadChatSchema.date.getTime()) / 1000;

                deadChatSchema.date = Date.now();

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