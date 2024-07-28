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
            '1025727327461703720':`# Platform Manager application results:
            ✅ 👏 | Congratulations you passed the Platform Manager application!
                            
            ## Feedback:
            Your answers were short, but you showd that you had a good amount of knowledge on the role of Dispatcher. The only big error you did was that you did not know when proceed should be used and when shunt with caution should be used.`,

            '606391401889923073':`# Platform Manager application results:
            ❌ | I'm sorry, but you have failed the Platform Manager application.
                            
            ## Feedback:
            Your answers were short and you were unable to answer most questions.`
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