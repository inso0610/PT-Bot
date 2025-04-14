const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const model = require('../../utils/trainings.js');
const { isValidDateFormat, isValidTimeFormat } = require('../../utils/dateTimeUtils.js');

const guides = {
    Driver: 'https://guides.polartracks.no/driver-guides',
    Conductor: 'https://guides.polartracks.no/conductor-guides',
    Dispatcher: 'https://guides.polartracks.no/dispatcher-guides',
    Signaller: 'https://guides.polartracks.no/signaller-guides'
}

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

    const startISO = startDate.toISOString().replace('.000', '')
    const endISO = endDate.toISOString().replace('.000', '')

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

    const jsondata = { subcalendar_ids: [subcalendar], start_dt: startISO, end_dt: endISO, title: `${type} training`, who: host, signup_enabled: false, comments_enabled: false };

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
        .setDMPermission(false)
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
                .setName('timezone')
                .setDescription('What timezone are you in? Example: Europe/Oslo')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption((option) =>
            option
                .setName('date')
                .setDescription('Format: dd/mm/yyyy.')
                .setRequired(true))

        .addStringOption((option) =>
            option
                .setName('time')
                .setDescription('Format: hh:mm.')
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
        await interaction.deferReply({
            ephemeral: true
        });

        try {
            const hostCMD = interaction.options.getUser('host') ?? interaction.user;
            const id = hostCMD.id
            const trainingTypeCMD = interaction.options.getString('type');
            const timezone = interaction.options.getString('timezone');
            const scheduledDateCMD = interaction.options.getString('date');
            const scheduledStartCMD = interaction.options.getString('time');
            const additionalInfoCMD = interaction.options.getString('additional-info') ?? 'No additional information.';

            if (!isValidDateFormat(scheduledDateCMD)) {
                return interaction.editReply({
                    content: 'Incorrect date format! Please use this format: dd/mm/yyyy',
                    ephemeral: true
                });
            };

            if (!isValidTimeFormat(scheduledStartCMD)) {
                return interaction.editReply({
                    content: 'Incorrect time format! Please use this format: hh:mm',
                    ephemeral: true
                });
            };

            const timezones = Intl.supportedValuesOf('timeZone');

            if (!timezones.includes(timezone)) {
                return interaction.reply({
                    content: 'Incorrect timezone! Please use a valid timezone.',
                    ephemeral: true
                });
            };

            const trainingChannel = client.channels.cache.get('1337095950027456603');

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

            const localDate = DateTime.fromObject({
                day: parseInt(splitDate[0]),
                month: parseInt(splitDate[1]),
                year: parseInt(splitDate[2]),
                hour: parseInt(splitTime[0]),
                minute: parseInt(splitTime[1])
            }, { zone: timezone });

            const dateCMD = localDate.setZone('UTC').toJSDate();

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
                    { name: 'Timezone:', value: timezone },
                    { name: 'Scheduled Date in timezone:', value: scheduledDateCMD },
                    { name: 'Scheduled Start in timezone:', value: scheduledStartCMD },
                    { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                    { name: 'Additional Info:', value: additionalInfoCMD }
                )
                .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.' });

            if (hostCMD != interaction.user) {
                const creatorEmbed = new EmbedBuilder()
                    .setTitle('You have created a training for another user.')
                    .setDescription(`**When making changes use this id: ${trainingId}**`)
                    .addFields(
                        { name: 'Host Discord ID:', value: id },
                        { name: 'Host Roblox ID:', value: rblxId },
                        { name: 'Host Roblox Username:', value: rblxName },
                        { name: 'Training Type:', value: trainingTypeCMD },
                        { name: 'Timezone:', value: timezone },
                        { name: 'Scheduled Date in timezone:', value: scheduledDateCMD },
                        { name: 'Scheduled Start in timezone:', value: scheduledStartCMD },
                        { name: 'Timestamp:', value: `<t:${timestampCMD.toString()}:F> (<t:${timestampCMD.toString()}:R>)` },
                        { name: 'Additional Info:', value: additionalInfoCMD }
                    )
                    .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.' });
                client.users.send(interaction.user.id, {
                    embeds: [creatorEmbed]
                });
            };

            const linkButton = new ButtonBuilder()
                .setLabel('You should read the training guide before attending')
                .setURL(guides[trainingTypeCMD])
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
                .setFooter({ text: 'This message does not update. For updated information, please check the message at the top of the trainings channel.' });
            client.users.send(id, {
                embeds: [trainingEmbed]
            });

            const message = await trainingChannel.send({
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

    autocomplete: async ({ interaction, client, handler }) => {
        const focusedValue = interaction.options.getFocused();
        const timezones = Intl.supportedValuesOf('timeZone');

        const filteredTimezones = timezones
            .filter((timezone) => timezone.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25) // Limit to 25 results
            .map((timezone) => ({ name: timezone, value: timezone }));

        await interaction.respond(filteredTimezones);
    },

    opTeamOnly: true,

    options: {
        devOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};
