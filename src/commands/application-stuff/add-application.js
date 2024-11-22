const { SlashCommandBuilder } = require('discord.js');
const applications = require('../../utils/applications.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('add-application')
    .setDescription('Add a new application to the application system. (Bot dev only)')
    .addStringOption((option) => 
        option
            .setName('role')
            .setDescription('What role is the application for?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('department')
            .setDescription('What department is the application for?')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const role = interaction.options.getString('role');
        const department = interaction.options.getString('department');

        const existing = await applications.findOne( {role: role} ).exec();

        if (existing) {
            interaction.reply({
                content: 'This application already exists in the system!',
                ephemeral: true
            });
            return;
        };

        const applicationSchema = new applications({
            role: role,
            department: department
        });

        applicationSchema.save();

        interaction.reply({
            content: 'Hopefully added lol',
            ephemeral: true
        });
    },
    gaOnly: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};