const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const model = require('../../utils/trainings.js')

function getRobloxId(id) {
    const functionResult = fetch(`https://api.blox.link/v4/public/guilds/1089282844657987587/discord-to-roblox/${id.toString()}`, { method: "GET", headers: { "Authorization": "66ef19b6-b0f6-41f4-b883-63d833484ac6" } })
	    .then((response) => response.json())
	    .then((data) => {
            try {
                const responseData = JSON.parse(JSON.stringify(data));

                const robloxID = responseData.robloxID.toString();
                const username = responseData.resolved.roblox.name.toString();

                const userInfo = [robloxID, username];
                return userInfo;
            } catch (error) {
                console.warn(error)
                return error
            };
        });
    return functionResult;
};

function scheduleTeamup(startDate, type, host) {
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + 60);

    const startISO = startDate.toISOString().replace('.000','')
    const endISO = endDate.toISOString().replace('.000','')

    let subcalendar

    if (type === 'Driver') {
        subcalendar = 13324153
    } else if (type === 'Conductor') {
        subcalendar = 13324155
    } else if (type === 'Dispatcher') {
        subcalendar = 13324157
    } else if (type === 'Signaller') {
        subcalendar = 13324160
    };

    const jsondata = {subcalendar_ids: [subcalendar], start_dt: startISO, end_dt: endISO, title: `${type} training`, who: host, signup_enabled: false, comments_enabled: false};

    const options = {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
            "Teamup-Token": process.env.TEAMUP_TOKEN, 
            "Authorization": process.env.TEAMUP_LOGIN
        },
        body: JSON.stringify(jsondata)
    };

    const functionResult = fetch('https://api.teamup.com/335ezp/events', options)
        .then((response) => response.json())
        .then((data) => {
            try {
                const responseData = JSON.parse(JSON.stringify(data));
    
                return responseData.event.id;
            } catch (error) {
                console.warn(JSON.parse(JSON.stringify(data)));
                return 'Error';
            };
        });

    return functionResult;
};

module.exports = {
    data: new SlashCommandBuilder()
    .setName('schedule-training')
    .setDescription('Scheduled a training')
    .addStringOption((option) => 
        option
            .setName('type')
            .setDescription('What type of training are you hosting?')
            .setRequired(true)
            .addChoices(
				{ name: 'Driver', value: 'Driver' },
				{ name: 'Conductor', value: 'Conductor' },
				{ name: 'Dispatcher', value: 'Dispatcher' },
                { name: 'Signaller', value: 'Signaller' }
			))

    .addStringOption((option) => 
        option
            .setName('date')
            .setDescription('Format: dd/mm/yyyy. Use UTC time!')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('time')
            .setDescription('Format: hh:mm. Use UTC time!')
            .setRequired(true))

    .addStringOption((option) => 
        option
            .setName('additional-info')
            .setDescription('Write any additional info about the training here.')
            .setRequired(false))
            
    .addUserOption((option) => 
        option
            .setName('host')
            .setDescription('Who is hosting the training?')
            .setRequired(false)),

    run: async ({ interaction, client, handler }) => {
        interaction.deferReply({
            ephemeral: true
        });

        try {
            const hostCMD = interaction.options.getUser('host') ?? interaction.user;
            const id = hostCMD.id
            const trainingTypeCMD = interaction.options.getString('type');
            const scheduledDateCMD = interaction.options.getString('date');
            const scheduledStartCMD = interaction.options.getString('time');
            const additionalInfoCMD = interaction.options.getString('additional-info') ?? 'No additional information.';

            const trainingChannel = client.channels.cache.get('1246904420495523925');
            
            const userInfo = await getRobloxId(id);
            if (!Array.isArray(userInfo)) {
                console.log(userInfo)
                interaction.editReply({
                    content: 'The command failed. Contact Emilsen.',
                    ephemeral: true
                });
                return;
            };
            const rblxId = userInfo[0];
            const rblxName = userInfo[1];

            const splitDate = scheduledDateCMD.split('/')
            const splitTime = scheduledStartCMD.split(':')

            const dateCMD = new Date(Date.UTC(splitDate[2], splitDate[1]-1, splitDate[0], splitTime[0], splitTime[1]));

            const timestampMilli = dateCMD.getTime();
            const timestampCMD = Math.floor(timestampMilli / 1000);

            const teamupId = await scheduleTeamup(dateCMD, trainingTypeCMD, rblxName);

            if (teamupId === 'Error') {
                return;
            };
    
            const newTraining = new model({
                hostDiscordId: id,
                hostRobloxId: rblxId,
                hostRobloxUsername: rblxName,
                trainingType: trainingTypeCMD,
                date: dateCMD,
                timestamp: timestampCMD.toString(),
                additionalInfo: additionalInfoCMD,
                teamupId: teamupId
            });
    
            await newTraining.save();

            const trainingId = newTraining._id.toString();

            const trainingEmbed = new EmbedBuilder()
                .setTitle('You have been assigned to a training!')
                .setDescription(`**When making changes use this id: ${trainingId}**`)
                .addFields(
                    { name: 'Host Discord ID:', value: id },
                    { name: 'Host Roblox ID:', value: rblxId },
                    { name: 'Host Roblox Username:', value: rblxName },
                    { name: 'Training Type:', value: trainingTypeCMD },
                    { name: 'Scheduled Date in UTC:', value: scheduledDateCMD },
                    { name: 'Scheduled Start in UTC:', value: scheduledStartCMD },
                    { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                    { name: 'Additional Info:', value: additionalInfoCMD }
                )
                .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.'});

            if (hostCMD != interaction.user) {
                const creatorEmbed = new EmbedBuilder()
                .setTitle('You have created a training for another user.')
                .setDescription(`**When making changes use this id: ${trainingId}**`)
                .addFields(
                    { name: 'Host Discord ID:', value: id },
                    { name: 'Host Roblox ID:', value: rblxId },
                    { name: 'Host Roblox Username:', value: rblxName },
                    { name: 'Training Type:', value: trainingTypeCMD },
                    { name: 'Scheduled Date in UTC:', value: scheduledDateCMD },
                    { name: 'Scheduled Start in UTC:', value: scheduledStartCMD },
                    { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                    { name: 'Additional Info:', value: additionalInfoCMD }
                )
                .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.'});
                client.users.send(interaction.user.id, {
                    embeds: [creatorEmbed]
                });
            };

            const linkButton = new ButtonBuilder()
	            .setLabel('Read the training guides before attending')
                .setURL("https://guides.polartracks.no/start")
	            .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder()
                .addComponents(linkButton);

            const publicEmbed = new EmbedBuilder()
            .setTitle(`New ${trainingTypeCMD} training!`)
            .setDescription('React to this message if you are planning to attend.')
            .addFields(
                { name: 'Host:', value: rblxName },
                { name: 'Start:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                { name: 'Additional Info:', value: additionalInfoCMD }
            )
            .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.'});
            client.users.send(id, {
                embeds: [trainingEmbed]
            });

            const message = trainingChannel.send({
                content: '<@&1140220447535923200>',
                embeds: [publicEmbed],
                components: [row]
            });

            message.react('✅')
    
            interaction.editReply({
                content: 'The training has been scheduled.',
                ephemeral: true
            });  
        } catch (error) {
            console.warn(error)
        };

    },
    opTeamOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
