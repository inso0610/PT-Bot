const { SlashCommandBuilder, EmbedBuilder, messageLink } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with your latest application results.'),

    run: async ({ interaction, client, handler }) => {

        const feedback = {
            533678124823478278:`# Driver Manager application results:
            ✅ 👏 | Congratulations you passed the Driver Manager application!
                            
            ## Feedback:
            Gratulerer! Din søknad var utfyllende og det vi lette etter! Dessverre har du kun mulighet til å kun være en type manager. Derfor må du velge mellom PM eller DM, for å ikke skape kaos og ikke for mye jobb slik at det blir tull i systemet. Når du har valgt hvilke manager du ønsker å bli kan du sende melding til våres OM O_Tidemann eller OD Caiber06!`,

            1041709666167685140:`# Driver Manager application results:
            ❌ | I'm sorry, but you have failed the Driver Manager application.
                            
            ## Feedback:
            You wrote a bit briefly, but in terms of knowledge about driving, you covered everything except for what a driver should do when approaching a signal that looks like this. Both signals apply here (Shunt signal and main signal). In this case, I would indicate that there is a signal error and contact the train conductor. Regarding the scenarios, you addressed them appropriately. However, in the scenario where a driver went AFK on the track, you didn't specify that you would contact the signaller and confront the driver. It's important to clarify that when mentioning contacting the driver, it should be after initially contacting the signaller.`
        };

        const omChat = client.channels.cache.get('1159950672322633809');

        omChat.send({
            content: `Emilsen getting statistics: <@${interaction.user.id}> used </dm-results:1159940990614904895>`
        });

        try {
            const feedbackEmbed = new EmbedBuilder()
                .setTitle('Application Feedback')
                .setDescription(feedback[interaction.user.id*1]);

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