const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

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
        try {
            const trainingChannel = client.channels.cache.get('1218883814491820134');
            
            const idCMD = interaction.options.getString('id');

            const training = await trainings.findByIdAndDelete(idCMD).exec();
    
            const cancelEmbed = new EmbedBuilder()
                .setTitle(`A ${training.trainingType} training was canceled!`)
                .setDescription(`**Info:**\n Time: <t:${training.timestamp}:F>\n Host: ${training.hostRobloxUsername}`);

            trainingChannel.send({
                embeds: [ cancelEmbed ]
            });

            interaction.reply({
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