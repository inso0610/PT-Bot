const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const applications = require('../../utils/applications');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Commands for applications')
        .addSubcommand(subcommand =>
            subcommand
                .setName('update-state')
                .setDescription('Update the state of an application')
                .addStringOption(option => option.setName('application').setDescription('What application are you editing?').setRequired(true).setAutocomplete(true))  // Enable autocomplete
                .addStringOption(option => 
                    option
                        .setName('status')
                        .setDescription('What is the new status?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Closed', value: 'Closed' },
                            { name: 'Opening soon', value: 'Opening soon' },
                            { name: 'Opening soon (Not Public)', value: 'Opening soon (Not Public)' },
                            { name: 'Open', value: 'Open' },
                            { name: 'Open (Not Public)', value: 'Open (Not Public)' },
                            { name: 'Closing soon', value: 'Closing soon' },
                            { name: 'Results out', value: 'Results out' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-feedback')
                .setDescription('Add feedback to an application')
                .addStringOption(option => option.setName('application').setDescription('What application are you editing?').setRequired(true).setAutocomplete(true))  // Enable autocomplete
                .addUserOption(option => option.setName('user').setDescription('Who is this feedback for?').setRequired(true))   
                .addStringOption(option => 
                    option
                        .setName('result')
                        .setDescription('Did the user pass or fail?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Pass', value: 'Pass' },
                            { name: 'Fail', value: 'Fail' }
                        ))),
    
    run: async ({ interaction, client, handler }) => {
        const subcommand = interaction.options.getSubcommand();

        if (interaction.guild === null) {
            interaction.reply({
                content: 'This command can not be ran in DM\'s.',
                ephemeral: true
            });
            return true;
        } else if (!interaction.member.roles.cache.has('1167782024040435752')) {
            interaction.reply({
                content: 'You do not have access to this command.',
                ephemeral: true
            });
            return true;
        };

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

        const collectResponse = async (prompt, edit) => {
            const DM = await sendDM(prompt, edit);
    
            if (Array.isArray(DM)) {
                return DM
            };
        
            return new Promise((resolve, reject) => {
                const collector = interaction.user.dmChannel.createMessageCollector({
                    filter: i => i.author.id === interaction.user.id,
                    time: 120_000,
                    max: 1
                });
        
                collector.on('collect', i => resolve(i.content));
                collector.on('end', (_, reason) => {
                    if (reason === 'time') {
                        interaction.user.send("You took too long to respond. Please try again.");
                        reject(new Error("Timeout"));
                    }
                });
            });
        };

        if (subcommand === 'update-state') {
            const applicationString = interaction.options.getString('application');
            const status = interaction.options.getString('status');
    
            // Fetch the application
            const application = await applications.findOne({ role: applicationString }).exec();
            if (!application) {
                return interaction.reply({
                    content: 'This application does not exist!',
                    ephemeral: true
                });
            };
    
            // Handle application state update (example, adjust as needed)
            const previousStatus = application.status;
    
            application.status = status;
    
            if (previousStatus === 'Results out' && application.status !== 'Results out') {
                application.results = {};

                application.markModified('results');
    
                await application.save();
    
                interaction.reply({ content: `Application status updated successfully! The bot has also cleared all feedback`, ephemeral: true });
            } else {
                interaction.reply({ content: `Application status updated successfully!`, ephemeral: true });
    
                await application.save();
            };
        } else if (subcommand === 'add-feedback') {
            try {
                const applicationString = interaction.options.getString('application');
                const user = interaction.options.getUser('user');
                const result = interaction.options.getString('result');
    
                const application = await applications.findOne({ role: applicationString }).exec();
                if (!application) {
                    return interaction.reply({
                        content: 'This application does not exist!',
                        ephemeral: true
                    });
                };
    
                interaction.reply({
                    content: 'Please check your DMs',
                    ephemeral: true
                });
    
                const feedback = await collectResponse('Please reply with the feedback for the user. Reply with `cancel` if you want to cancel.', true)
    
                if (Array.isArray(feedback)) {
                    return
                };
                
                if (feedback === 'cancel') {
                    sendDM('The feedback creation system has stopped.', true)
                    return
                };

                application.results[user.id] = {
                    result: result,
                    feedback: feedback
                };

                application.markModified(`results.${user.id}`);

                await application.save();

                sendDM('The feedback has been saved.', true);
            } catch (error) {
                if (error.message === "Timeout") return;

                await interaction.user.send('Something failed in the feedback system.').catch();

                console.warn(`Ticket creator error: ${error}`);
            };
        };
    },

    autocomplete: async ({ interaction, client, handler }) => {
        // Fetch applications asynchronously
        const focusedValue = interaction.options.getFocused();  // Get user input
        const allApplications = await applications.find().exec();

        // Filter and map applications based on user input for autocomplete suggestions
        const filtered = allApplications
            .filter(app => app.role.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25)  // Discord supports a max of 25 choices
            .map(app => ({ name: app.role, value: app.role }));

        await interaction.respond(filtered);
    },

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
