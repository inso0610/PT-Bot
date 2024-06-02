const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('request-training')
    .setDescription('Use this command to request a training.')
    .addStringOption((option) => 
        option
            .setName('date')
            .setDescription('What date should the training be hosted?')
            .setRequired(true))
    .addStringOption((option) => 
        option
            .setName('time')
            .setDescription('When should the training be hosted? Time should be in UTC.')
            .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');

        const requestChannel = client.channels.cache.get('1243281611198435338');

        function createEmbed(type) {
            return new EmbedBuilder()
            .setTitle(`${type} Training Request`)
            .setFields(
                { name: 'User:', value: `<@${interaction.member.id}>` },
                { name: 'Date:', value: date },
                { name: 'Time:', value: time }
            );
        };

        function createButtonRow() {
            const confirmButton = new ButtonBuilder()
			.setCustomId('confirm-training')
			.setLabel('Accept Training')
			.setStyle(ButtonStyle.Success);

            const denyButton = new ButtonBuilder()
			.setCustomId('deny-training')
			.setLabel('Deny Training')
			.setStyle(ButtonStyle.Danger);

            return new ActionRowBuilder()
            .addComponents(confirmButton, denyButton);
        }

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
                ephemeral: true
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
                ephemeral: true
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
                ephemeral: true
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
                ephemeral: true
            });
        } else if (interaction.member.roles.cache.has('1111370796439453777') &&	!interaction.member.roles.cache.has('1138884023465283696')) { //Is user Manager without QUS? 
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
                ephemeral: true
            });
        } else {
            interaction.reply({
                content: 'Request failed. You are not in the group or you are fully train.',
                ephemeral: true
            });
        };
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