const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const applications = require('../../utils/applications');

function passFail(application, result) {
    if (result === 'Pass') {
        return `✅ 👏 | Congratulations you passed the ${application} application!`
    } else {
        return `❌ | I'm sorry, but you have failed the ${application} application.`
    }
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dm-results')
    .setDescription('Sends a DM with your latest application results.'),

    run: async ({ interaction, client, handler }) => {

        const sendDM = async (messageContent, edit) => {
            if (!edit) {
                return interaction.user.send(messageContent).catch(e => {    
                    interaction.reply({
                        content: "I can't DM you, please check your DM settings!"
                    }).catch(e2 => {
                        console.warn(e2);
                    });
                    console.warn(e);
        
                    return [e]
                });
            } else {
                return interaction.user.send(messageContent).catch(e => {    
                    interaction.editReply({
                        content: "I can't DM you, please check your DM settings!"
                    }).catch(e2 => {
                        console.warn(e2);
                    });
                    console.warn(e);
        
                    return [e]
                });
            };
        };

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

        try {
            const application = await applications.find({
                status: 'Results out',
                [`results.${interaction.user.id}`]: { $exists: true }
            }).exec();

            if (!application[0]) {
                interaction.reply({
                    content: 'We have no feedback for you.',
                    ephemeral: true
                });

                return;
            };
    
            application.forEach(async app => {
                const embed = new EmbedBuilder()
                    .setTitle('Application Feedback')
                    .setDescription(`# ${app.role} application results:\n${passFail(app.role,app.results[interaction.user.id].result)}\n\n## Feedback:\n${app.results[interaction.user.id].feedback}`)

                const DM = await sendDM({embeds: [embed]})

                if (Array.isArray(DM)) return;
            });

            interaction.reply({
                content: 'Your application results have been sent in your DMs.',
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