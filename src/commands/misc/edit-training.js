const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const trainings = require('../../utils/trainings.js');

function updateTeamup(newStartDate, type, id, host) {
    const endDate = new Date(newStartDate);
    endDate.setMinutes(newStartDate.getMinutes() + 60);

    const startISO = newStartDate.toISOString().replace('.000','');
    const endISO = endDate.toISOString().replace('.000','');

    let subcalendar

    if (type === 'Driver') {
        subcalendar = 13324153;
    } else if (type === 'Conductor') {
        subcalendar = 13324155;
    } else if (type === 'Dispatcher') {
        subcalendar = 13324157;
    } else if (type === 'Signaller') {
        subcalendar = 13324160;
    };

    const jsondata = {id: id, subcalendar_ids: [subcalendar], start_dt: startISO, end_dt: endISO, title: `${type} training`, who: host, signup_enabled: false, comments_enabled: false};

    const options = {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json",
            "Teamup-Token": process.env.TEAMUP_TOKEN, 
            "Authorization": process.env.TEAMUP_LOGIN
        },
        body: JSON.stringify(jsondata)
    };

    fetch(`https://api.teamup.com/335ezp/events/${id}`, options);
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit-training-time')
    .setDescription('Edit the date and time of the training.')
    .addStringOption((option) => 
        option
            .setName('id')
            .setDescription('What is the ID of the training?')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('date')
            .setDescription('Format: dd/mm/yyyy. Use UTC time!')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('time')
            .setDescription('Format: hh:mm. Use UTC time!')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const trainingChannel = client.channels.cache.get('1246904420495523925');
        
        const idCMD = interaction.options.getString('id')
        const updatedDateCMD = interaction.options.getString('date');
        const updatedStartCMD = interaction.options.getString('time');

        await interaction.deferReply({
            ephemeral: true
        });

        try {
            const splitDate = updatedDateCMD.split('/');
            const splitTime = updatedStartCMD.split(':');
    
            const dateCMD = new Date(Date.UTC(splitDate[2], splitDate[1]-1, splitDate[0], splitTime[0], splitTime[1]));
    
            const timestampMilli = dateCMD.getTime();
            const timestampCMD = Math.floor(timestampMilli / 1000);
            
            const training = await trainings.findById(idCMD).exec();
    
            const type = training.trainingType;
            const oldTimestamp = training.timestamp;
            const teamupId = training.teamupId;
            const rblxName = training.hostRobloxUsername;

            updateTeamup(dateCMD, type, teamupId, rblxName);
    
            training.date.setUTCFullYear(splitDate[2], splitDate[1]-1, splitDate[0]);
            training.date.setUTCHours(splitTime[0], splitTime[1]);
    
            training.timestamp = timestampCMD;
    
            training.markModified('date');
    
            await training.save();
    
            const timeChangedEmbed = new EmbedBuilder()
                .setTitle(`A ${type} training has changed!`)
                .setDescription(`Time: <t:${oldTimestamp}:F> -> <t:${training.timestamp}:F> \n**Info:** \nHost: ${rblxName}`)
    
            trainingChannel.send({
                embeds: [ timeChangedEmbed ]
            });
    
            interaction.editReply({
                content: 'Updated!',
                ephemeral: true
            });
        } catch (error) {
            interaction.editReply({
                content: 'Command failed. Did you use the correct ID?',
                ephemeral: true
            });
            console.warn(error);
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