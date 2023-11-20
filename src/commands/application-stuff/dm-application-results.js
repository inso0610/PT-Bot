const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with Driver Manager application results.'),

    run: async ({ interaction, client, handler }) => {
        let feedbackEmbed = new EmbedBuilder()
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
        
            if (interaction.user.id === '764095520440188978') {
                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Signaller Manager application results:

                    ❌ | I'm sorry, but you have failed the Signaller Manager application.
                
                    ## Feedback:
                    Your application fails to explain alot of your answers and we have not been able to get a good idea of why we should pick you.
                    You got all the signal questions correctly.
                    You failed the priority and Zone A signalling questions.
                    Remember that shorter train numbers have priority.
                    You gave a precise explanation on the signal setting screen.
                    You had an ok idea on what to do in the scenarios, but you failed to explained why you would do those actions.`);

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

            } else if (interaction.user.id === '661550221381206037') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Signaller Manager application results:

                    ❌ | I'm sorry, but you have failed the Signaller Manager application.
                
                    ## Feedback:
                    Your application fails to explain alot of your answers and we have not been able to get a good idea of why we should pick you.
                    You got all the signal questions correctly.
                    You failed the priority and Zone A signalling questions.
                    Remember that shorter train numbers have priority.
                    You gave a short explenation on the signal setting screen.
                    I would have liked some more reasoning on the scenario questions.`);

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

            } else if (interaction.user.id === '1041709666167685140') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Signaller Manager application results:

                    ✅ 👏 | Congratulations you passed the Signaller Manager application!
                
                    ## Feedback:
                    Even though you could have explained better in the first part we have decided to pass you because you gave us the scense that you are the right person for the role.
                    You got all signals correctly.
                    You passed the priority and Zone A signalling questions.
                    I would have liked to see a better explenation on the signal setting screen.
                    You handled the scenarios in a good way, but note that managers can demote people without contating higher ranked people, but we know that most people wouldn't know this.`);

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

            } else if (interaction.user.id === '1004003667940225105') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Signaller Manager application results:

                    ✅ 👏 | Congratulations you passed the Signaller Manager application!
                
                    ## Feedback:
                    Your application was good and it was easy to see what you were meaning in your answers, but you got some questions wrong.
                    Some places your answers were short like in the question \"Why do you want to become a SM?\".
                    One of the answers on the signal questions were incorrect you answered \"Proceed as usaul\" on both the proceed signals, but you failed to recognize that one of them was set to proceed via diverging. 
                    On the rest of the signal questions your answers were correct.
                    You got the priority question completely correct.
                    On the zone A signalling question you failed to recognize that it is not possible to send trains from the track marked with yellow to the track marked with purple.
                    This is because of the fact that the junction between them is only a crossing point between two rail and not an actual junction.
                    On the question where you are supposed to explain the signalling screen for setting signals you were correct.
                    On the scenarios your answers worked.`);

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

            } else if (interaction.user.id === '546727002061930512') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Signaller Manager application results:

                    ✅ 👏 | Congratulations you passed the Signaller Manager application!
                
                    ## Feedback:
                    Your application was really good and there is nothing much to comment on.`);

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
            }
        },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};