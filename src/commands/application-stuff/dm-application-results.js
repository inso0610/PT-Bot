const { SlashCommandBuilder, EmbedBuilder, messageLink } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with your latest application results.'),

    run: async ({ interaction, client, handler }) => {

        const feedback = {
            '702567973029937202':`# Driver Manager application results:
            ❌ | I'm sorry, but you have failed the Driver Manager application.
                            
            ## Feedback:
            Your answers were short and we would have liked to see longer answers. In the question about the signal with one green light your answer was wrong and it should have been that they have to proceed at a slower speed.`,

            '1041709666167685140':`# Driver Manager application results:
            ❌ | I'm sorry, but you have failed the Driver Manager application.
                            
            ## Feedback:
            Your answers were short and we would have liked to see longer answers.`,

            '710893501969203213':`# Driver Manager application results:
            ❌ | I'm sorry, but you have failed the Driver Manager application.
                            
            ## Feedback:
            Your answers were good and your experience as the previous OD really helped, but other applicants were more fit for the position.`,
            
            '859061925140365322':`# Driver Manager application results:
            ✅ 👏 | Congratulations you passed the Driver Manager application!
                            
            ## Feedback:
            Your answers were good and your experience really helped.`
        };

        const omChat = client.channels.cache.get('1159950672322633809');

        omChat.send({
            content: `Emilsen getting statistics: <@${interaction.user.id}> used </dm-results:1159940990614904895>`
        });

        try {
            const feedbackEmbed = new EmbedBuilder()
                .setTitle('Application Feedback')
                .setDescription(feedback[interaction.user.id]);

                const message = await interaction.user.send({
                    embeds: [feedbackEmbed]
                })
    
                interaction.reply({
                    content: `Your feedback has been sent! ${messageLink(message.channelId, message.id)}`,
                    ephemeral: true
                });

        } catch (error) {
            console.log(error);
            interaction.reply({
                content: 'Failed to get feedback. Expecting feedback? Please create a ticket!',
                ephemeral: true
            });
            return
        };

        /*let feedbackEmbed = new EmbedBuilder()
            .setTitle('Application Feedback')
            .setDescription(`# Driver Manager application results:

            ✅ 👏 | Congratulations you passed the Driver Manager application!
                
            ## Feedback:
            -`);

        await interaction.deferReply({
            content: 'Wait...',
            ephemeral: true
        });

        const omChat = client.channels.cache.get('1159950672322633809');

        omChat.send({
            content: `Emilsen getting statistics: <@${interaction.user.id}> used </dm-results:1159940990614904895>`
        })
        
        if (interaction.user.id === '') {
            feedbackEmbed = new EmbedBuilder()
                .setTitle('Application Feedback')
                .setDescription(`# Signaller Manager application results:

                ❌ | I'm sorry, but you have failed the Signaller Manager application.
                
                ## Feedback:
                -`);

            try {
                interaction.user.send({
                    embeds: [ feedbackEmbed ]
                });
                interaction.editReply({
                content: 'Your feedback has been sent to your DM\'s.',
                ephemeral: true
            });
            } catch (error) {
                interaction.editReply({
                    content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                    ephemeral: true
                });
                
                console.log(error);
            }

        } else {
            interaction.editReply({
                content: `We do not have any feedback ready for you. This could be because we have not finished writing it or you have not applied for signaller manager.`,
                ephemeral: true
            })
        }*/
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};