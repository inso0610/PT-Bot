const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

function cancelTeamup(id) {
    //const jsondata = {id: id}; 

    const options = {
        method: "DELETE", 
        headers: {
            "Content-Type": "application/json",
            "Teamup-Token": process.env.TEAMUP_TOKEN, 
            "Authorization": process.env.TEAMUP_LOGIN
        },
        //body: JSON.stringify(jsondata)
    };

    fetch(`https://api.teamup.com/335ezp/events/${id}`, options);
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('cancel-training')
    .setDescription('Cancel a training')
    .addStringOption((option) => 
        option
            .setName('id')
            .setDescription('What is the ID of the training?')
            .setRequired(true)),
    run: async ({ interaction, client, handler }) => {

        await interaction.deferReply({
            ephemeral: true
        });

        try {
            const trainingChannel = client.channels.cache.get('1246904420495523925');
            
            const idCMD = interaction.options.getString('id');

            const training = await trainings.findByIdAndDelete(idCMD).exec();

            if (!training) {
                return interaction.editReply({
                    content: 'This training does not exist.',
                    ephemeral: true
                });
            };

            cancelTeamup(training.teamupId);
    
            const cancelEmbed = new EmbedBuilder()
                .setTitle(`A ${training.trainingType} training was canceled!`)
                .setDescription(`**Info:**\n Time: <t:${training.timestamp}:F>\n Host: ${training.hostRobloxUsername}`);

            trainingChannel.send({
                embeds: [ cancelEmbed ]
            });

            interaction.editReply({
                content: 'Training canceled.',
                ephemeral: true
            })
        } catch (error) {
            console.warn(error)
            interaction.reply({
                content: 'Command failed. Did you use the correct ID?',
                ephemeral: true
            })
        }
    },
    opTeamOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};