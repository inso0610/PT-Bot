const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, resolveColor, resolvePartialEmoji, MessageComponentInteraction } = require('discord.js')

module.exports = {
    deleted: false,
    data: new SlashCommandBuilder()
    .setName('host-training')
    .setDescription('Sends a training announcement to training announcements')
    .addStringOption((option) => 
        option
            .setName('server-link')
            .setDescription('Paste the private server link here.')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('time')
            .setDescription('The time the server link gets sent. Type the time in CST/CEST here.')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('lock-time')
            .setDescription('The time the server gets locked. Type the training time in CST/CEST here.')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('training-type')
            .setDescription('What type of training are you hosting?')
            .setRequired(true)
            .addChoices(
                { name: 'Driver', value: 'Driver' },
                { name: 'Conductor', value: 'Conductor' },
                { name: 'Dispatcher', value: 'Dispatcher' },
                { name: 'Signaller', value: 'Signaller' }
            )),

    run: async ({ interaction, client }) => {
        const dashboardChannel = client.channels.cache.get('1152682843428900874');
        const trainingChannel = client.channels.cache.get('1140281500496035940');
        const serverLink = interaction.options.getString('server-link');
        const time = interaction.options.getString('time');
        const lockTime = interaction.options.getString('lock-time');
        const trainingType = interaction.options.getString('training-type');
        const avatarURL = "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg"
        // const trainingPing = '<@&1140220447535923200>'
        const trainingPing = '<@935889950547771512>'
        let linkMessage

        const gameLink = new ButtonBuilder()
            .setLabel('Play here!')
            .setURL('https://www.roblox.com/games/12894431123/Polar-Tracks-Railway')
            .setStyle(ButtonStyle.Link);

        const gameRow = new ActionRowBuilder()
			.addComponents(gameLink);

        const startButton = new ButtonBuilder()
            .setCustomId('startTraining')
            .setLabel('Start Training')
            .setStyle(ButtonStyle.Success);

        const dashboardRow = new ActionRowBuilder()
            .addComponents(startButton);

        const lockServer = new ButtonBuilder()
            .setCustomId('lockServer')
            .setLabel('Server Locked')
            .setStyle(ButtonStyle.Danger);
            
        let joinTraining

        try {
            joinTraining = new ButtonBuilder()
                .setLabel('Join the training here!')
                .setURL(serverLink)
                .setStyle(ButtonStyle.Link);
        } catch (error) {
            interaction.reply({
                content: 'The training link you entered is not a link.',
                ephemeral: true
            }); return
        }
        const lockRow = new ActionRowBuilder()
            .addComponents(lockServer, joinTraining)

        const joinRow = new ActionRowBuilder()
            .addComponents(joinTraining)

        const lockedServerButton = new ButtonBuilder()
            .setCustomId('serverLocked')
            .setLabel('Server Locked')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const lockedRow = new ActionRowBuilder()
            .addComponents(lockedServerButton);

        const trainingAnnouncement = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag, 
            iconURL: avatarURL, 
            //url: 'https://discord.js.org'
        })
        .setTitle(`${trainingType} Training!`)
        .setDescription(`Time: ${time} CEST
        
        Before you join I recommend checking out <#1140253645686976542>.
        
        You should also check out our game before joining to familiarise yourself with it.
        
        **React if you are attending!**`);

        const trainingAnnouncement2 = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag, 
            iconURL: avatarURL, 
            //url: 'https://discord.js.org'
        })
        .setTitle(`${trainingType} Training!`)
        .setDescription(`# Welcome to ${trainingType} training!
        
        **Spawn as a passenger at Grefsen and line up on the white line.**
        
        Locking at ${lockTime} CEST`);

        const trainingDashboard = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag, 
            iconURL: avatarURL, 
            //url: 'https://discord.js.org'
        })
        .setTitle(`${trainingType} Training Dashboard for ${interaction.user.tag}`)
        .setDescription(`# Training Info:
        Time: ${time} CEST
        
        Before you join I recommend checking out <#1140253645686976542>.
        
        You should also check out our game before joining to familiarise yourself with it.

        -----------------------------------------------------------------------------------
        
        Press the Start Training button when you want to send the training link.`);

        const trainingDashboard2 = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag, 
            iconURL: avatarURL, 
            //url: 'https://discord.js.org'
        })
        .setTitle(`${trainingType} Training Dashboard for ${interaction.user.tag}`)
        .setDescription(`# Training Info:
        Time: ${time} CEST
        
        Before you join I recommend checking out <#1140253645686976542>.
        
        You should also check out our game before joining to familiarise yourself with it.

        -----------------------------------------------------------------------------------
        
        Press the Server Locked button when you have locked the server.`);

        const trainingAnnouncementMessage = await trainingChannel.send({
            content: trainingPing,
            embeds: [trainingAnnouncement],
            components: [gameRow]
        });

        trainingAnnouncementMessage.react('1135893701403623594')

        interaction.reply({
            content: 'Message sent.',
            ephemeral: true
        })

        let response = await dashboardChannel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [trainingDashboard],
            components: [dashboardRow]
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            let confirmation = await response.awaitMessageComponent({ filter: collectorFilter });

            if (confirmation.customId === 'startTraining') {
                    linkMessage = await trainingChannel.send({
                        content: trainingPing,
                        embeds: [trainingAnnouncement2],
                        components: [joinRow]
                })  

                confirmation.reply({
                    content: 'Training link sent.',
                });

                response.delete()

                response = await dashboardChannel.send({
                    content: `<@${interaction.user.id}>`,
                    embeds: [trainingDashboard2],
                    components: [lockRow]
                })
            } else {
                interaction.reply('Skill Issue')
            }

            confirmation = await response.awaitMessageComponent({ filter: collectorFilter });

            if (confirmation.customId === 'lockServer'){

                await linkMessage.edit({
                    content: trainingPing,
                    embeds: [trainingAnnouncement2],
                    components: [lockedRow]
                });

                linkMessage.reply('Server Locked.')

                response.edit({
                    content: `<@${interaction.user.id}>\n Server Locked.`,
                    embeds: [],
                    components: []
                });
                confirmation.reply({
                    content: 'Lock message sent.',
                    ephemeral: true
                });
            } 
            
        } catch (e) {
            await interaction.editReply({ content: 'Skill Issue Emil', components: [] });
            console.log(e)
        }
        
    },
    opTeamOnly: true,
}