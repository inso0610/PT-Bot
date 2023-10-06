const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with Driver Manager application results.'),

    run: async ({ interaction, client, handler }) => {
        let feedbackEmbed = new EmbedBuilder()
            .setTitle('Application Feedback')
            .setDescription(`# Driver Manager application results:

            :white_check_mark: :clap: | Congratulations you passed the Driver Manager application!
                
            ## Feedback:
            -`);
        
            if (interaction.user.id === '683727255943512065') {
                feedbackEmbed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# Driver Manager application results:

                    :white_check_mark: :clap: | Congratulations you passed the Driver Manager application!
                
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
        deleted: true,
    },
};