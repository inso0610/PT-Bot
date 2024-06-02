const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('start-training')
    .setDescription('Start a training')
    .addStringOption((option) => 
        option
            .setName('id')
            .setDescription('What is the ID of the training?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('server-link')
            .setDescription('What is the private server link?')
            .setRequired(true)
            .addChoices(
                { name: 'PT1', value: 'https://www.roblox.com/share?code=e6e32219daff7848849aa8a449367a83&type=Server' },
                { name: 'PT2', value: 'https://www.roblox.com/share?code=82502c8eb749614fa836d16bcdf26ae6&type=Server' },
                { name: 'Custom', value: 'Custom' },
            ))
    .addStringOption((option) => 
        option
            .setName('spawn')
            .setDescription('Where should people spawn?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('custom-link')
            .setDescription('What link do you want to use? (Use is you selected Custom in the server-link option.')
            .setRequired(false)),
    run: async ({ interaction, client, handler }) => {
        try {
            const trainingChannel = client.channels.cache.get('1246904420495523925');
            
            const idCMD = interaction.options.getString('id');
            let link = interaction.options.getString('server-link');
            const cLinkCMD = interaction.options.getString('custom-link') ?? 'https://www.roblox.com/share?code=e6e32219daff7848849aa8a449367a83&type=Server'
            const spawn = interaction.options.getString('spawn');

            if (link === 'Custom') {
                link = cLinkCMD;
            };

            const training = await trainings.findByIdAndDelete(idCMD).exec();

            const linkButton = new ButtonBuilder()
			.setLabel('Join here!')
            .setURL(link)
			.setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder()
			.addComponents(linkButton);

            const startEmbed = new EmbedBuilder()
                .setTitle(`A ${training.trainingType} training is starting!`)
                .setFields(
                    { name: 'Host:', value: training.hostRobloxUsername },
                    { name: 'Starting in:', value: `<t:${training.timestamp}:R>` },
                    { name: 'Spawn at:', value: spawn }
                );

            trainingChannel.send({
                content: '<@&1140220447535923200>',
                embeds: [startEmbed],
                components: [row],
            });

            interaction.reply({
                content: 'Training started.',
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