const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { isValidDateFormat, isValidTimeFormat } = require('../../utils/dateTimeUtils.js');
const { autocomplete } = require('../application-stuff/application.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request-training')
        .setDescription('Use this command to request a training.')
        .setContexts(['Guild'])
        .addStringOption((option) =>
            option
                .setName('timezone')
                .setDescription('What timezone are you in? Example: Europe/Oslo')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption((option) =>
            option
                .setName('date')
                .setDescription('What date should the training be hosted? Format: dd/mm/yyyy')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('time')
                .setDescription('When should the training be hosted? Format: hh:mm')
                .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const timezone = interaction.options.getString('timezone');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');

        const requestChannel = client.channels.cache.get('1243281611198435338');

        function createEmbed(type) {
            return new EmbedBuilder()
                .setTitle(`${type} Training Request`)
                .setFields(
                    { name: 'User:', value: `<@${interaction.member.id}>` },
                    { name: 'Timezone:', value: timezone },
                    { name: 'Date:', value: date },
                    { name: 'Time:', value: time }
                );
        };

        if (!isValidDateFormat(date)) {
            return interaction.reply({
                content: 'Incorrect date format! Please use this format: dd/mm/yyyy',
                flags: MessageFlags.Ephemeral
            });
        };

        if (!isValidTimeFormat(time)) {
            return interaction.reply({
                content: 'Incorrect time format! Please use this format: hh:mm',
                flags: MessageFlags.Ephemeral
            });
        };

        const timezones = Intl.supportedValuesOf('timeZone');

        if (!timezones.includes(timezone)) {
            return interaction.reply({
                content: 'Incorrect timezone! Please use a valid timezone.',
                flags: MessageFlags.Ephemeral
            });
        };

        function createButtonRow() {
            const confirmButton = new ButtonBuilder()
                .setCustomId('create-training')
                .setLabel('Create Training from information')
                .setStyle(ButtonStyle.Primary);

            const testButton = new ButtonBuilder()
                .setCustomId('test-training-req')
                .setLabel('Test training information')
                .setStyle(ButtonStyle.Secondary);

            return new ActionRowBuilder()
                .addComponents(confirmButton, testButton);
        };

        if (interaction.member.roles.cache.has('1089284424543260763')) { //Is user Passenger? 
            const embed = createEmbed('Driver');

            const row = createButtonRow();

            const requestMessage = await requestChannel.send({
                content: '<@&1089284413684199474>',
                embeds: [embed],
                components: [row],
            });

            requestMessage.startThread({
                name: 'Driver Training Request',
                autoArchiveDuration: 60,
                reason: 'Driver Training Request thread.',
            });

            interaction.reply({
                content: 'Your Driver Training request has been sent!',
                flags: MessageFlags.Ephemeral
            });
        } else if (interaction.member.roles.cache.has('1140337698335371384')) { //Is user Driver? 
            const embed = createEmbed('Dispatcher');

            const row = createButtonRow();

            const requestMessage = await requestChannel.send({
                content: '<@&1089284411763204197>',
                embeds: [embed],
                components: [row],
            });

            requestMessage.startThread({
                name: 'Dispatcher Training Request',
                autoArchiveDuration: 60,
                reason: 'Dispatcher Training Request thread.',
            });

            interaction.reply({
                content: 'Your Dispatcher Training request has been sent!',
                flags: MessageFlags.Ephemeral
            });
        } else if (interaction.member.roles.cache.has('1089284420143419503')) { //Is user Conductor? 
            const embed = createEmbed('Dispatcher');

            const row = createButtonRow();

            const requestMessage = await requestChannel.send({
                content: '<@&1089284411763204197>',
                embeds: [embed],
                components: [row],
            });

            requestMessage.startThread({
                name: 'Dispatcher Training Request',
                autoArchiveDuration: 60,
                reason: 'Dispatcher Training Request thread.',
            });

            interaction.reply({
                content: 'Your Dispatcher Training request has been sent!',
                flags: MessageFlags.Ephemeral
            });
        } else if (interaction.member.roles.cache.has('1089284418541199522')) { //Is user Dispatcher? 
            const embed = createEmbed('Signaller');

            const row = createButtonRow();

            const requestMessage = await requestChannel.send({
                content: '<@&1089284410332942366>',
                embeds: [embed],
                components: [row],
            });

            requestMessage.startThread({
                name: 'Signaller Training Request',
                autoArchiveDuration: 60,
                reason: 'Signaller Training Request thread.',
            });

            interaction.reply({
                content: 'Your Signaller Training request has been sent!',
                flags: MessageFlags.Ephemeral
            });
        } else if (interaction.member.roles.cache.has('1111370796439453777') && !interaction.member.roles.cache.has('1138884023465283696')) { //Is user Manager without QUS? 
            const embed = createEmbed('Signaller');

            const row = createButtonRow();

            const requestMessage = await requestChannel.send({
                content: '<@&1089284410332942366>',
                embeds: [embed],
                components: [row],
            });

            requestMessage.startThread({
                name: 'Signaller Training Request',
                autoArchiveDuration: 60,
                reason: 'Signaller Training Request thread.',
            });

            interaction.reply({
                content: 'Your Signaller Training request has been sent!',
                flags: MessageFlags.Ephemeral
            });
        } else {
            interaction.reply({
                content: 'Request failed. Either you are not in the group or you are fully trained.',
                flags: MessageFlags.Ephemeral
            });
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

    trainingReqBlacklist: true,

    options: {
        devOnly: false,
        guildOnly: false,
        userPermissions: [],
        botPermissions: ['Administrator'],
        deleted: false,
    },
};