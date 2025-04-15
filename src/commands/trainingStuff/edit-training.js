const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const trainings = require('../../utils/trainings.js');

const { isValidDateFormat, isValidTimeFormat } = require('../../utils/dateTimeUtils.js');

function updateTeamup(newStartDate, type, id, host) {
    const endDate = new Date(newStartDate);
    endDate.setMinutes(newStartDate.getMinutes() + 120);

    const startISO = newStartDate.toISOString().replace('.000', '');
    const endISO = endDate.toISOString().replace('.000', '');

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

    const jsondata = { id: id, subcalendar_ids: [subcalendar], start_dt: startISO, end_dt: endISO, title: `${type} training`, who: host, signup_enabled: false, comments_enabled: false };

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
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName('id')
                .setDescription('What is the ID of the training?')
                .setRequired(true))
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
                .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const trainingChannel = client.channels.cache.get('1337095950027456603');

        const idCMD = interaction.options.getString('id')
        const timezone = interaction.options.getString('timezone');
        const updatedDateCMD = interaction.options.getString('date');
        const updatedStartCMD = interaction.options.getString('time');

        if (!isValidDateFormat(updatedDateCMD)) {
            return interaction.reply({
                content: 'Incorrect date format! Please use this format: dd/mm/yyyy',
                ephemeral: true
            });
        };

        if (!isValidTimeFormat(updatedStartCMD)) {
            return interaction.reply({
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

        await interaction.deferReply({
            ephemeral: true
        });

        try {
            const splitDate = updatedDateCMD.split('/');
            const splitTime = updatedStartCMD.split(':');

            const localDate = DateTime.fromObject({
                day: parseInt(splitDate[0]),
                month: parseInt(splitDate[1]),
                year: parseInt(splitDate[2]),
                hour: parseInt(splitTime[0]),
                minute: parseInt(splitTime[1])
            }, { zone: interaction.options.getString('timezone') });

            const dateCMD = localDate.setZone('UTC').toJSDate();

            const timestampMilli = dateCMD.getTime();
            const timestampCMD = Math.floor(timestampMilli / 1000);

            const training = await trainings.findById(idCMD).exec();

            if (!training) {
                return interaction.editReply({
                    content: 'This training does not exist.',
                    ephemeral: true
                });
            };

            const type = training.trainingType;
            const oldTimestamp = training.timestamp;
            const teamupId = training.teamupId;
            const rblxName = training.hostRobloxUsername;

            updateTeamup(dateCMD, type, teamupId, rblxName);

            training.date = dateCMD;

            training.timestamp = timestampCMD;

            training.markModified('date');

            await training.save();

            const timeChangedEmbed = new EmbedBuilder()
                .setTitle(`A ${type} training has changed!`)
                .setDescription(`Time: <t:${oldTimestamp}:F> -> <t:${training.timestamp}:F> \n**Info:** \nHost: ${rblxName}`)

            trainingChannel.send({
                embeds: [timeChangedEmbed]
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