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
        
            if (interaction.user.id === '683727255943512065') {
                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    ✅ 👏 | Congratulations you passed the Driver Manager application!
                
                    ## Feedback:
                    Your application looks really good, but I want you to improve on these points during your training period:
                    You should improve your knowledge on signals.
                    Also remember that you are allowed to demote people when they are not following the rules.`);

                try {
                    interaction.user.send({
                        embeds: [ feedbackEmbed ]
                    });
                interaction.reply({
                    content: 'Your feedback has been sent to your DM\'s.',
                    ephemeral: true
                });
                } catch (error) {
                    interaction.reply({
                        content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                        ephemeral: true
                    });
                
                    console.log(error);
                }

            } else if (interaction.user.id === '1102514225181630476') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    ❌ | Congratulations you passed the Driver Manager application!
                
                    ## Feedback:
                    Mostly your application lacked in reasoning and explenation.
                    Something that I think is great is how well your knowledge on our signal system is. 
                    Had you elaborated more on your application you would have passed.`);

                try {
                    interaction.user.send({
                        embeds: [ feedbackEmbed ]
                    });
                interaction.reply({
                    content: 'Your feedback has been sent to your DM\'s.',
                    ephemeral: true
                });
                } catch (error) {
                    interaction.reply({
                        content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                        ephemeral: true
                    });
                
                    console.log(error);
                }
            
            } else if (interaction.user.id === '1004003667940225105') {
                
                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    ✅ 👏 | Congratulations you passed the Driver Manager application!
                
                    ## Feedback:
                    Your application looks good and I can see that you are engaged in Polar Tracks.
                    I would also like to remind you that as a Driver Manager you are a mod and you should also concider demoting people when not following the driving rules.`);

                try {
                    interaction.user.send({
                        embeds: [ feedbackEmbed ]
                    });
                interaction.reply({
                    content: 'Your feedback has been sent to your DM\'s.',
                    ephemeral: true
                });
                } catch (error) {
                    interaction.reply({
                        content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                        ephemeral: true
                    });
                
                    console.log(error);
                }

            } else if (interaction.user.id === '873555071747637258') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    ❌ | Congratulations you passed the Driver Manager application!
                
                    ## Feedback:
                    Mostly your application lacked in reasoning and explenation.
                    You should also read up on our signals in our driver guide (https://drive.google.com/file/d/1qiDRksoauycsIStmTyMYYmXAQAmO2zCq/view?usp=sharing)`);

                try {
                    interaction.user.send({
                        embeds: [ feedbackEmbed ]
                    });
                interaction.reply({
                    content: 'Your feedback has been sent to your DM\'s.',
                    ephemeral: true
                });
                } catch (error) {
                    interaction.reply({
                        content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                        ephemeral: true
                    });
                
                    console.log(error);
                }
            
            } else if (interaction.user.id === '859003676114812939') {

                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    ❌ | Congratulations you passed the Driver Manager application!
                
                    ## Feedback:
                    Mostly your application lacked in reasoning and explenation.
                    You should also read up on our signals in our driver guide (https://drive.google.com/file/d/1qiDRksoauycsIStmTyMYYmXAQAmO2zCq/view?usp=sharing)`);

                try {
                    interaction.user.send({
                        embeds: [ feedbackEmbed ]
                    });
                interaction.reply({
                    content: 'Your feedback has been sent to your DM\'s.',
                    ephemeral: true
                });
                } catch (error) {
                    interaction.reply({
                        content: 'I was not able to send you a DM. Maybe try checking if you allow DM\'s from this server.',
                        ephemeral: true
                    });
                
                    console.log(error);
                }
            
            } else {
                interaction.reply({
                    content: `We do not have any feedback ready for you. This could be because we have not finished writing it or you have not applied for driver manager.`,
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