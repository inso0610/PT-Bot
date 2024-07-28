const { SlashCommandBuilder, EmbedBuilder, messageLink } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with your latest application results.'),

    run: async ({ interaction, client, handler }) => {

        /*
        Templates:
        Pass: 
        `# (Type) Manager application results:
        ✅ 👏 | Congratulations you passed the (Type) Manager application!
                            
        ## Feedback:
        -`

        Fail:
        `# (Type) Manager application results:
        ❌ | I'm sorry, but you have failed the (Type) Manager application.
                            
        ## Feedback:
        -`
        */

        const feedback = {
            '797752888347852850':`# Signaller Manager application results:
            ✅ 👏 | Congratulations you passed the Signaller Manager application!
                            
            ## Feedback:
            You answers were all short and did not explain to us why we should pick you. Even though Caiber wanted you to apply answering "Because cabier wants me" is not good enough. Your signalling knowledge is good and you passed that part however your answers in the general questions part were not good enough.`,

            '796031038203494420':`# Signaller Manager application results:
            ❌ | I'm sorry, but you have failed the Signaller Manager application.
                            
            ## Feedback:
            Your answers were short in the general questions part. You knew most of the signalling theory, but yellow means that the signal is set to diverging not that the switches are getting set like you wrote.`,

            '1102514225181630476':`# Signaller Manager application results:
            ❌ | I'm sorry, but you have failed the Signaller Manager application.
                            
            ## Feedback:
            Your answers in the general questions part were good and you knew the signalling theory. However there were better candidates. If you apply when the next application open's you will probably pass.`,
            
            '1004003667940225105':`# Signaller Manager application results:
            ✅ 👏 | Congratulations you passed the Signaller Manager application!
                            
            ## Feedback:
            Your answers in the general questions part were good and your signalling theory answers were really good.`
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
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};